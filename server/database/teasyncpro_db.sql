-- ==========================================================
-- TeaSyncPro - Tea Factory Management System Database Schema
-- Aligned with Enterprise Relational & ER Architecture
-- Database: MySQL (teasyncpro_db)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS teasyncpro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE teasyncpro_db;

-- ----------------------------------------------------------
-- 1. TABLE: employee
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee (
  employee_id   INT           NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  phone         VARCHAR(20)   NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'Active',
  join_date     DATE          NOT NULL,
  PRIMARY KEY (employee_id)
);

-- ----------------------------------------------------------
-- 2. TABLE: user
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
  user_id       INT           NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)   NOT NULL UNIQUE,
  email         VARCHAR(100)  NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(50)   NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'Active',
  employee_id   INT           NULL UNIQUE,          -- UNIQUE enforces true 1:1 with Employee
  PRIMARY KEY (user_id),
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE SET NULL
);

-- ----------------------------------------------------------
-- 3. TABLE: attendance
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id INT           NOT NULL AUTO_INCREMENT,
  employee_id   INT           NOT NULL,
  date          DATE          NOT NULL,
  work_hours    DECIMAL(5,2)  NOT NULL DEFAULT 8.00,
  status        VARCHAR(20)   NOT NULL DEFAULT 'Present',
  PRIMARY KEY (attendance_id),
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- 4. TABLE: supplier
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier (
  supplier_id     INT           NOT NULL AUTO_INCREMENT,
  name            VARCHAR(100)  NOT NULL,
  supplier_type   VARCHAR(50)   NOT NULL,
  phone           VARCHAR(20)   NOT NULL,
  email           VARCHAR(100)  NULL,
  address         VARCHAR(200)  NOT NULL,
  bank_name       VARCHAR(100)  NULL,
  bank_account    VARCHAR(50)   NULL,
  registered_date DATE          NOT NULL,
  transport_mode  VARCHAR(50)   NOT NULL DEFAULT 'Own Vehicle',
  PRIMARY KEY (supplier_id)
);

-- ----------------------------------------------------------
-- 5. TABLE: daily_leaf_rate
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_leaf_rate (
  rate_id        INT            NOT NULL AUTO_INCREMENT,
  effective_date DATE           NOT NULL,
  rate_per_kg    DECIMAL(10,2)  NOT NULL,
  PRIMARY KEY (rate_id)
);

-- ----------------------------------------------------------
-- 6. TABLE: collection_schedule
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_schedule (
  schedule_id  INT           NOT NULL AUTO_INCREMENT,
  date         DATE          NOT NULL,
  route_name   VARCHAR(100)  NOT NULL,
  vehicle_no   VARCHAR(50)   NOT NULL,
  PRIMARY KEY (schedule_id)
);

-- ----------------------------------------------------------
-- 7. TABLE: production_batch  (must exist before tea_collection FK)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS production_batch (
  batch_id      INT            NOT NULL AUTO_INCREMENT,
  batch_code    VARCHAR(50)    NOT NULL UNIQUE,
  prod_date     DATE           NOT NULL,
  input_qty     DECIMAL(10,2)  NOT NULL,
  wastage_qty   DECIMAL(10,2)  NOT NULL DEFAULT 0,
  batch_status  VARCHAR(50)    NOT NULL DEFAULT 'In Progress',
  PRIMARY KEY (batch_id)
);

-- ----------------------------------------------------------
-- 8. TABLE: tea_collection
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS tea_collection (
  collection_id       INT            NOT NULL AUTO_INCREMENT,
  slip_no             VARCHAR(50)    NOT NULL UNIQUE,
  schedule_id         INT            NOT NULL,
  supplier_id         INT            NOT NULL,
  batch_id            INT            NULL,
  date                DATE           NOT NULL,
  time                VARCHAR(10)    NOT NULL,
  gross_weight        DECIMAL(10,2)  NOT NULL,
  water_deduction_kg  DECIMAL(10,2)  NOT NULL DEFAULT 0,
  bag_deduction_kg    DECIMAL(10,2)  NOT NULL DEFAULT 0,
  net_weight          DECIMAL(10,2)  NOT NULL,
  rate_id             INT            NOT NULL,
  PRIMARY KEY (collection_id),
  FOREIGN KEY (schedule_id) REFERENCES collection_schedule(schedule_id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)            ON DELETE RESTRICT,
  FOREIGN KEY (rate_id)     REFERENCES daily_leaf_rate(rate_id)         ON DELETE RESTRICT,
  FOREIGN KEY (batch_id)    REFERENCES production_batch(batch_id)      ON DELETE SET NULL
);

-- ----------------------------------------------------------
-- 9. TABLE: production_stage
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS production_stage (
  stage_id    INT          NOT NULL,
  stage_name  VARCHAR(50)  NOT NULL,
  stage_no    INT          NOT NULL,
  PRIMARY KEY (stage_id)
);

INSERT INTO production_stage (stage_id, stage_name, stage_no) VALUES
  (1, 'Withering', 1),
  (2, 'Rolling',   2),
  (3, 'Aeration',  3),
  (4, 'Drying',    4)
ON DUPLICATE KEY UPDATE stage_name=VALUES(stage_name);

-- ----------------------------------------------------------
-- 10. TABLE: production_stage_log
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS production_stage_log (
  stage_log_id        INT            NOT NULL AUTO_INCREMENT,
  batch_id            INT            NOT NULL,
  stage_id            INT            NOT NULL,
  employee_id         INT            NULL,
  machine_no          VARCHAR(50)    NOT NULL,
  input_weight        DECIMAL(10,2)  NOT NULL,
  output_weight       DECIMAL(10,2)  NOT NULL,
  weight_loss         DECIMAL(10,2)  NOT NULL DEFAULT 0,
  temperature_celsius DECIMAL(5,2)   NULL,
  start_time          DATETIME       NULL,
  end_time            DATETIME       NULL,
  PRIMARY KEY (stage_log_id),
  FOREIGN KEY (batch_id)   REFERENCES production_batch(batch_id) ON DELETE CASCADE,
  FOREIGN KEY (stage_id)   REFERENCES production_stage(stage_id)  ON DELETE RESTRICT,
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id)      ON DELETE SET NULL
);

-- ----------------------------------------------------------
-- 11. TABLE: tea_grade
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS tea_grade (
  grade_id     INT           NOT NULL AUTO_INCREMENT,
  grade_name   VARCHAR(50)   NOT NULL UNIQUE,
  description  TEXT          NULL,
  PRIMARY KEY (grade_id)
);

INSERT INTO tea_grade (grade_id, grade_name, description) VALUES
  (1, 'BOP',      'Broken Orange Pekoe - most common primary grade'),
  (2, 'BOPF',     'Broken Orange Pekoe Fannings - smaller cut than BOP'),
  (3, 'OP',       'Orange Pekoe - long wiry whole leaf grade'),
  (4, 'Dust',     'Fine sifted grade used mainly for tea bags'),
  (5, 'Pekoe',    'Curly and shotty leaf grade with distinct character')
ON DUPLICATE KEY UPDATE grade_name=VALUES(grade_name);

-- ----------------------------------------------------------
-- 12. TABLE: sales_invoice (Finished Goods Dispatch & Sales)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS sales_invoice (
  invoice_id       INT            NOT NULL AUTO_INCREMENT,
  invoice_no       VARCHAR(50)    NOT NULL UNIQUE,
  buyer_name       VARCHAR(150)   NOT NULL,
  invoice_date     DATE           NOT NULL,
  total_weight_kg  DECIMAL(10,2)  NOT NULL,
  total_amount     DECIMAL(12,2)  NOT NULL,
  tax_amount       DECIMAL(10,2)  NOT NULL DEFAULT 0,
  payment_status   VARCHAR(20)    NOT NULL DEFAULT 'Pending',
  vehicle_no       VARCHAR(50)    NULL,
  PRIMARY KEY (invoice_id)
);

-- ----------------------------------------------------------
-- 13. TABLE: finished_output (Graded & Packed Inventory)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS finished_output (
  output_id       INT            NOT NULL AUTO_INCREMENT,
  batch_id        INT            NOT NULL,
  grade_id        INT            NOT NULL,
  invoice_id      INT            NULL,
  lot_number      VARCHAR(50)    NOT NULL UNIQUE,
  out_date        DATE           NOT NULL,
  quantity_bags   INT            NOT NULL DEFAULT 1,
  net_weight_kg   DECIMAL(10,2)  NOT NULL,
  unit_cost       DECIMAL(10,2)  NOT NULL DEFAULT 0,
  tax_percentage  DECIMAL(5,2)   NOT NULL DEFAULT 0,
  PRIMARY KEY (output_id),
  FOREIGN KEY (batch_id)   REFERENCES production_batch(batch_id) ON DELETE CASCADE,
  FOREIGN KEY (grade_id)   REFERENCES tea_grade(grade_id)         ON DELETE RESTRICT,
  FOREIGN KEY (invoice_id) REFERENCES sales_invoice(invoice_id)   ON DELETE SET NULL
);

-- ----------------------------------------------------------
-- 14. TABLE: supplier_payment (Monthly Settlement Invoices)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_payment (
  payment_id       INT            NOT NULL AUTO_INCREMENT,
  invoice_no       VARCHAR(50)    NOT NULL UNIQUE,
  supplier_id      INT            NOT NULL,
  billing_month    VARCHAR(20)    NOT NULL,
  pay_date         DATE           NOT NULL,
  total_leaf_kg    DECIMAL(10,2)  NOT NULL,
  avg_rate_per_kg  DECIMAL(10,2)  NOT NULL,
  gross_amount     DECIMAL(12,2)  NOT NULL,
  deductions       DECIMAL(10,2)  NOT NULL DEFAULT 0,
  net_payable      DECIMAL(12,2)  NOT NULL,
  payment_method   VARCHAR(50)    NOT NULL DEFAULT 'Bank Transfer',
  payment_status   VARCHAR(20)    NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (payment_id),
  FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id) ON DELETE CASCADE
);

-- ==========================================================
-- SEED DATA - Realistic Demo Data
-- ==========================================================

INSERT INTO employee (name, phone, status, join_date) VALUES
  ('Kamal Perera',    '0771234567', 'Active', '2018-03-15'),
  ('Nimal Silva',     '0772345678', 'Active', '2019-05-20'),
  ('Sunil Rajapaksa', '0773456789', 'Active', '2020-01-10'),
  ('Amara Dissanayake','0774567890', 'Active', '2020-06-15'),
  ('Priya Fernando',  '0775678901', 'Active', '2021-02-20'),
  ('Ruwan Jayawardena','0776789012', 'Active', '2021-08-05');

INSERT INTO user (username, email, password_hash, role, status, employee_id) VALUES
  ('admin',     'admin@teasyncpro.lk',     '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'Admin',             'Active', 1),
  ('manager01', 'manager@teasyncpro.lk',   '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'FactoryManager',    'Active', 2),
  ('wither01',  'withering@teasyncpro.lk', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'WitheringOfficer',  'Active', 3),
  ('rolling01', 'rolling@teasyncpro.lk',   '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'RollingOfficer',    'Active', 4),
  ('aeration01','aeration@teasyncpro.lk',  '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'AerationOfficer',   'Active', 5),
  ('drying01',  'drying@teasyncpro.lk',    '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'DryingOfficer',     'Active', 6);

INSERT INTO supplier (name, supplier_type, phone, email, address, bank_name, bank_account, registered_date, transport_mode) VALUES
  ('Sunil Shantha',   'Smallholder', '0712345671', 'sunil@gmail.com',   'No. 45, Kandy Road, Matale',   'Bank of Ceylon',    '8901234567', '2021-01-15', 'Own Vehicle'),
  ('Kamala Menike',   'Smallholder', '0712345672', 'kamala@gmail.com',  'Estate Lane, Hantana, Kandy',  'People\'s Bank',    '7890123456', '2021-06-20', 'Factory Vehicle'),
  ('Mahinda Bandara', 'Smallholder', '0712345673', 'mahinda@gmail.com', 'Tea Garden, Ukuwela',         'Commercial Bank',   '6789012345', '2022-03-10', 'Factory Vehicle'),
  ('Nayana Kumari',   'Smallholder', '0712345674', 'nayana@gmail.com',  'Highland Farm, Gampola',       'Hatton National',   '5678901234', '2022-08-14', 'Own Vehicle');

INSERT INTO daily_leaf_rate (effective_date, rate_per_kg) VALUES
  ('2026-09-28', 148.50),
  ('2026-09-29', 150.00),
  ('2026-09-30', 152.00);

INSERT INTO collection_schedule (date, route_name, vehicle_no) VALUES
  ('2026-09-30', 'Route 1 - North Valley', 'WP-NA-4521'),
  ('2026-09-30', 'Route 2 - High Ridge',   'WP-NB-8812');

INSERT INTO production_batch (batch_code, prod_date, input_qty, wastage_qty, batch_status) VALUES
  ('BATCH-2026-09-01', '2026-09-30', 1106.00, 12.00, 'Completed');

INSERT INTO tea_collection (slip_no, schedule_id, supplier_id, batch_id, date, time, gross_weight, water_deduction_kg, bag_deduction_kg, net_weight, rate_id) VALUES
  ('SLIP-2026-001', 1, 1, 1, '2026-09-30', '07:30 AM', 520.00, 41.60, 10.00, 468.40, 3),
  ('SLIP-2026-002', 1, 2, 1, '2026-09-30', '08:00 AM', 380.00, 30.40,  8.00, 341.60, 3),
  ('SLIP-2026-003', 2, 3, 1, '2026-09-30', '08:45 AM', 320.00, 16.00,  8.00, 296.00, 3);

INSERT INTO production_stage_log (batch_id, stage_id, employee_id, machine_no, input_weight, output_weight, weight_loss, temperature_celsius, start_time, end_time) VALUES
  (1, 1, 3, 'Trough 01 & 02', 1106.00, 608.30, 497.70, 28.5, '2026-09-30 09:00:00', '2026-09-30 21:00:00'),
  (1, 2, 4, 'Roller A & B',   608.30,  596.10,  12.20, 26.0, '2026-09-30 21:30:00', '2026-09-30 23:30:00'),
  (1, 3, 5, 'Ferment Bed 1',  596.10,  590.10,   6.00, 24.5, '2026-09-30 23:45:00', '2026-10-01 01:15:00'),
  (1, 4, 6, 'VFBD Dryer 01',  590.10,  243.30, 346.80, 115.0,'2026-10-01 01:30:00', '2026-10-01 03:30:00');

INSERT INTO finished_output (batch_id, grade_id, invoice_id, lot_number, out_date, quantity_bags, net_weight_kg, unit_cost, tax_percentage) VALUES
  (1, 1, 1, 'LOT-2026-BOP-01',  '2026-10-01', 2,  97.30, 850.00, 8.00),
  (1, 2, 1, 'LOT-2026-BOPF-01', '2026-10-01', 2, 109.50, 920.00, 8.00),
  (1, 4, 1, 'LOT-2026-DUST-01', '2026-10-01', 1,  36.50, 680.00, 8.00);

INSERT INTO sales_invoice (invoice_no, buyer_name, invoice_date, total_weight_kg, total_amount, tax_amount, payment_status, vehicle_no) VALUES
  ('SINV-2026-001', 'John Keells Tea Brokers PLC', '2026-10-05', 243.30, 206805.00, 16544.40, 'Paid', 'WP-LY-6621');

INSERT INTO supplier_payment (invoice_no, supplier_id, billing_month, pay_date, total_leaf_kg, avg_rate_per_kg, gross_amount, deductions, net_payable, payment_method, payment_status) VALUES
  ('INV-2026-09-001', 1, '2026-09', '2026-10-10', 468.40, 150.00, 70260.00, 4500.00, 65760.00, 'Bank Transfer', 'Paid'),
  ('INV-2026-09-002', 2, '2026-09', '2026-10-10', 341.60, 150.00, 51240.00, 3000.00, 48240.00, 'Bank Transfer', 'Paid');
