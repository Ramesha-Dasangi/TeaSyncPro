import express from 'express';
import { query, getOne, execute } from '../config/dbAdapter.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all suppliers
router.get('/', requireAuth, (req, res) => {
  try {
    const suppliers = query(`
      SELECT 
        s.*,
        COUNT(c.collection_id) AS total_deliveries,
        COALESCE(SUM(c.net_weight), 0) AS total_weight_kg
      FROM supplier s
      LEFT JOIN tea_collection c ON s.supplier_id = c.supplier_id
      GROUP BY s.supplier_id
      ORDER BY s.name ASC
    `);
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single supplier by ID
router.get('/:id', requireAuth, (req, res) => {
  try {
    const supplier = getOne(`SELECT * FROM supplier WHERE supplier_id = ?`, [req.params.id]);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    const collections = query(`SELECT * FROM tea_collection WHERE supplier_id = ? ORDER BY date DESC`, [req.params.id]);
    res.json({ ...supplier, collections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new supplier
router.post('/', requireAuth, requireRole('Administrator', 'Factory Manager', 'Collection Officer', 'Finance Officer'), (req, res) => {
  try {
    const {
      name,
      supplier_type = 'Commercial',
      phone,
      email = null,
      address,
      bank_name = null,
      bank_account = null,
      registered_date,
      transport_mode = 'Own Vehicle'
    } = req.body;

    const regDate = registered_date || new Date().toISOString().slice(0, 10);

    const result = execute(`
      INSERT INTO supplier (
        name, supplier_type, phone, email, address, bank_name, bank_account, registered_date, transport_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, supplier_type, phone, email, address, bank_name, bank_account, regDate, transport_mode]);

    const newSupplier = getOne(`SELECT * FROM supplier WHERE supplier_id = ?`, [result.lastInsertRowid]);
    res.status(201).json(newSupplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update supplier
router.put('/:id', requireAuth, requireRole('Administrator', 'Factory Manager', 'Collection Officer', 'Finance Officer', 'Supplier'), (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      supplier_type,
      phone,
      email,
      address,
      bank_name,
      bank_account,
      transport_mode
    } = req.body;

    execute(`
      UPDATE supplier
      SET name = ?, supplier_type = ?, phone = ?, email = ?,
          address = ?, bank_name = ?, bank_account = ?, transport_mode = ?
      WHERE supplier_id = ?
    `, [name, supplier_type, phone, email, address, bank_name, bank_account, transport_mode, id]);

    const updated = getOne(`SELECT * FROM supplier WHERE supplier_id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE supplier
router.delete('/:id', requireAuth, requireRole('Administrator', 'Factory Manager'), (req, res) => {
  try {
    const { id } = req.params;
    execute(`DELETE FROM supplier WHERE supplier_id = ?`, [id]);
    res.json({ message: 'Supplier deleted successfully', id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
