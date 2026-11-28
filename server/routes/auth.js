import express from 'express';
import crypto from 'node:crypto';
import { query, getOne } from '../config/dbAdapter.js';
import { signToken, requireAuth, requireRole, rateLimitLogin } from '../middleware/authMiddleware.js';

const router = express.Router();

function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.startsWith('scrypt:')) return false;

  const [, salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  return derived.length === keyBuf.length && crypto.timingSafeEqual(derived, keyBuf);
}

// POST /api/auth/login
router.post('/login', rateLimitLogin, (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = getOne(`
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

    const userPayload = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      employee_id: user.employee_id,
      supplier_id: user.role === 'Supplier' ? 1 : null,
      name: user.employee_name || (user.role === 'Supplier' ? 'Asela Kumara' : user.username)
    };

    const token = signToken(userPayload);
    res.json({ ...userPayload, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users
router.get('/users', requireAuth, requireRole('Administrator', 'Factory Manager'), (req, res) => {
  try {
    const users = query(`
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
