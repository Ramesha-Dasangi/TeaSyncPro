import express from 'express';
import { query, getOne, execute } from '../config/dbAdapter.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET employees
router.get('/', requireAuth, requireRole('Administrator', 'Factory Manager', 'Finance Officer'), (req, res) => {
  try {
    const employees = query(`
      SELECT 
        e.*,
        u.user_id,
        u.username,
        u.role,
        u.email
      FROM employee e
      LEFT JOIN user u ON e.employee_id = u.employee_id
      ORDER BY e.employee_id ASC
    `);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST employee
router.post('/', requireAuth, requireRole('Administrator', 'Factory Manager'), (req, res) => {
  try {
    const { name, phone, status = 'Active', join_date } = req.body;
    const date = join_date || new Date().toISOString().slice(0, 10);
    const result = execute(`
      INSERT INTO employee (name, phone, status, join_date)
      VALUES (?, ?, ?, ?)
    `, [name, phone, status, date]);

    const newEmp = getOne(`SELECT * FROM employee WHERE employee_id = ?`, [result.lastInsertRowid]);
    res.status(201).json(newEmp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT employee
router.put('/:id', requireAuth, requireRole('Administrator', 'Factory Manager'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, status } = req.body;
    execute(`UPDATE employee SET name = ?, phone = ?, status = ? WHERE employee_id = ?`, [name, phone, status, id]);
    const updated = getOne(`SELECT * FROM employee WHERE employee_id = ?`, [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE employee
router.delete('/:id', requireAuth, requireRole('Administrator', 'Factory Manager'), (req, res) => {
  try {
    const { id } = req.params;
    execute(`DELETE FROM employee WHERE employee_id = ?`, [id]);
    res.json({ message: 'Employee deleted', id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET attendance
router.get('/meta/attendance', requireAuth, requireRole('Administrator', 'Factory Manager', 'Finance Officer'), (req, res) => {
  try {
    const attendance = query(`
      SELECT 
        a.*,
        e.name AS employee_name
      FROM attendance a
      JOIN employee e ON a.employee_id = e.employee_id
      ORDER BY a.date DESC, a.attendance_id DESC
    `);
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST attendance
router.post('/meta/attendance', requireAuth, requireRole('Administrator', 'Factory Manager'), (req, res) => {
  try {
    const { employee_id, date, status = 'Present', work_hours = 8.0 } = req.body;
    const attDate = date || new Date().toISOString().slice(0, 10);
    const result = execute(`
      INSERT INTO attendance (employee_id, date, status, work_hours)
      VALUES (?, ?, ?, ?)
    `, [employee_id, attDate, status, work_hours]);

    const newAtt = getOne(`
      SELECT a.*, e.name AS employee_name
      FROM attendance a
      JOIN employee e ON a.employee_id = e.employee_id
      WHERE a.attendance_id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json(newAtt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
