-- ==========================================================
-- TeaSyncPro - Tea Factory Management System Database Schema
-- Compatible with MySQL and SQLite (Standard SQL DDL)
-- Aligned with Enterprise Relational & ER Architecture
-- ==========================================================

CREATE TABLE IF NOT EXISTS employee (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    join_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    employee_id INTEGER NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Present',
    work_hours DECIMAL(4,1) DEFAULT 8.0,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS supplier (
    supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    supplier_type VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    address VARCHAR(200) NOT NULL,
    bank_name VARCHAR(100) NULL,
    bank_account VARCHAR(50) NULL,
    registered_date DATE NOT NULL,
    transport_mode VARCHAR(50) DEFAULT 'Own Vehicle'
);

CREATE TABLE IF NOT EXISTS collection_schedule (
    schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    route_name VARCHAR(100) NOT NULL,
    vehicle_no VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_leaf_rate (
    rate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    effective_date DATE NOT NULL,
    rate_per_kg DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS tea_collection (
    collection_id INTEGER PRIMARY KEY AUTOINCREMENT,
    slip_no VARCHAR(50) UNIQUE NOT NULL,
    schedule_id INTEGER NOT NULL,
    supplier_id INTEGER NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    gross_weight DECIMAL(10,2) NOT NULL,
    water_deduction_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    bag_deduction_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_weight DECIMAL(10,2) NOT NULL,
    rate_id INTEGER NOT NULL,
    FOREIGN KEY (schedule_id) REFERENCES collection_schedule(schedule_id),
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id),
    FOREIGN KEY (rate_id) REFERENCES daily_leaf_rate(rate_id)
);

CREATE TABLE IF NOT EXISTS production_batch (
    batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    prod_date DATE NOT NULL,
    input_qty DECIMAL(10,2) NOT NULL,
    wastage_qty DECIMAL(10,2) DEFAULT 0,
    batch_status VARCHAR(50) DEFAULT 'In Progress'
);

CREATE TABLE IF NOT EXISTS production_stage (
    stage_id INTEGER PRIMARY KEY,
    stage_name VARCHAR(50) NOT NULL,
    stage_no INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS production_stage_log (
    stage_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    stage_id INTEGER NOT NULL,
    machine_no VARCHAR(50) NOT NULL,
    input_weight DECIMAL(10,2) NOT NULL,
    output_weight DECIMAL(10,2) NOT NULL,
    weight_loss DECIMAL(10,2) NOT NULL DEFAULT 0,
    temperature_celsius DECIMAL(5,2) NULL,
    start_time DATETIME NULL,
    end_time DATETIME NULL,
    FOREIGN KEY (batch_id) REFERENCES production_batch(batch_id),
    FOREIGN KEY (stage_id) REFERENCES production_stage(stage_id)
);

CREATE TABLE IF NOT EXISTS tea_grade (
    grade_id INTEGER PRIMARY KEY,
    grade_name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS finished_output (
    output_id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    grade_id INTEGER NOT NULL,
    lot_number VARCHAR(50) UNIQUE NOT NULL,
    out_date DATE NOT NULL,
    quantity_bags INT NOT NULL DEFAULT 1,
    net_weight_kg DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 8.00,
    FOREIGN KEY (batch_id) REFERENCES production_batch(batch_id),
    FOREIGN KEY (grade_id) REFERENCES tea_grade(grade_id)
);

CREATE TABLE IF NOT EXISTS sales_invoice (
    invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    buyer_name VARCHAR(150) NOT NULL,
    invoice_date DATE NOT NULL,
    total_weight_kg DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'Pending',
    vehicle_no VARCHAR(50) NULL
);

CREATE TABLE IF NOT EXISTS supplier_payment (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL,
    billing_month VARCHAR(20) NOT NULL,
    pay_date DATE NOT NULL,
    total_leaf_kg DECIMAL(10,2) NOT NULL,
    avg_rate_per_kg DECIMAL(10,2) NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    deductions DECIMAL(10,2) NOT NULL DEFAULT 0,
    net_payable DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
    payment_status VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (supplier_id) REFERENCES supplier(supplier_id)
);
