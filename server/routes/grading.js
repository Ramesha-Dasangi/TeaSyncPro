import express from 'express';
import { query, getOne, execute } from '../config/dbAdapter.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();
const GRADING_ROLES = ['Administrator', 'Factory Manager', 'Grading Officer', 'Packaging Officer', 'Inventory Officer'];

// GET all finished outputs (packaged lots)
router.get('/', requireAuth, (req, res) => {
  try {
    const outputs = query(`
      SELECT 
        fo.*,
        tg.grade_name,
        tg.description AS grade_description,
        pb.batch_code,
        pb.prod_date
      FROM finished_output fo
      JOIN tea_grade tg ON fo.grade_id = tg.grade_id
      JOIN production_batch pb ON fo.batch_id = pb.batch_id
      ORDER BY fo.output_id DESC
    `);
    res.json(outputs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new finished output (packaging lot)
router.post('/', requireAuth, requireRole(...GRADING_ROLES), (req, res) => {
  try {
    const {
      batch_id,
      grade_id,
      lot_number,
      out_date,
      quantity_bags = 1,
      net_weight_kg,
      unit_cost = 0,
      tax_percentage = 8.00
    } = req.body;

    const lotNo = lot_number || `LOT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const date = out_date || new Date().toISOString().slice(0, 10);
    const bags = parseInt(quantity_bags, 10) || 1;
    const weight = parseFloat(net_weight_kg) || (bags * 50);
    const cost = parseFloat(unit_cost) || 0;
    const tax = parseFloat(tax_percentage) || 8.0;

    const result = execute(`
      INSERT INTO finished_output (
        batch_id, grade_id, lot_number, out_date, quantity_bags, net_weight_kg, unit_cost, tax_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [batch_id, grade_id, lotNo, date, bags, weight, cost, tax]);

    const newOutput = getOne(`
      SELECT 
        fo.*,
        tg.grade_name,
        tg.description AS grade_description,
        pb.batch_code,
        pb.prod_date
      FROM finished_output fo
      JOIN tea_grade tg ON fo.grade_id = tg.grade_id
      JOIN production_batch pb ON fo.batch_id = pb.batch_id
      WHERE fo.output_id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json(newOutput);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE finished output
router.delete('/:id', requireAuth, requireRole(...GRADING_ROLES), (req, res) => {
  try {
    const { id } = req.params;
    execute(`DELETE FROM finished_output WHERE output_id = ?`, [id]);
    res.json({ message: 'Finished output record deleted', id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET tea grades
router.get('/grades', requireAuth, (req, res) => {
  try {
    const grades = query(`
      SELECT 
        tg.*,
        COALESCE(SUM(fo.quantity_bags), 0) AS total_bags,
        COALESCE(SUM(fo.net_weight_kg), 0) AS total_weight_kg
      FROM tea_grade tg
      LEFT JOIN finished_output fo ON tg.grade_id = fo.grade_id
      GROUP BY tg.grade_id
      ORDER BY tg.grade_id ASC
    `);
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
