import express from 'express';
import crypto from 'node:crypto';
import { query, getOne, execute } from '../config/dbAdapter.js';
import { signToken, requireAuth, requireRole, rateLimitLogin } from '../middleware/authMiddleware.js';

const router = express.Router();
const resetTokens = new Map(); // username -> { codeHash, expiresAt, attempts }

function hashResetCode(code) {
  return crypto.createHash('sha256').update(String(code).trim()).digest();
}

function createScryptHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const keyHex = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${keyHex}`;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.startsWith('scrypt:')) return false;

  const [, salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  return derived.length === keyBuf.length && crypto.timingSafeEqual(derived, keyBuf);
}

// POST /api/auth/register — public supplier self-registration
router.post('/register', rateLimitLogin, async (req, res) => {
  try {
    const { name, phone, email, address, bank_name, bank_account, transport_mode, username, password } = req.body || {};

    if (!name || !phone || !username || !password) {
      return res.status(400).json({ error: 'Name, phone, username and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check username uniqueness
    const existing = await getOne('SELECT user_id FROM user WHERE username = ?', [username.trim()]);
    if (existing) {
      return res.status(409).json({ error: 'Username already taken. Please choose another.' });
    }

    // Create supplier record
    const regDate = new Date().toISOString().slice(0, 10);
    const supplierResult = await execute(
      'INSERT INTO supplier (name, supplier_type, phone, email, address, bank_name, bank_account, registered_date, transport_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), 'Smallholder', phone.trim(), email || null, address?.trim() || 'Not Provided', bank_name || null, bank_account || null, regDate, transport_mode || 'Own Vehicle']
    );
    const supplierId = supplierResult.lastInsertRowid;

    // Hash password with scrypt
    const passwordHash = createScryptHash(password);

    // Create user account linked to supplier
    await execute(
      'INSERT INTO user (username, email, password_hash, role, status, employee_id) VALUES (?, ?, ?, ?, ?, ?)',
      [username.trim(), email || null, passwordHash, 'Supplier', 'Active', null]
    );

    res.status(201).json({
      message: 'Registration successful. You can now log in with your credentials.',
      username: username.trim(),
      supplier_id: supplierId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', rateLimitLogin, async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await getOne(`
      SELECT
        u.user_id,
        u.username,
        u.email,
        u.password_hash,
        u.role,
        u.status,
        u.employee_id,
        e.name AS employee_name
      FROM user u
      LEFT JOIN employee e ON u.employee_id = e.employee_id
      WHERE u.username = ?
      LIMIT 1
    `, [username.trim()]);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (user.status && user.status !== 'Active') {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    let supplierRecord = null;
    if (user.role === 'Supplier') {
      if (user.email) {
        supplierRecord = await getOne('SELECT supplier_id, name FROM supplier WHERE email = ? LIMIT 1', [user.email]);
      }
      if (!supplierRecord) {
        supplierRecord = await getOne('SELECT supplier_id, name FROM supplier ORDER BY supplier_id ASC LIMIT 1');
      }
    }

    const userPayload = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      employee_id: user.employee_id,
      supplier_id: user.role === 'Supplier' ? (supplierRecord?.supplier_id || 1) : null,
      name: user.employee_name || supplierRecord?.name || user.username
    };

    const token = signToken(userPayload);
    res.json({ ...userPayload, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password — verify username + registered email & issue 6-digit OTP
router.post('/forgot-password', rateLimitLogin, async (req, res) => {
  try {
    const { username, email } = req.body || {};
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and registered email are required' });
    }

    const cleanUser = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    const user = await getOne(
      'SELECT user_id, username, email, status FROM user WHERE username = ? LIMIT 1',
      [cleanUser]
    );

    if (!user || !user.email || user.email.trim().toLowerCase() !== cleanEmail) {
      return res.status(404).json({ error: 'Username and registered email do not match an active account' });
    }
    if (user.status && user.status !== 'Active') {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    resetTokens.set(cleanUser, {
      codeHash: hashResetCode(code),
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0
    });

    console.log(`[AUTH] Password reset code for ${cleanUser} (${user.email}): ${code}`);

    res.json({
      message: 'Verification code generated for your registered email.',
      ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {})
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password — verify OTP and update scrypt password_hash in DB
router.post('/reset-password', rateLimitLogin, async (req, res) => {
  try {
    const { username, code, newPassword } = req.body || {};
    if (!username || !code || !newPassword) {
      return res.status(400).json({ error: 'Username, reset code, and new password are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const cleanUser = username.trim();
    const entry = resetTokens.get(cleanUser);
    if (!entry || Date.now() > entry.expiresAt) {
      resetTokens.delete(cleanUser);
      return res.status(400).json({ error: 'Reset code is invalid or expired. Please request a new code.' });
    }

    if (entry.attempts >= 5) {
      resetTokens.delete(cleanUser);
      return res.status(429).json({ error: 'Too many invalid reset attempts. Please request a new code.' });
    }

    const candidateHash = hashResetCode(code);
    if (!crypto.timingSafeEqual(candidateHash, entry.codeHash)) {
      entry.attempts += 1;
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    const passwordHash = createScryptHash(newPassword);
    await execute('UPDATE user SET password_hash = ? WHERE username = ?', [passwordHash, cleanUser]);
    resetTokens.delete(cleanUser);

    res.json({ message: 'Password updated successfully. You can now sign in with your new password.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users
router.get('/users', requireAuth, requireRole('Administrator', 'Factory Manager'), async (req, res) => {
  try {
    const users = await query(`
      SELECT
        u.user_id,
        u.username,
        u.email,
        u.role,
        u.status,
        u.employee_id,
        COALESCE(e.name, u.username) AS name
      FROM user u
      LEFT JOIN employee e ON u.employee_id = e.employee_id
      ORDER BY u.user_id ASC
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
