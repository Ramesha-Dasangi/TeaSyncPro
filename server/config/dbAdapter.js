import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlitePath = path.resolve(__dirname, '../../php/database/teasyncpro.db');

let sqliteDb = null;

try {
  sqliteDb = new DatabaseSync(sqlitePath);
  console.log(`[DB] Connected to SQLite database at: ${sqlitePath}`);
} catch (err) {
  console.error('[DB] Failed to connect to SQLite database:', err);
}

export const query = (sql, params = []) => {
  if (!sqliteDb) throw new Error('Database not connected');
  const stmt = sqliteDb.prepare(sql);
  return stmt.all(...params);
};

export const getOne = (sql, params = []) => {
  if (!sqliteDb) throw new Error('Database not connected');
  const stmt = sqliteDb.prepare(sql);
  return stmt.get(...params);
};

export const execute = (sql, params = []) => {
  if (!sqliteDb) throw new Error('Database not connected');
  const stmt = sqliteDb.prepare(sql);
  return stmt.run(...params);
};

export default { query, getOne, execute };
