import express from 'express';
import { query, getOne } from '../config/dbAdapter.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: build the counts object from DB
async function buildSummary() {
  const leafStats = await getOne(`
    SELECT 
      COALESCE(SUM(gross_weight), 0) AS total_gross_kg,
      COALESCE(SUM(net_weight), 0) AS total_net_kg,
      COUNT(collection_id) AS total_intakes
    FROM tea_collection
  `);
  const supplierCount = await getOne(`SELECT COUNT(supplier_id) AS count FROM supplier`);
  const userCount = await getOne(`SELECT COUNT(user_id) AS count FROM user`);
  const batchCount = await getOne(`SELECT COUNT(batch_id) AS total_batches, COUNT(CASE WHEN batch_status = 'In Progress' THEN 1 END) AS active_batches FROM production_batch`);
  const finishedStats = await getOne(`
    SELECT 
      COALESCE(SUM(quantity_bags), 0) AS total_bags,
      COALESCE(SUM(net_weight_kg), 0) AS total_finished_kg,
      COALESCE(SUM(quantity_bags * unit_cost), 0) AS total_valuation
    FROM finished_output
  `);
  const paymentStats = await getOne(`
    SELECT 
      COALESCE(SUM(CASE WHEN payment_status = 'Paid' THEN net_payable ELSE 0 END), 0) AS total_paid,
      COALESCE(SUM(CASE WHEN payment_status = 'Pending' THEN net_payable ELSE 0 END), 0) AS total_pending
    FROM supplier_payment
  `);
  const currentRate = await getOne(`SELECT rate_per_kg FROM daily_leaf_rate ORDER BY effective_date DESC LIMIT 1`);

  return {
    leafStats,
    totalSuppliers: supplierCount?.count || 0,
    totalUsers: userCount?.count || 0,
    batchStats: batchCount,
    finishedStats,
    paymentStats,
    currentRate: currentRate?.rate_per_kg || 150.00
  };
}

// PUBLIC — landing page & login page stats (no auth required)
router.get('/public-stats', async (req, res) => {
  try {
    const data = await buildSummary();
    res.json({
      totalBatches: data.batchStats?.total_batches || 0,
      totalSuppliers: data.totalSuppliers,
      totalUsers: data.totalUsers,
      totalCollections: data.leafStats?.total_intakes || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROTECTED — full summary for dashboard (requires JWT)
router.get('/summary', requireAuth, async (req, res) => {
  try {
    res.json(await buildSummary());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROTECTED — live role-scoped operational notifications from MySQL
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const role = req.user?.role || '';
    const notifications = [];

    if (role === 'Supplier') {
      const supId = req.user?.supplier_id || 1;

      const payments = await query(`
        SELECT payment_id, invoice_no, billing_month, pay_date, total_leaf_kg, net_payable, payment_method, payment_status
        FROM supplier_payment
        WHERE supplier_id = ?
        ORDER BY payment_id DESC
        LIMIT 6
      `, [supId]);

      for (const p of payments) {
        const isPending = p.payment_status === 'Pending';
        notifications.push({
          id: `pay-${p.payment_id}-${p.payment_status}`,
          type: isPending ? 'warning' : 'success',
          title: isPending ? `Pending Payment: ${p.invoice_no}` : `Payment Settled: ${p.invoice_no}`,
          body: isPending
            ? `Rs. ${Number(p.net_payable || 0).toLocaleString()} for ${p.total_leaf_kg} kg (${p.billing_month}) awaiting settlement.`
            : `Rs. ${Number(p.net_payable || 0).toLocaleString()} paid via ${p.payment_method || 'Bank Transfer'}.`,
          time: p.pay_date || p.billing_month,
          page: 'supplier_payments',
        });
      }

      const collections = await query(`
        SELECT collection_id, slip_no, date, time, gross_weight, net_weight
        FROM tea_collection
        WHERE supplier_id = ?
        ORDER BY collection_id DESC
        LIMIT 5
      `, [supId]);

      for (const c of collections) {
        notifications.push({
          id: `col-${c.collection_id}`,
          type: 'info',
          title: `Leaf Intake: ${c.slip_no}`,
          body: `${c.net_weight} kg net leaf (${c.gross_weight} kg gross) recorded at factory intake.`,
          time: `${c.date || ''} ${c.time || ''}`.trim(),
          page: 'collection',
        });
      }

      return res.json(notifications);
    }

    const isAdminOrManager = role === 'Administrator' || role === 'Factory Manager';
    const isProduction = isAdminOrManager || ['Withering Officer', 'Rolling Officer', 'Aeration Officer', 'Drying Officer'].includes(role);
    const isInventoryOrGrading = isAdminOrManager || ['Inventory Officer', 'Grading Officer', 'Packaging Officer'].includes(role);
    const isFinance = isAdminOrManager || role === 'Finance Officer';
    const isCollection = isAdminOrManager || role === 'Collection Officer' || role === 'Inventory Officer';

    // 1. Pending supplier payments (urgent warning)
    if (isFinance) {
      const pendingPays = await query(`
        SELECT p.payment_id, p.invoice_no, p.pay_date, p.total_leaf_kg, p.net_payable, p.payment_status, s.name AS supplier_name
        FROM supplier_payment p
        JOIN supplier s ON p.supplier_id = s.supplier_id
        WHERE p.payment_status = 'Pending'
        ORDER BY p.payment_id DESC
        LIMIT 5
      `);
      for (const p of pendingPays) {
        notifications.push({
          id: `pay-${p.payment_id}-Pending`,
          type: 'warning',
          title: `Pending Payment: ${p.invoice_no}`,
          body: `${p.supplier_name} — Rs. ${Number(p.net_payable || 0).toLocaleString()} (${p.total_leaf_kg} kg) awaiting approval.`,
          time: p.pay_date,
          page: 'finance',
        });
      }
    }

    // 2. Active & recent production batches
    if (isProduction || isInventoryOrGrading) {
      const batches = await query(`
        SELECT b.batch_id, b.batch_code, b.prod_date, b.input_qty, b.wastage_qty, b.batch_status, COUNT(l.stage_log_id) AS logged_stages
        FROM production_batch b
        LEFT JOIN production_stage_log l ON b.batch_id = l.batch_id
        GROUP BY b.batch_id
        ORDER BY b.batch_id DESC
        LIMIT 5
      `);
      for (const b of batches) {
        if (b.batch_status === 'In Progress') {
          notifications.push({
            id: `batch-${b.batch_id}-InProgress-${b.logged_stages}`,
            type: 'info',
            title: `Batch ${b.batch_code} In Progress`,
            body: `${b.input_qty} kg leaf input — ${b.logged_stages}/5 processing stages logged.`,
            time: b.prod_date,
            page: 'production',
          });
        } else if (b.batch_status === 'Completed') {
          notifications.push({
            id: `batch-${b.batch_id}-Completed`,
            type: 'success',
            title: `Batch ${b.batch_code} Completed`,
            body: `Production finished (${b.input_qty} kg input, ${b.wastage_qty} kg wastage). Ready for grading & stock.`,
            time: b.prod_date,
            page: isInventoryOrGrading ? 'grading' : 'production',
          });
        }
      }
    }

    // 3. Low stock tea grades (< 120 kg)
    if (isInventoryOrGrading) {
      const stockGrades = await query(`
        SELECT g.grade_id, g.grade_name, COALESCE(SUM(fo.net_weight_kg), 0) AS total_kg
        FROM tea_grade g
        LEFT JOIN finished_output fo ON g.grade_id = fo.grade_id
        GROUP BY g.grade_id, g.grade_name
        HAVING total_kg < 120
        ORDER BY total_kg ASC
        LIMIT 4
      `);
      for (const g of stockGrades) {
        const kg = Number(g.total_kg || 0);
        notifications.push({
          id: `lowstock-${g.grade_id}-${Math.round(kg)}`,
          type: 'warning',
          title: kg === 0 ? `Out of Stock: ${g.grade_name} Grade` : `Low Stock Alert: ${g.grade_name} Grade`,
          body: kg === 0
            ? `${g.grade_name} finished tea inventory is currently 0 kg.`
            : `${g.grade_name} stock is ${kg.toFixed(1)} kg (below 120 kg threshold).`,
          time: 'Live Inventory',
          page: 'inventory',
        });
      }
    }

    // 4. Recent leaf collections
    if (isCollection) {
      const recentCols = await query(`
        SELECT c.collection_id, c.slip_no, c.date, c.time, c.net_weight, s.name AS supplier_name, cs.route_name
        FROM tea_collection c
        LEFT JOIN supplier s ON c.supplier_id = s.supplier_id
        LEFT JOIN collection_schedule cs ON c.schedule_id = cs.schedule_id
        ORDER BY c.collection_id DESC
        LIMIT 3
      `);
      for (const c of recentCols) {
        notifications.push({
          id: `col-${c.collection_id}`,
          type: 'info',
          title: `Leaf Collection: ${c.slip_no}`,
          body: `${c.supplier_name || 'Supplier'} delivered ${c.net_weight} kg net leaf (${c.route_name || 'Estate Route'}).`,
          time: `${c.date || ''} ${c.time || ''}`.trim(),
          page: 'collection',
        });
      }
    }

    // 5. Recent sales invoices & settled payments
    if (isFinance || isInventoryOrGrading) {
      const sales = await query(`
        SELECT invoice_id, invoice_no, buyer_name, invoice_date, total_weight_kg, total_amount, payment_status
        FROM sales_invoice
        ORDER BY invoice_id DESC
        LIMIT 2
      `);
      for (const s of sales) {
        const isPaid = s.payment_status === 'Paid';
        notifications.push({
          id: `sale-${s.invoice_id}-${s.payment_status}`,
          type: isPaid ? 'success' : 'warning',
          title: `Sales Invoice ${s.payment_status}: ${s.invoice_no}`,
          body: `${s.buyer_name} — ${s.total_weight_kg} kg (Rs. ${Number(s.total_amount || 0).toLocaleString()}).`,
          time: s.invoice_date,
          page: 'finance',
        });
      }
    }

    if (isFinance) {
      const settledPays = await query(`
        SELECT p.payment_id, p.invoice_no, p.pay_date, p.net_payable, p.payment_method, s.name AS supplier_name
        FROM supplier_payment p
        JOIN supplier s ON p.supplier_id = s.supplier_id
        WHERE p.payment_status = 'Paid'
        ORDER BY p.payment_id DESC
        LIMIT 2
      `);
      for (const p of settledPays) {
        notifications.push({
          id: `pay-${p.payment_id}-Paid`,
          type: 'success',
          title: `Payment Settled: ${p.invoice_no}`,
          body: `${p.supplier_name} — Rs. ${Number(p.net_payable || 0).toLocaleString()} via ${p.payment_method || 'Bank Transfer'}.`,
          time: p.pay_date,
          page: 'finance',
        });
      }
    }

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
