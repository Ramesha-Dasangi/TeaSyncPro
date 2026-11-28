// MySQL adapter using mysql2/promise — same interface as the old SQLite adapter
// query(), getOne(), execute() — all return Promises now (routes use async/await)

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306', 10),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || '',
  database: process.env.DB_NAME     || 'teasyncpro_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  multipleStatements: false,
  dateStrings:        true,
  decimalNumbers:     true,
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log(`[DB] Connected to MySQL database: ${process.env.DB_NAME || 'teasyncpro_db'} @ ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    conn.release();
  })
  .catch(err => {
    console.error('[DB] MySQL connection failed:', err.message);
  });

/**
 * query() — returns all matching rows
 */
export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

/**
 * getOne() — returns the first matching row (or undefined)
 */
export const getOne = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows[0];
};

/**
 * execute() — for INSERT / UPDATE / DELETE; returns { insertId, affectedRows }
 * Maps mysql2 result to the same shape the old SQLite adapter used:
 *   result.lastInsertRowid  (was SQLite)  → result.insertId  (MySQL)
 *   result.changes          (was SQLite)  → result.affectedRows
 */
export const execute = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return {
    insertId:         result.insertId,
    lastInsertRowid:  result.insertId,      // backward-compat alias
    affectedRows:     result.affectedRows,
    changes:          result.affectedRows,  // backward-compat alias
  };
};

export default { query, getOne, execute };
