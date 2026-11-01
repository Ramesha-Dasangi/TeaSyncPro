-- ==========================================================
-- TeaSyncPro - Tea Factory Management System Database Schema
-- Compatible with MySQL and SQLite (Standard SQL DDL)
-- ==========================================================

CREATE TABLE IF NOT EXISTS employees (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    join_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    employee_id INTEGER NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    supplier_type VARCHAR(50) NOT NULL, -- 'Commercial', 'Internal Plucker'
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(200) NOT NULL,
    payment VARCHAR(50) DEFAULT 'Monthly', -- 'Daily', 'Monthly'
    transport_mode VARCHAR(50) DEFAULT 'Own Vehicle' -- 'Own Vehicle', 'Factory Vehicle', 'Walk-in'
);

CREATE TABLE IF NOT EXISTS collection_schedules (
    schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    route_name VARCHAR(100) NOT NULL,
    vehicle_no VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_leaf_rates (
    rate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    effective_date DATE NOT NULL,
    rate_per_kg DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS tea_collections (
    collection_id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    supplier_id INTEGER NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    gross_weight DECIMAL(10,2) NOT NULL,
    water_deduction_kg DECIMAL(10,2) NOT NULL,
    net_weight DECIMAL(10,2) NOT NULL,
    rate_id INTEGER NOT NULL,
    FOREIGN KEY (schedule_id) REFERENCES collection_schedules(schedule_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (rate_id) REFERENCES daily_leaf_rates(rate_id)
);

CREATE TABLE IF NOT EXISTS production_batches (
    batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
    prod_date DATE NOT NULL,
    input_qty DECIMAL(10,2) NOT NULL,
    wastage_qty DECIMAL(10,2) DEFAULT 0,
    batch_status VARCHAR(50) DEFAULT 'In Progress' -- 'In Progress', 'Completed'
);

CREATE TABLE IF NOT EXISTS production_stages (
    stage_id INTEGER PRIMARY KEY,
    stage_name VARCHAR(50) NOT NULL,
    stage_no INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS production_stage_logs (
    stage_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    stage_id INTEGER NOT NULL,
    machine_no VARCHAR(50) NOT NULL,
    input_weight DECIMAL(10,2) NOT NULL,
    output_weight DECIMAL(10,2) NOT NULL,
    weight_loss DECIMAL(10,2) NOT NULL,
    start_end_time VARCHAR(100) NOT NULL,
    FOREIGN KEY (batch_id) REFERENCES production_batches(batch_id),
    FOREIGN KEY (stage_id) REFERENCES production_stages(stage_id)
);

CREATE TABLE IF NOT EXISTS tea_grades (
    grade_id INTEGER PRIMARY KEY,
    grade_name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS finished_outputs (
    output_id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    grade_id INTEGER NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    out_date DATE NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 8.00,
    FOREIGN KEY (batch_id) REFERENCES production_batches(batch_id),
    FOREIGN KEY (grade_id) REFERENCES tea_grades(grade_id)
);

CREATE TABLE IF NOT EXISTS supplier_payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER NOT NULL,
    pay_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Pending', -- 'Paid', 'Pending'
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Present', -- 'Present', 'On Leave', 'Absent'
    work_hours DECIMAL(4,1) DEFAULT 8.0,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
