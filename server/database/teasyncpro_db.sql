-- TeaSyncPro - Tea Factory Management System

-- Create the database and select it
CREATE DATABASE IF NOT EXISTS teasyncpro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE teasyncpro_db;

-- TABLE: employees
-- Factory staff members (withering officers, collection officers etc.)
CREATE TABLE IF NOT EXISTS employees (
  employee_id   INT           NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)  NOT NULL,
  phone         VARCHAR(20)   NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'Active',
  join_date     DATE          NOT NULL,
  PRIMARY KEY (employee_id)
);

-- TABLE: users
-- System login accounts linked to an employee
-- Roles: Admin, InventoryOfficer, WitheringOfficer, RollingOfficer,
--        AerationOfficer, DryingOfficer, GradingOfficer,
--        PackagingOfficer, FinanceOfficer, CollectionOfficer, Supplier
CREATE TABLE IF NOT EXISTS users (
  user_id       INT           NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)   NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(50)   NOT NULL,
  employee_id   INT           NULL,
  name          VARCHAR(100)  NOT NULL,
  PRIMARY KEY (user_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- TABLE: attendance
-- Daily attendance log for each employee
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id INT           NOT NULL AUTO_INCREMENT,
  employee_id   INT           NOT NULL,
  date          DATE          NOT NULL,
  work_hours    DECIMAL(5,2)  NOT NULL DEFAULT 0,
  status        VARCHAR(20)   NOT NULL DEFAULT 'Present',
  PRIMARY KEY (attendance_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- TABLE: suppliers
-- Tea leaf suppliers (smallholders and internal pluckers)
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id    INT           NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100)  NOT NULL,
  supplier_type  VARCHAR(50)   NOT NULL,
  phone          VARCHAR(20)   NOT NULL,
  address        VARCHAR(200)  NOT NULL,
  payment        VARCHAR(50)   NOT NULL DEFAULT 'Monthly',
  transport_mode VARCHAR(50)   NOT NULL DEFAULT 'Own Vehicle',
  PRIMARY KEY (supplier_id)
);

-- TABLE: supplier_payments
-- Monthly payment records for each supplier
CREATE TABLE IF NOT EXISTS supplier_payments (
  payment_id     INT            NOT NULL AUTO_INCREMENT,
  supplier_id    INT            NOT NULL,
  pay_date       DATE           NOT NULL,
  amount         DECIMAL(12,2)  NOT NULL,
  payment_status VARCHAR(20)    NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (payment_id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
);

-- TABLE: collection_schedules
-- Daily leaf pickup route and vehicle schedules
CREATE TABLE IF NOT EXISTS collection_schedules (
  schedule_id  INT           NOT NULL AUTO_INCREMENT,
  date         DATE          NOT NULL,
  route_name   VARCHAR(100)  NOT NULL,
  vehicle_no   VARCHAR(50)   NOT NULL,
  PRIMARY KEY (schedule_id)
);

-- TABLE: daily_leaf_rates
-- Buying price per kg of green tea leaf set by management
CREATE TABLE IF NOT EXISTS daily_leaf_rates (
  rate_id        INT            NOT NULL AUTO_INCREMENT,
  effective_date DATE           NOT NULL,
  rate_per_kg    DECIMAL(10,2)  NOT NULL,
  PRIMARY KEY (rate_id)
);

-- TABLE: tea_collections
-- Individual green leaf weighment records at the factory gate
CREATE TABLE IF NOT EXISTS tea_collections (
  collection_id       INT            NOT NULL AUTO_INCREMENT,
  schedule_id         INT            NOT NULL,
  supplier_id         INT            NOT NULL,
  date                DATE           NOT NULL,
  time                VARCHAR(10)    NOT NULL,
  gross_weight        DECIMAL(10,2)  NOT NULL,
  water_deduction_kg  DECIMAL(10,2)  NOT NULL DEFAULT 0,
  net_weight          DECIMAL(10,2)  NOT NULL,
  rate_id             INT            NOT NULL,
  PRIMARY KEY (collection_id),
  FOREIGN KEY (schedule_id) REFERENCES collection_schedules(schedule_id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)            ON DELETE RESTRICT,
  FOREIGN KEY (rate_id)     REFERENCES daily_leaf_rates(rate_id)         ON DELETE RESTRICT
);

-- TABLE: production_stages
-- Lookup table for factory stages - fixed 4 stages
CREATE TABLE IF NOT EXISTS production_stages (
  stage_id    INT          NOT NULL,
  stage_name  VARCHAR(50)  NOT NULL,
  stage_no    INT          NOT NULL,
  PRIMARY KEY (stage_id)
);

INSERT INTO production_stages (stage_id, stage_name, stage_no) VALUES
  (1, 'Withering', 1),
  (2, 'Rolling',   2),
  (3, 'Aeration',  3),
  (4, 'Drying',    4);

-- TABLE: production_batches
-- One manufacturing run from green leaf input to finished tea
CREATE TABLE IF NOT EXISTS production_batches (
  batch_id      INT            NOT NULL AUTO_INCREMENT,
  prod_date     DATE           NOT NULL,
  input_qty     DECIMAL(10,2)  NOT NULL,
  wastage_qty   DECIMAL(10,2)  NOT NULL DEFAULT 0,
  batch_status  VARCHAR(50)    NOT NULL DEFAULT 'In Progress',
  PRIMARY KEY (batch_id)
);

-- TABLE: production_stage_logs
-- Detailed log for each stage within a production batch
CREATE TABLE IF NOT EXISTS production_stage_logs (
  stage_log_id    INT            NOT NULL AUTO_INCREMENT,
  batch_id        INT            NOT NULL,
  stage_id        INT            NOT NULL,
  input_weight    DECIMAL(10,2)  NOT NULL,
  output_weight   DECIMAL(10,2)  NOT NULL,
  weight_loss     DECIMAL(10,2)  NOT NULL DEFAULT 0,
  machine_no      VARCHAR(50)    NULL,
  start_end_time  VARCHAR(100)   NULL,
  PRIMARY KEY (stage_log_id),
  FOREIGN KEY (batch_id) REFERENCES production_batches(batch_id) ON DELETE CASCADE,
  FOREIGN KEY (stage_id) REFERENCES production_stages(stage_id)  ON DELETE RESTRICT
);

-- TABLE: tea_grades
-- Grade classifications for finished tea
CREATE TABLE IF NOT EXISTS tea_grades (
  grade_id     INT           NOT NULL AUTO_INCREMENT,
  grade_name   VARCHAR(50)   NOT NULL UNIQUE,
  description  TEXT          NULL,
  PRIMARY KEY (grade_id)
);

INSERT INTO tea_grades (grade_name, description) VALUES
  ('BOP',      'Broken Orange Pekoe - most common grade'),
  ('BOPF',     'Broken Orange Pekoe Fannings - smaller cut than BOP'),
  ('OP',       'Orange Pekoe - long leaf, high quality'),
  ('Dust',     'Fine grade used mainly for tea bags'),
  ('Fannings', 'Medium-fine grade used in tea bags');

-- TABLE: finished_outputs
-- Final packed tea output records from each production batch
CREATE TABLE IF NOT EXISTS finished_outputs (
  output_id       INT            NOT NULL AUTO_INCREMENT,
  batch_id        INT            NOT NULL,
  grade_id        INT            NOT NULL,
  out_date        DATE           NOT NULL,
  quantity        DECIMAL(10,2)  NOT NULL,
  unit_cost       DECIMAL(10,2)  NOT NULL DEFAULT 0,
  tax_percentage  DECIMAL(5,2)   NOT NULL DEFAULT 0,
  PRIMARY KEY (output_id),
  FOREIGN KEY (batch_id) REFERENCES production_batches(batch_id) ON DELETE CASCADE,
  FOREIGN KEY (grade_id) REFERENCES tea_grades(grade_id)         ON DELETE RESTRICT
);

-- SEED DATA - Sample test records

INSERT INTO employees (name, phone, status, join_date) VALUES
  ('Kamal Perera',    '0771234567', 'Active', '2020-01-15'),
  ('Nimal Silva',     '0772345678', 'Active', '2019-06-01'),
  ('Sunil Fernando',  '0773456789', 'Active', '2021-03-20'),
  ('Anil Jayawardena','0774567890', 'Active', '2022-07-10'),
  ('Ranjith Dias',    '0775678901', 'Active', '2018-11-05');

-- Note: password for all test accounts is "password123"
-- Change these hashes in production using bcrypt!
INSERT INTO users (username, password_hash, role, employee_id, name) VALUES
  ('admin',   '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'Admin',             NULL, 'System Admin'),
  ('kamal',   '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'CollectionOfficer', 1,    'Kamal Perera'),
  ('nimal',   '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'WitheringOfficer',  2,    'Nimal Silva'),
  ('sunil',   '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'GradingOfficer',    3,    'Sunil Fernando'),
  ('anil',    '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'FinanceOfficer',    4,    'Anil Jayawardena'),
  ('ranjith', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDE', 'InventoryOfficer',  5,    'Ranjith Dias');

INSERT INTO suppliers (name, supplier_type, phone, address, payment, transport_mode) VALUES
  ('Saman Kumara',    'Smallholder',      '0711111111', 'No.12, Kandy Road, Matale', 'Monthly', 'Own Vehicle'),
  ('Priya Estates',   'Smallholder',      '0712222222', 'Hantana, Kandy',            'Monthly', 'Factory Vehicle'),
  ('Lalith Wickrama', 'Internal Plucker', '0713333333', 'Factory Housing, Matale',   'Monthly', 'Factory Vehicle'),
  ('Green Hill Farm', 'Smallholder',      '0714444444', 'Ukuwela, Matale',           'Monthly', 'Own Vehicle');

INSERT INTO daily_leaf_rates (effective_date, rate_per_kg) VALUES
  ('2026-09-28', 95.50),
  ('2026-09-29', 96.00),
  ('2026-09-30', 97.50);

INSERT INTO collection_schedules (date, route_name, vehicle_no) VALUES
  ('2026-09-30', 'Matale Route A', 'WP CAB 1234'),
  ('2026-09-30', 'Kandy Route B',  'WP CAB 5678');

INSERT INTO tea_collections (schedule_id, supplier_id, date, time, gross_weight, water_deduction_kg, net_weight, rate_id) VALUES
  (1, 1, '2026-09-30', '08:30 AM', 250.00, 12.50, 237.50, 3),
  (1, 2, '2026-09-30', '09:00 AM', 180.00, 9.00,  171.00, 3),
  (2, 4, '2026-09-30', '08:45 AM', 320.00, 16.00, 304.00, 3);
