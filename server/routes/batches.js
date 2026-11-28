import express from 'express';
import { query, getOne, execute } from '../config/dbAdapter.js';

const router = express.Router();

// GET all production batches with stage logs summary
router.get('/', (req, res) => {
  try {
    const batches = query(`
      SELECT 
        b.*,
        COUNT(l.stage_log_id) AS logged_stages,
        COALESCE(SUM(l.output_weight), b.input_qty) AS current_output
      FROM production_batch b
      LEFT JOIN production_stage_log l ON b.batch_id = l.batch_id
      GROUP BY b.batch_id
      ORDER BY b.batch_id DESC
    `);
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single batch with full logs
router.get('/:id', (req, res) => {
  try {
    const batch = getOne(`SELECT * FROM production_batch WHERE batch_id = ?`, [req.params.id]);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const logs = query(`
      SELECT 
        l.*,
        s.stage_name,
        s.stage_no
      FROM production_stage_log l
      JOIN production_stage s ON l.stage_id = s.stage_id
      WHERE l.batch_id = ?
      ORDER BY s.stage_no ASC
    `, [req.params.id]);

    res.json({ ...batch, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new production batch
router.post('/', (req, res) => {
  try {
    const {
      batch_code,
      prod_date,
      input_qty,
      wastage_qty = 0,
      batch_status = 'In Progress'
    } = req.body;

    const code = batch_code || `BATCH-${new Date().toISOString().slice(0, 7)}-${Date.now().toString().slice(-3)}`;
    const date = prod_date || new Date().toISOString().slice(0, 10);
    const qty = parseFloat(input_qty) || 0;
    const waste = parseFloat(wastage_qty) || 0;

    const result = execute(`
      INSERT INTO production_batch (batch_code, prod_date, input_qty, wastage_qty, batch_status)
      VALUES (?, ?, ?, ?, ?)
    `, [code, date, qty, waste, batch_status]);

    const newBatch = getOne(`SELECT * FROM production_batch WHERE batch_id = ?`, [result.lastInsertRowid]);
    res.status(201).json(newBatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update production batch
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { batch_status, wastage_qty, input_qty } = req.body;

    execute(`
      UPDATE production_batch
      SET batch_status = COALESCE(?, batch_status),
          wastage_qty = COALESCE(?, wastage_qty),
          input_qty = COALESCE(?, input_qty)
      WHERE batch_id = ?
    `, [batch_status, wastage_qty, input_qty, id]);

    const updated = getOne(`SELECT * FROM production_batch WHERE batch_id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all production stage logs
router.get('/logs/all', (req, res) => {
  try {
    const logs = query(`
      SELECT 
        l.*,
        b.batch_code,
        s.stage_name,
        s.stage_no
      FROM production_stage_log l
      JOIN production_batch b ON l.batch_id = b.batch_id
      JOIN production_stage s ON l.stage_id = s.stage_id
      ORDER BY l.stage_log_id DESC
    `);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST production stage log
router.post('/logs', (req, res) => {
  try {
    const {
      batch_id,
      stage_id,
      machine_no,
      input_weight,
      output_weight,
      temperature_celsius = null,
      start_time = null,
      end_time = null
    } = req.body;

    const inWeight = parseFloat(input_weight) || 0;
    const outWeight = parseFloat(output_weight) || 0;
    const loss = Math.max(0, inWeight - outWeight);

    const result = execute(`
      INSERT INTO production_stage_log (
        batch_id, stage_id, machine_no, input_weight, output_weight,
        weight_loss, temperature_celsius, start_time, end_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [batch_id, stage_id, machine_no, inWeight, outWeight, loss, temperature_celsius, start_time, end_time]);

    const newLog = getOne(`
      SELECT 
        l.*,
        b.batch_code,
        s.stage_name,
        s.stage_no
      FROM production_stage_log l
      JOIN production_batch b ON l.batch_id = b.batch_id
      JOIN production_stage s ON l.stage_id = s.stage_id
      WHERE l.stage_log_id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stages list
router.get('/meta/stages', (req, res) => {
  try {
    const stages = query(`SELECT * FROM production_stage ORDER BY stage_no ASC`);
    res.json(stages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
