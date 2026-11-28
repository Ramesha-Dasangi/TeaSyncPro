import express from 'express';
import { query, getOne } from '../config/dbAdapter.js';

const router = express.Router();

router.get('/summary', (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const leafStats = getOne(`
      SELECT 
        COALESCE(SUM(gross_weight), 0) AS total_gross_kg,
        COALESCE(SUM(net_weight), 0) AS total_net_kg,
        COUNT(collection_id) AS total_intakes
      FROM tea_collection
    `);

    const supplierCount = getOne(`SELECT COUNT(supplier_id) AS count FROM supplier`);
    const batchCount = getOne(`SELECT COUNT(batch_id) AS total_batches, COUNT(CASE WHEN batch_status = 'In Progress' THEN 1 END) AS active_batches FROM production_batch`);
    const finishedStats = getOne(`
      SELECT 
        COALESCE(SUM(quantity_bags), 0) AS total_bags,
        COALESCE(SUM(net_weight_kg), 0) AS total_finished_kg,
        COALESCE(SUM(quantity_bags * unit_cost), 0) AS total_valuation
      FROM finished_output
    `);
    const paymentStats = getOne(`
      SELECT 
        COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN net_payable ELSE 0 END), 0) AS total_paid,
        COALESCE(SUM(CASE WHEN payment_status = 'Pending' THEN net_payable ELSE 0 END), 0) AS total_pending
      FROM supplier_payment
    `);
    const currentRate = getOne(`SELECT rate_per_kg FROM daily_leaf_rate ORDER BY effective_date DESC LIMIT 1`);

    res.json({
      leafStats,
      totalSuppliers: supplierCount?.count || 0,
      batchStats: batchCount,
      finishedStats,
      paymentStats,
      currentRate: currentRate?.rate_per_kg || 150.00
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
