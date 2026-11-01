-- ==========================================================
-- TeaSyncPro - Seed Data
-- ==========================================================

-- 1. Employees
INSERT INTO employees (employee_id, name, phone, status, join_date) VALUES
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
INSERT INTO users (user_id, username, password_hash, role, employee_id, name) VALUES
(1, 'admin', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Administrator', 1, 'Kamal Perera'),
(2, 'manager01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Factory Manager', 2, 'Nimal Silva'),
(3, 'wither01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Withering Officer', 3, 'Sunil Rajapaksa'),
(4, 'rolling01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Rolling Officer', 4, 'Amara Dissanayake'),
(5, 'aeration01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Aeration Officer', 5, 'Priya Fernando'),
(6, 'drying01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Drying Officer', 6, 'Ruwan Jayawardena'),
(7, 'grading01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Grading Officer', 7, 'Dilini Senanayake'),
(8, 'packaging01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Packaging Officer', 8, 'Tharaka Bandara'),
(9, 'inventory01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Inventory Officer', 9, 'Kasun Wijesinghe'),
(10, 'finance01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Finance Officer', 10, 'Malini Gunasekara'),
(11, 'collect01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Collection Officer', 11, 'Chaminda Rathnayake'),
(12, 'supplier01', '$2y$10$wE8w397P034o0Gv5r4G52eZ6k4pM1Z8i6oZ8.tZ2eY5l2pQ4R1y7m', 'Supplier', NULL, 'Asela Kumara (Supplier)');

-- 3. Suppliers
INSERT INTO suppliers (supplier_id, name, supplier_type, phone, address, payment, transport_mode) VALUES
(1, 'Asela Kumara', 'Commercial', '0712345678', 'Nuwara Eliya', 'Monthly', 'Own Vehicle'),
(2, 'Sandya Perera', 'Commercial', '0713456789', 'Hatton', 'Monthly', 'Factory Vehicle'),
(3, 'Roshan Silva', 'Internal Plucker', '0714567890', 'Estate Block A', 'Daily', 'Walk-in'),
(4, 'Kumari Fernando', 'Internal Plucker', '0715678901', 'Estate Block B', 'Daily', 'Walk-in'),
(5, 'Prasad Jayawardena', 'Commercial', '0716789012', 'Kandy', 'Monthly', 'Own Vehicle'),
(6, 'Mala Rajapaksa', 'Internal Plucker', '0717890123', 'Estate Block C', 'Daily', 'Walk-in'),
(7, 'Saman Bandara', 'Commercial', '0718901234', 'Gampola', 'Monthly', 'Factory Vehicle');

-- 4. Collection Schedules
INSERT INTO collection_schedules (schedule_id, date, route_name, vehicle_no) VALUES
(1, '2026-09-21', 'Route A - Nuwara Eliya', 'WP-KA-1234'),
(2, '2026-09-21', 'Route B - Hatton', 'WP-KB-5678'),
(3, '2026-09-20', 'Route A - Nuwara Eliya', 'WP-KA-1234'),
(4, '2026-09-20', 'Route C - Kandy', 'WP-KC-9012'),
(5, '2026-09-19', 'Route B - Hatton', 'WP-KB-5678'),
(6, '2026-09-19', 'Route A - Nuwara Eliya', 'WP-KA-1234');

-- 5. Daily Leaf Rates
INSERT INTO daily_leaf_rates (rate_id, effective_date, rate_per_kg) VALUES
(1, '2026-09-21', 148.50),
(2, '2026-09-15', 145.00),
(3, '2026-09-01', 142.00),
(4, '2026-08-01', 138.50);

-- 6. Tea Collections
INSERT INTO tea_collections (collection_id, schedule_id, supplier_id, date, time, gross_weight, water_deduction_kg, net_weight, rate_id) VALUES
(1, 1, 1, '2026-09-21', '07:30', 520, 41.6, 478.4, 1),
(2, 1, 2, '2026-09-21', '08:00', 380, 30.4, 349.6, 1),
(3, 1, 3, '2026-09-21', '06:45', 85, 6.8, 78.2, 1),
(4, 1, 4, '2026-09-21', '07:00', 92, 7.36, 84.64, 1),
(5, 2, 5, '2026-09-21', '09:15', 650, 52.0, 598.0, 1),
(6, 2, 7, '2026-09-21', '09:45', 430, 34.4, 395.6, 1),
(7, 3, 1, '2026-09-20', '07:30', 490, 39.2, 450.8, 1),
(8, 3, 2, '2026-09-20', '08:15', 360, 28.8, 331.2, 1),
(9, 4, 5, '2026-09-20', '09:00', 580, 46.4, 533.6, 1),
(10, 5, 2, '2026-09-19', '08:30', 410, 32.8, 377.2, 2),
(11, 6, 1, '2026-09-19', '07:45', 500, 40.0, 460.0, 2),
(12, 6, 3, '2026-09-19', '06:50', 78, 6.24, 71.76, 2),
(13, 1, 6, '2026-09-18', '07:00', 96, 7.68, 88.32, 2),
(14, 2, 7, '2026-09-18', '09:30', 520, 41.6, 478.4, 2),
(15, 1, 1, '2026-09-17', '07:30', 545, 43.6, 501.4, 2),
(16, 2, 5, '2026-09-17', '09:00', 620, 49.6, 570.4, 2),
(17, 1, 3, '2026-09-16', '07:00', 89, 7.12, 81.88, 2),
(18, 1, 4, '2026-09-16', '07:15', 102, 8.16, 93.84, 2);

-- 7. Production Batches
INSERT INTO production_batches (batch_id, prod_date, input_qty, wastage_qty, batch_status) VALUES
(1, '2026-09-21', 1820, 45, 'In Progress'),
(2, '2026-09-20', 1316, 32, 'Completed'),
(3, '2026-09-19', 909, 22, 'Completed'),
(4, '2026-09-18', 567, 14, 'Completed'),
(5, '2026-09-17', 1072, 26, 'Completed');

-- 8. Production Stages
INSERT INTO production_stages (stage_id, stage_name, stage_no) VALUES
(1, 'Withering', 1),
(2, 'Rolling', 2),
(3, 'Aeration/Fermentation', 3),
(4, 'Drying', 4),
(5, 'Grading', 5);

-- 9. Production Stage Logs
INSERT INTO production_stage_logs (stage_log_id, batch_id, stage_id, machine_no, input_weight, output_weight, weight_loss, start_end_time) VALUES
(1, 1, 1, 'WM-01', 1820, 1638, 182, '2026-09-21 06:00 - 2026-09-21 10:00'),
(2, 1, 2, 'RM-02', 1638, 1556, 82, '2026-09-21 10:30 - 2026-09-21 13:30'),
(3, 1, 3, 'AM-01', 1556, 1478, 78, '2026-09-21 14:00 - ...'),
(4, 2, 1, 'WM-01', 1316, 1185, 131, '2026-09-20 06:00 - 2026-09-20 10:00'),
(5, 2, 2, 'RM-01', 1185, 1126, 59, '2026-09-20 10:30 - 2026-09-20 13:30'),
(6, 2, 3, 'AM-01', 1126, 1070, 56, '2026-09-20 14:00 - 2026-09-20 18:00'),
(7, 2, 4, 'DM-01', 1070, 320, 750, '2026-09-20 18:30 - 2026-09-21 02:00'),
(8, 2, 5, 'GM-01', 320, 305, 15, '2026-09-21 02:30 - 2026-09-21 06:00'),
(9, 3, 1, 'WM-02', 909, 818, 91, '2026-09-19 06:00 - 2026-09-19 10:00'),
(10, 3, 2, 'RM-02', 818, 777, 41, '2026-09-19 10:30 - 2026-09-19 13:30'),
(11, 3, 3, 'AM-02', 777, 739, 38, '2026-09-19 14:00 - 2026-09-19 18:00'),
(12, 3, 4, 'DM-01', 739, 222, 517, '2026-09-19 18:30 - 2026-09-20 02:00'),
(13, 3, 5, 'GM-01', 222, 211, 11, '2026-09-20 02:30 - 2026-09-20 05:30');

-- 10. Tea Grades
INSERT INTO tea_grades (grade_id, grade_name, description) VALUES
(1, 'BOP', 'Broken Orange Pekoe - Premium whole broken leaf'),
(2, 'BOPF', 'Broken Orange Pekoe Fannings - Strong brisk infusion'),
(3, 'Dust', 'Fine tea dust grade for tea bags'),
(4, 'FF', 'Flowery Fannings - Golden tips and aromatic liquor'),
(5, 'BP', 'Broken Pekoe - Heavy grain brisk character');

-- 11. Finished Outputs
INSERT INTO finished_outputs (output_id, batch_id, grade_id, quantity, unit_cost, out_date, tax_percentage) VALUES
(1, 2, 1, 125, 1850.00, '2026-09-21', 8.00),
(2, 2, 2, 90, 1650.00, '2026-09-21', 8.00),
(3, 2, 3, 65, 1200.00, '2026-09-21', 8.00),
(4, 2, 4, 25, 1400.00, '2026-09-21', 8.00),
(5, 3, 1, 85, 1850.00, '2026-09-20', 8.00),
(6, 3, 2, 72, 1650.00, '2026-09-20', 8.00),
(7, 3, 3, 40, 1200.00, '2026-09-20', 8.00),
(8, 3, 5, 14, 1550.00, '2026-09-20', 8.00);

-- 12. Supplier Payments
INSERT INTO supplier_payments (payment_id, supplier_id, pay_date, amount, payment_status) VALUES
(1, 1, '2026-09-15', 72345.00, 'Paid'),
(2, 2, '2026-09-15', 52200.00, 'Paid'),
(3, 5, '2026-09-15', 84100.00, 'Paid'),
(4, 7, '2026-09-15', 63550.00, 'Pending'),
(5, 1, '2026-08-15', 68900.00, 'Paid'),
(6, 2, '2026-08-15', 49800.00, 'Paid');

-- 13. Attendance
INSERT INTO attendance (attendance_id, employee_id, date, status, work_hours) VALUES
(1, 1, '2026-09-21', 'Present', 8.0),
(2, 2, '2026-09-21', 'Present', 8.5),
(3, 3, '2026-09-21', 'Present', 8.0),
(4, 4, '2026-09-21', 'Present', 8.0),
(5, 5, '2026-09-21', 'On Leave', 0.0),
(6, 6, '2026-09-21', 'Present', 9.0),
(7, 7, '2026-09-21', 'Present', 8.0),
(8, 8, '2026-09-21', 'Present', 8.0);
