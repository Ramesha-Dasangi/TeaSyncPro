-- ==========================================================
-- TeaSyncPro - Seed Data
-- ==========================================================

-- 1. Employees
INSERT INTO employee (employee_id, name, phone, status, join_date) VALUES
(1, 'Kamal Perera', '0771234567', 'Active', '2018-03-15'),
(2, 'Nimal Silva', '0772345678', 'Active', '2019-05-20'),
(3, 'Sunil Rajapaksa', '0773456789', 'Active', '2020-01-10'),
(4, 'Amara Dissanayake', '0774567890', 'Active', '2020-06-15'),
(5, 'Priya Fernando', '0775678901', 'Active', '2021-02-20'),
(6, 'Ruwan Jayawardena', '0776789012', 'Active', '2021-07-25'),
(7, 'Dilini Senanayake', '0777890123', 'Active', '2022-03-10'),
(8, 'Tharaka Bandara', '0778901234', 'Active', '2022-08-15'),
(9, 'Kasun Wijesinghe', '0779012345', 'Active', '2023-01-20'),
(10, 'Malini Gunasekara', '0770123456', 'Active', '2023-04-05'),
(11, 'Chaminda Rathnayake', '0711234567', 'Active', '2023-09-01');

-- 2. Users (Passwords: admin123 for admin, pass123 for all others)
INSERT INTO user (user_id, username, email, password_hash, role, status, employee_id) VALUES
(1, 'admin', 'admin@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Administrator', 'Active', 1),
(2, 'manager01', 'manager@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Factory Manager', 'Active', 2),
(3, 'wither01', 'withering@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Withering Officer', 'Active', 3),
(4, 'rolling01', 'rolling@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Rolling Officer', 'Active', 4),
(5, 'aeration01', 'aeration@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Aeration Officer', 'Active', 5),
(6, 'drying01', 'drying@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Drying Officer', 'Active', 6),
(7, 'grading01', 'grading@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Grading Officer', 'Active', 7),
(8, 'packaging01', 'packaging@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Packaging Officer', 'Active', 8),
(9, 'inventory01', 'inventory@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Inventory Officer', 'Active', 9),
(10, 'finance01', 'finance@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Finance Officer', 'Active', 10),
(11, 'collect01', 'collection@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Collection Officer', 'Active', 11),
(12, 'supplier01', 'supplier@teasyncpro.lk', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Supplier', 'Active', NULL);

-- 3. Suppliers
INSERT INTO supplier (supplier_id, name, supplier_type, phone, email, address, bank_name, bank_account, registered_date, transport_mode) VALUES
(1, 'Asela Kumara', 'Commercial', '0712345678', 'asela@gmail.com', 'Nuwara Eliya', 'Bank of Ceylon', '8901234567', '2021-01-15', 'Own Vehicle'),
(2, 'Sandya Perera', 'Commercial', '0713456789', 'sandya@gmail.com', 'Hatton', 'People''s Bank', '7890123456', '2021-06-20', 'Factory Vehicle'),
(3, 'Roshan Silva', 'Internal Plucker', '0714567890', 'roshan@gmail.com', 'Estate Block A', 'Commercial Bank', '6789012345', '2022-03-10', 'Walk-in'),
(4, 'Kumari Fernando', 'Internal Plucker', '0715678901', 'kumari@gmail.com', 'Estate Block B', 'Hatton National', '5678901234', '2022-08-14', 'Walk-in'),
(5, 'Prasad Jayawardena', 'Commercial', '0716789012', 'prasad@gmail.com', 'Kandy', 'Bank of Ceylon', '4567890123', '2023-01-12', 'Own Vehicle'),
(6, 'Mala Rajapaksa', 'Internal Plucker', '0717890123', 'mala@gmail.com', 'Estate Block C', 'People''s Bank', '3456789012', '2023-04-05', 'Walk-in'),
(7, 'Saman Bandara', 'Commercial', '0718901234', 'saman@gmail.com', 'Gampola', 'Commercial Bank', '2345678901', '2023-09-01', 'Factory Vehicle');

-- 4. Collection Schedules
INSERT INTO collection_schedule (schedule_id, date, route_name, vehicle_no) VALUES
(1, '2026-09-21', 'Route A - Nuwara Eliya', 'WP-KA-1234'),
(2, '2026-09-21', 'Route B - Hatton', 'WP-KB-5678'),
(3, '2026-09-20', 'Route A - Nuwara Eliya', 'WP-KA-1234'),
(4, '2026-09-20', 'Route C - Kandy', 'WP-KC-9012'),
(5, '2026-09-19', 'Route B - Hatton', 'WP-KB-5678'),
(6, '2026-09-19', 'Route A - Nuwara Eliya', 'WP-KA-1234');

-- 5. Daily Leaf Rates
INSERT INTO daily_leaf_rate (rate_id, effective_date, rate_per_kg) VALUES
(1, '2026-09-21', 148.50),
(2, '2026-09-15', 145.00),
(3, '2026-09-01', 142.00),
(4, '2026-08-01', 138.50);

-- 6. Tea Collections
INSERT INTO tea_collection (collection_id, slip_no, schedule_id, supplier_id, date, time, gross_weight, water_deduction_kg, bag_deduction_kg, net_weight, rate_id) VALUES
(1, 'SLIP-2026-09-001', 1, 1, '2026-09-21', '07:30', 520, 41.6, 10.0, 468.4, 1),
(2, 'SLIP-2026-09-002', 1, 2, '2026-09-21', '08:00', 380, 30.4, 8.0, 341.6, 1),
(3, 'SLIP-2026-09-003', 1, 3, '2026-09-21', '06:45', 85, 6.8, 2.0, 76.2, 1),
(4, 'SLIP-2026-09-004', 1, 4, '2026-09-21', '07:00', 92, 7.36, 2.0, 82.64, 1),
(5, 'SLIP-2026-09-005', 2, 5, '2026-09-21', '09:15', 650, 52.0, 12.0, 586.0, 1),
(6, 'SLIP-2026-09-006', 2, 7, '2026-09-21', '09:45', 430, 34.4, 8.0, 387.6, 1);

-- 7. Production Batches
INSERT INTO production_batch (batch_id, batch_code, prod_date, input_qty, wastage_qty, batch_status) VALUES
(1, 'BATCH-2026-09-001', '2026-09-21', 1820, 45, 'In Progress'),
(2, 'BATCH-2026-09-002', '2026-09-20', 1316, 32, 'Completed'),
(3, 'BATCH-2026-09-003', '2026-09-19', 909, 22, 'Completed');

-- 8. Production Stages
INSERT INTO production_stage (stage_id, stage_name, stage_no) VALUES
(1, 'Withering', 1),
(2, 'Rolling', 2),
(3, 'Aeration/Fermentation', 3),
(4, 'Drying', 4),
(5, 'Grading', 5);

-- 9. Production Stage Logs
INSERT INTO production_stage_log (stage_log_id, batch_id, stage_id, machine_no, input_weight, output_weight, weight_loss, temperature_celsius, start_time, end_time) VALUES
(1, 1, 1, 'WM-01', 1820, 1638, 182, 28.5, '2026-09-21 06:00:00', '2026-09-21 10:00:00'),
(2, 1, 2, 'RM-02', 1638, 1556, 82, 26.0, '2026-09-21 10:30:00', '2026-09-21 13:30:00'),
(3, 1, 3, 'AM-01', 1556, 1478, 78, 24.5, '2026-09-21 14:00:00', '2026-09-21 17:00:00');

-- 10. Tea Grades
INSERT INTO tea_grade (grade_id, grade_name, description) VALUES
(1, 'BOP', 'Broken Orange Pekoe - Premium whole broken leaf'),
(2, 'BOPF', 'Broken Orange Pekoe Fannings - Strong brisk infusion'),
(3, 'Dust', 'Fine tea dust grade for tea bags'),
(4, 'FF', 'Flowery Fannings - Golden tips and aromatic liquor'),
(5, 'BP', 'Broken Pekoe - Heavy grain brisk character');

-- 11. Finished Outputs
INSERT INTO finished_output (output_id, batch_id, grade_id, lot_number, out_date, quantity_bags, net_weight_kg, unit_cost, tax_percentage) VALUES
(1, 2, 1, 'LOT-2026-BOP-01', '2026-09-21', 2, 125.0, 1850.00, 8.00),
(2, 2, 2, 'LOT-2026-BOPF-01', '2026-09-21', 2, 90.0, 1650.00, 8.00),
(3, 2, 3, 'LOT-2026-DUST-01', '2026-09-21', 1, 65.0, 1200.00, 8.00);

-- 12. Sales Invoices
INSERT INTO sales_invoice (invoice_id, invoice_no, buyer_name, invoice_date, total_weight_kg, total_amount, tax_amount, payment_status, vehicle_no) VALUES
(1, 'SINV-2026-09-01', 'John Keells Tea Brokers PLC', '2026-09-25', 280.00, 462000.00, 36960.00, 'Paid', 'WP-LB-9921');

-- 13. Supplier Payments (Vouchers / Invoices)
INSERT INTO supplier_payment (payment_id, invoice_no, supplier_id, billing_month, pay_date, total_leaf_kg, avg_rate_per_kg, gross_amount, deductions, net_payable, payment_method, payment_status) VALUES
(1, 'INV-2026-09-001', 1, '2026-09', '2026-09-15', 520.0, 148.50, 77220.00, 4875.00, 72345.00, 'Bank Transfer', 'Paid'),
(2, 'INV-2026-09-002', 2, '2026-09', '2026-09-15', 380.0, 148.50, 56430.00, 4230.00, 52200.00, 'Bank Transfer', 'Paid'),
(3, 'INV-2026-09-003', 5, '2026-09', '2026-09-15', 620.0, 148.50, 92070.00, 7970.00, 84100.00, 'Bank Transfer', 'Paid');

-- 14. Attendance
INSERT INTO attendance (attendance_id, employee_id, date, status, work_hours) VALUES
(1, 1, '2026-09-21', 'Present', 8.0),
(2, 2, '2026-09-21', 'Present', 8.5),
(3, 3, '2026-09-21', 'Present', 8.0),
(4, 4, '2026-09-21', 'Present', 8.0),
(5, 5, '2026-09-21', 'On Leave', 0.0),
(6, 6, '2026-09-21', 'Present', 9.0),
(7, 7, '2026-09-21', 'Present', 8.0),
(8, 8, '2026-09-21', 'Present', 8.0);
