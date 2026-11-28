import express from 'express';
import { query, getOne, execute } from '../config/dbAdapter.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all collections with supplier, schedule, and rate details
router.get('/', requireAuth, (req, res) => {
  try {
    const collections = query(`
      SELECT 
        c.*,
        s.name AS supplier_name,
        s.supplier_type,
        cs.route_name,
        cs.vehicle_no,
        r.rate_per_kg
      FROM tea_collection c
      LEFT JOIN supplier s ON c.supplier_id = s.supplier_id
      LEFT JOIN collection_schedule cs ON c.schedule_id = cs.schedule_id
      LEFT JOIN daily_leaf_rate r ON c.rate_id = r.rate_id
      ORDER BY c.collection_id DESC
    `);
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new collection
router.post('/', requireAuth, requireRole('Administrator', 'Factory Manager', 'Collection Officer'), (req, res) => {
  try {
    const {
      slip_no,
      schedule_id = 1,
      supplier_id,
      date,
      time,
      gross_weight,
      water_deduction_kg = 0,
      bag_deduction_kg = 0,
      rate_id = 1
    } = req.body;

    const gross = parseFloat(gross_weight);
    const water = parseFloat(water_deduction_kg) || 0;
    const bag = parseFloat(bag_deduction_kg) || 0;
    if (!Number.isFinite(gross) || gross <= 0 || water < 0 || bag < 0 || (water + bag) > gross) {
      return res.status(400).json({ error: 'Invalid weight values: gross_weight must be > 0 and deductions cannot exceed gross weight.' });
    }
    const net = Math.max(0, gross - water - bag);

    const generatedSlip = slip_no || `SLIP-${Date.now().toString().slice(-6)}`;
    const collectionDate = date || new Date().toISOString().slice(0, 10);
    const collectionTime = time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const result = execute(`
      INSERT INTO tea_collection (
        slip_no, schedule_id, supplier_id, date, time,
        gross_weight, water_deduction_kg, bag_deduction_kg, net_weight, rate_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [generatedSlip, schedule_id, supplier_id, collectionDate, collectionTime, gross, water, bag, net, rate_id]);

    const newRecord = getOne(`
      SELECT 
        c.*,
        s.name AS supplier_name,
        s.supplier_type,
        cs.route_name,
        cs.vehicle_no,
        r.rate_per_kg
      FROM tea_collection c
      LEFT JOIN supplier s ON c.supplier_id = s.supplier_id
      LEFT JOIN collection_schedule cs ON c.schedule_id = cs.schedule_id
      LEFT JOIN daily_leaf_rate r ON c.rate_id = r.rate_id
      WHERE c.collection_id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update collection
router.put('/:id', requireAuth, requireRole('Administrator', 'Factory Manager', 'Collection Officer'), (req, res) => {
  try {
    const { id } = req.params;
    const {
      schedule_id,
      supplier_id,
      date,
      time,
      gross_weight,
      water_deduction_kg,
      bag_deduction_kg
    } = req.body;

    const gross = parseFloat(gross_weight) || 0;
    const water = parseFloat(water_deduction_kg) || 0;
    const bag = parseFloat(bag_deduction_kg) || 0;
    const net = Math.max(0, gross - water - bag);

    execute(`
      UPDATE tea_collection
      SET schedule_id = ?, supplier_id = ?, date = ?, time = ?,
          gross_weight = ?, water_deduction_kg = ?, bag_deduction_kg = ?, net_weight = ?
      WHERE collection_id = ?
    `, [schedule_id, supplier_id, date, time, gross, water, bag, net, id]);

    const updated = getOne(`SELECT * FROM tea_collection WHERE collection_id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE collection
router.delete('/:id', requireAuth, requireRole('Administrator', 'Factory Manager', 'Collection Officer'), (req, res) => {
  try {
    const { id } = req.params;
    execute(`DELETE FROM tea_collection WHERE collection_id = ?`, [id]);
    res.json({ message: 'Collection deleted successfully', id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET schedules
router.get('/meta/schedules', requireAuth, (req, res) => {
  try {
    const schedules = query(`SELECT * FROM collection_schedule ORDER BY date DESC`);
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST schedule
router.post('/meta/schedules', requireAuth, requireRole('Administrator', 'Factory Manager', 'Collection Officer'), (req, res) => {
  try {
    const { date, route_name, vehicle_no } = req.body;
    const result = execute(`
      INSERT INTO collection_schedule (date, route_name, vehicle_no)
      VALUES (?, ?, ?)
    `, [date, route_name, vehicle_no]);
    const newSchedule = getOne(`SELECT * FROM collection_schedule WHERE schedule_id = ?`, [result.lastInsertRowid]);
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET rates
router.get('/meta/rates', requireAuth, (req, res) => {
  try {
    const rates = query(`SELECT * FROM daily_leaf_rate ORDER BY effective_date DESC`);
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST rate
router.post('/meta/rates', requireAuth, requireRole('Administrator', 'Factory Manager', 'Finance Officer'), (req, res) => {
  try {
    const { effective_date, rate_per_kg } = req.body;
    const result = execute(`
      INSERT INTO daily_leaf_rate (effective_date, rate_per_kg)
      VALUES (?, ?)
    `, [effective_date, rate_per_kg]);
    const newRate = getOne(`SELECT * FROM daily_leaf_rate WHERE rate_id = ?`, [result.lastInsertRowid]);
    res.status(201).json(newRate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
