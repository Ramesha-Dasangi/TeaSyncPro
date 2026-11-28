import express from 'express';
import { query, getOne, execute } from '../config/dbAdapter.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all supplier payments
router.get('/payments', requireAuth, requireRole('Administrator', 'Factory Manager', 'Finance Officer', 'Supplier'), async (req, res) => {
  try {
    if (req.user.role === 'Supplier') {
      const supId = req.user.supplier_id || 1;
      const payments = await query(`
        SELECT p.*, s.name AS supplier_name, s.phone AS supplier_phone, s.bank_name, s.bank_account
        FROM supplier_payment p
        JOIN supplier s ON p.supplier_id = s.supplier_id
        WHERE p.supplier_id = ?
        ORDER BY p.payment_id DESC
      `, [supId]);
      return res.json(payments);
    }
    const payments = await query(`
      SELECT 
        p.*,
        s.name AS supplier_name,
        s.phone AS supplier_phone,
        s.bank_name,
        s.bank_account
      FROM supplier_payment p
      JOIN supplier s ON p.supplier_id = s.supplier_id
      ORDER BY p.payment_id DESC
    `);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new supplier payment
router.post('/payments', requireAuth, requireRole('Administrator', 'Factory Manager', 'Finance Officer'), async (req, res) => {
  try {
    const {
      invoice_no,
      supplier_id,
      billing_month,
      pay_date,
      total_leaf_kg,
      avg_rate_per_kg,
      deductions = 0,
      payment_method = 'Bank Transfer',
      payment_status = 'Pending'
    } = req.body;

    const inv = invoice_no || `INV-${new Date().toISOString().slice(0, 7)}-${Date.now().toString().slice(-3)}`;
    const month = billing_month || new Date().toISOString().slice(0, 7);
    const date = pay_date || new Date().toISOString().slice(0, 10);
    const leaf = parseFloat(total_leaf_kg) || 0;
    const rate = parseFloat(avg_rate_per_kg) || 150.00;
    const gross = leaf * rate;
    const ded = parseFloat(deductions) || 0;
    const net = Math.max(0, gross - ded);

    const result = await execute(`
      INSERT INTO supplier_payment (
        invoice_no, supplier_id, billing_month, pay_date, total_leaf_kg,
        avg_rate_per_kg, gross_amount, deductions, net_payable, payment_method, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [inv, supplier_id, month, date, leaf, rate, gross, ded, net, payment_method, payment_status]);

    const newPayment = await getOne(`
      SELECT 
        p.*,
        s.name AS supplier_name,
        s.phone AS supplier_phone,
        s.bank_name,
        s.bank_account
      FROM supplier_payment p
      JOIN supplier s ON p.supplier_id = s.supplier_id
      WHERE p.payment_id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json(newPayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update payment status (e.g., mark as 'Paid')
router.put('/payments/:id/status', requireAuth, requireRole('Administrator', 'Factory Manager', 'Finance Officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status = 'Paid' } = req.body;

    await execute(`UPDATE supplier_payment SET payment_status = ? WHERE payment_id = ?`, [payment_status, id]);
    const updated = await getOne(`SELECT * FROM supplier_payment WHERE payment_id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
