import express from 'express';
import { query, getOne, execute } from '../config/dbAdapter.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all sales invoices
router.get('/', requireAuth, requireRole('Administrator', 'Factory Manager', 'Finance Officer', 'Inventory Officer', 'Grading Officer'), async (req, res) => {
  try {
    const invoices = await query(`SELECT * FROM sales_invoice ORDER BY invoice_id DESC`);
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new sales invoice (optionally depletes finished_output stock)
router.post('/', requireAuth, requireRole('Administrator', 'Factory Manager', 'Finance Officer', 'Inventory Officer'), async (req, res) => {
  try {
    const {
      invoice_no,
      buyer_name,
      invoice_date,
      total_weight_kg,
      total_amount,
      tax_amount = 0,
      payment_status = 'Pending',
      vehicle_no = null,
      output_id = null
    } = req.body;

    const weight = parseFloat(total_weight_kg);
    const amount = parseFloat(total_amount);
    if (!buyer_name || !Number.isFinite(weight) || weight <= 0 || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid buyer_name, positive total_weight_kg, and total_amount are required.' });
    }

    if (output_id) {
      const lot = await getOne(`SELECT * FROM finished_output WHERE output_id = ?`, [output_id]);
      if (!lot) return res.status(404).json({ error: 'Finished output lot not found.' });
      if (lot.net_weight_kg < weight) {
        return res.status(400).json({ error: `Insufficient lot stock (${lot.net_weight_kg} kg available).` });
      }
      await execute(`UPDATE finished_output SET net_weight_kg = net_weight_kg - ? WHERE output_id = ?`, [weight, output_id]);
    }

    const invNo = invoice_no || `SINV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const date = invoice_date || new Date().toISOString().slice(0, 10);

    const result = await execute(`
      INSERT INTO sales_invoice (
        invoice_no, buyer_name, invoice_date, total_weight_kg, total_amount, tax_amount, payment_status, vehicle_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [invNo, buyer_name.trim(), date, weight, amount, parseFloat(tax_amount) || 0, payment_status, vehicle_no]);

    const newInvoice = await getOne(`SELECT * FROM sales_invoice WHERE invoice_id = ?`, [result.lastInsertRowid]);
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update invoice payment status
router.put('/:id/status', requireAuth, requireRole('Administrator', 'Factory Manager', 'Finance Officer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status = 'Paid' } = req.body;
    await execute(`UPDATE sales_invoice SET payment_status = ? WHERE invoice_id = ?`, [payment_status, id]);
    const updated = await getOne(`SELECT * FROM sales_invoice WHERE invoice_id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
