export const ROLES = {
  ADMIN: 'Administrator',
  FACTORY_MANAGER: 'Factory Manager',
  WITHERING_OFFICER: 'Withering Officer',
  ROLLING_OFFICER: 'Rolling Officer',
  AERATION_OFFICER: 'Aeration Officer',
  DRYING_OFFICER: 'Drying Officer',
  GRADING_OFFICER: 'Grading Officer',
  PACKAGING_OFFICER: 'Packaging Officer',
  INVENTORY_OFFICER: 'Inventory Officer',
  FINANCE_OFFICER: 'Finance Officer',
  COLLECTION_OFFICER: 'Collection Officer',
  SUPPLIER: 'Supplier',
};

export const USERS = [
  { user_id: 1, username: 'admin', password: 'admin123', role: ROLES.ADMIN, employee_id: 1, name: 'Kamal Perera' },
  { user_id: 2, username: 'manager01', password: 'pass123', role: ROLES.FACTORY_MANAGER, employee_id: 2, name: 'Nimal Silva' },
  { user_id: 3, username: 'wither01', password: 'pass123', role: ROLES.WITHERING_OFFICER, employee_id: 3, name: 'Sunil Rajapaksa' },
  { user_id: 4, username: 'rolling01', password: 'pass123', role: ROLES.ROLLING_OFFICER, employee_id: 4, name: 'Amara Dissanayake' },
  { user_id: 5, username: 'aeration01', password: 'pass123', role: ROLES.AERATION_OFFICER, employee_id: 5, name: 'Priya Fernando' },
  { user_id: 6, username: 'drying01', password: 'pass123', role: ROLES.DRYING_OFFICER, employee_id: 6, name: 'Ruwan Jayawardena' },
  { user_id: 7, username: 'grading01', password: 'pass123', role: ROLES.GRADING_OFFICER, employee_id: 7, name: 'Dilini Senanayake' },
  { user_id: 8, username: 'packaging01', password: 'pass123', role: ROLES.PACKAGING_OFFICER, employee_id: 8, name: 'Tharaka Bandara' },
  { user_id: 9, username: 'inventory01', password: 'pass123', role: ROLES.INVENTORY_OFFICER, employee_id: 9, name: 'Kasun Wijesinghe' },
  { user_id: 10, username: 'finance01', password: 'pass123', role: ROLES.FINANCE_OFFICER, employee_id: 10, name: 'Malini Gunasekara' },
  { user_id: 11, username: 'collect01', password: 'pass123', role: ROLES.COLLECTION_OFFICER, employee_id: 11, name: 'Chaminda Rathnayake' },
  { user_id: 12, username: 'supplier01', password: 'pass123', role: ROLES.SUPPLIER, employee_id: null, name: 'Asela Kumara (Supplier)' },
];

export const EMPLOYEES = [
  { employee_id: 1, name: 'Kamal Perera', phone: '0771234567', status: 'Active', join_date: '2018-03-15' },
  { employee_id: 2, name: 'Nimal Silva', phone: '0772345678', status: 'Active', join_date: '2019-05-20' },
  { employee_id: 3, name: 'Sunil Rajapaksa', phone: '0773456789', status: 'Active', join_date: '2020-01-10' },
  { employee_id: 4, name: 'Amara Dissanayake', phone: '0774567890', status: 'Active', join_date: '2020-06-15' },
  { employee_id: 5, name: 'Priya Fernando', phone: '0775678901', status: 'Active', join_date: '2021-02-20' },
  { employee_id: 6, name: 'Ruwan Jayawardena', phone: '0776789012', status: 'Active', join_date: '2021-07-25' },
  { employee_id: 7, name: 'Dilini Senanayake', phone: '0777890123', status: 'Active', join_date: '2022-03-10' },
  { employee_id: 8, name: 'Tharaka Bandara', phone: '0778901234', status: 'Active', join_date: '2022-08-15' },
  { employee_id: 9, name: 'Kasun Wijesinghe', phone: '0779012345', status: 'Active', join_date: '2023-01-20' },
  { employee_id: 10, name: 'Malini Gunasekara', phone: '0770123456', status: 'Active', join_date: '2023-04-05' },
  { employee_id: 11, name: 'Chaminda Rathnayake', phone: '0711234567', status: 'Active', join_date: '2023-09-01' },
];

export const SUPPLIERS = [
  { supplier_id: 1, name: 'Asela Kumara', supplier_type: 'Commercial', phone: '0712345678', address: 'Nuwara Eliya', payment: 'Monthly', transport_mode: 'Own Vehicle' },
  { supplier_id: 2, name: 'Sandya Perera', supplier_type: 'Commercial', phone: '0713456789', address: 'Hatton', payment: 'Monthly', transport_mode: 'Factory Vehicle' },
  { supplier_id: 3, name: 'Roshan Silva', supplier_type: 'Internal Plucker', phone: '0714567890', address: 'Estate Block A', payment: 'Daily', transport_mode: 'Walk-in' },
  { supplier_id: 4, name: 'Kumari Fernando', supplier_type: 'Internal Plucker', phone: '0715678901', address: 'Estate Block B', payment: 'Daily', transport_mode: 'Walk-in' },
  { supplier_id: 5, name: 'Prasad Jayawardena', supplier_type: 'Commercial', phone: '0716789012', address: 'Kandy', payment: 'Monthly', transport_mode: 'Own Vehicle' },
  { supplier_id: 6, name: 'Mala Rajapaksa', supplier_type: 'Internal Plucker', phone: '0717890123', address: 'Estate Block C', payment: 'Daily', transport_mode: 'Walk-in' },
  { supplier_id: 7, name: 'Saman Bandara', supplier_type: 'Commercial', phone: '0718901234', address: 'Gampola', payment: 'Monthly', transport_mode: 'Factory Vehicle' },
];

export const COLLECTION_SCHEDULES = [
  { schedule_id: 1, date: '2026-09-21', route_name: 'Route A - Nuwara Eliya', vehicle_no: 'WP-KA-1234' },
  { schedule_id: 2, date: '2026-09-21', route_name: 'Route B - Hatton', vehicle_no: 'WP-KB-5678' },
  { schedule_id: 3, date: '2026-09-20', route_name: 'Route A - Nuwara Eliya', vehicle_no: 'WP-KA-1234' },
  { schedule_id: 4, date: '2026-09-20', route_name: 'Route C - Kandy', vehicle_no: 'WP-KC-9012' },
  { schedule_id: 5, date: '2026-09-19', route_name: 'Route B - Hatton', vehicle_no: 'WP-KB-5678' },
  { schedule_id: 6, date: '2026-09-19', route_name: 'Route A - Nuwara Eliya', vehicle_no: 'WP-KA-1234' },
];

export const TEA_COLLECTIONS = [
  { collection_id: 1, schedule_id: 1, supplier_id: 1, date: '2026-09-21', time: '07:30', gross_weight: 520, water_deduction_kg: 41.6, net_weight: 478.4, rate_id: 1 },
  { collection_id: 2, schedule_id: 1, supplier_id: 2, date: '2026-09-21', time: '08:00', gross_weight: 380, water_deduction_kg: 30.4, net_weight: 349.6, rate_id: 1 },
  { collection_id: 3, schedule_id: 1, supplier_id: 3, date: '2026-09-21', time: '06:45', gross_weight: 85, water_deduction_kg: 6.8, net_weight: 78.2, rate_id: 1 },
  { collection_id: 4, schedule_id: 1, supplier_id: 4, date: '2026-09-21', time: '07:00', gross_weight: 92, water_deduction_kg: 7.36, net_weight: 84.64, rate_id: 1 },
  { collection_id: 5, schedule_id: 2, supplier_id: 5, date: '2026-09-21', time: '09:15', gross_weight: 650, water_deduction_kg: 52, net_weight: 598, rate_id: 1 },
  { collection_id: 6, schedule_id: 2, supplier_id: 7, date: '2026-09-21', time: '09:45', gross_weight: 430, water_deduction_kg: 34.4, net_weight: 395.6, rate_id: 1 },
  { collection_id: 7, schedule_id: 3, supplier_id: 1, date: '2026-09-20', time: '07:30', gross_weight: 490, water_deduction_kg: 39.2, net_weight: 450.8, rate_id: 1 },
  { collection_id: 8, schedule_id: 3, supplier_id: 2, date: '2026-09-20', time: '08:15', gross_weight: 360, water_deduction_kg: 28.8, net_weight: 331.2, rate_id: 1 },
  { collection_id: 9, schedule_id: 4, supplier_id: 5, date: '2026-09-20', time: '09:00', gross_weight: 580, water_deduction_kg: 46.4, net_weight: 533.6, rate_id: 1 },
  { collection_id: 10, schedule_id: 5, supplier_id: 2, date: '2026-09-19', time: '08:30', gross_weight: 410, water_deduction_kg: 32.8, net_weight: 377.2, rate_id: 2 },
  { collection_id: 11, schedule_id: 6, supplier_id: 1, date: '2026-09-19', time: '07:45', gross_weight: 500, water_deduction_kg: 40, net_weight: 460, rate_id: 2 },
  { collection_id: 12, schedule_id: 6, supplier_id: 3, date: '2026-09-19', time: '06:50', gross_weight: 78, water_deduction_kg: 6.24, net_weight: 71.76, rate_id: 2 },
  { collection_id: 13, schedule_id: 1, supplier_id: 6, date: '2026-09-18', time: '07:00', gross_weight: 96, water_deduction_kg: 7.68, net_weight: 88.32, rate_id: 2 },
  { collection_id: 14, schedule_id: 2, supplier_id: 7, date: '2026-09-18', time: '09:30', gross_weight: 520, water_deduction_kg: 41.6, net_weight: 478.4, rate_id: 2 },
  { collection_id: 15, schedule_id: 1, supplier_id: 1, date: '2026-09-17', time: '07:30', gross_weight: 545, water_deduction_kg: 43.6, net_weight: 501.4, rate_id: 2 },
  { collection_id: 16, schedule_id: 2, supplier_id: 5, date: '2026-09-17', time: '09:00', gross_weight: 620, water_deduction_kg: 49.6, net_weight: 570.4, rate_id: 2 },
  { collection_id: 17, schedule_id: 1, supplier_id: 3, date: '2026-09-16', time: '07:00', gross_weight: 89, water_deduction_kg: 7.12, net_weight: 81.88, rate_id: 2 },
  { collection_id: 18, schedule_id: 1, supplier_id: 4, date: '2026-09-16', time: '07:15', gross_weight: 102, water_deduction_kg: 8.16, net_weight: 93.84, rate_id: 2 },
];

export const DAILY_LEAF_RATES = [
  { rate_id: 1, effective_date: '2026-09-21', rate_per_kg: 148.50 },
  { rate_id: 2, effective_date: '2026-09-15', rate_per_kg: 145.00 },
  { rate_id: 3, effective_date: '2026-09-01', rate_per_kg: 142.00 },
  { rate_id: 4, effective_date: '2026-08-01', rate_per_kg: 138.50 },
];

export const PRODUCTION_BATCHES = [
  { batch_id: 1, prod_date: '2026-09-21', input_qty: 1820, wastage_qty: 45, batch_status: 'In Progress' },
  { batch_id: 2, prod_date: '2026-09-20', input_qty: 1316, wastage_qty: 32, batch_status: 'Completed' },
  { batch_id: 3, prod_date: '2026-09-19', input_qty: 909, wastage_qty: 22, batch_status: 'Completed' },
  { batch_id: 4, prod_date: '2026-09-18', input_qty: 567, wastage_qty: 14, batch_status: 'Completed' },
  { batch_id: 5, prod_date: '2026-09-17', input_qty: 1072, wastage_qty: 26, batch_status: 'Completed' },
];

export const PRODUCTION_STAGES = [
  { stage_id: 1, stage_name: 'Withering', stage_no: 1 },
  { stage_id: 2, stage_name: 'Rolling', stage_no: 2 },
  { stage_id: 3, stage_name: 'Aeration/Fermentation', stage_no: 3 },
  { stage_id: 4, stage_name: 'Drying', stage_no: 4 },
  { stage_id: 5, stage_name: 'Grading', stage_no: 5 },
];

export const PRODUCTION_STAGE_LOGS = [
  { stage_log_id: 1, batch_id: 1, stage_id: 1, machine_no: 'WM-01', input_weight: 1820, output_weight: 1638, weight_loss: 182, start_end_time: '2026-09-21 06:00 - 2026-09-21 10:00' },
  { stage_log_id: 2, batch_id: 1, stage_id: 2, machine_no: 'RM-02', input_weight: 1638, output_weight: 1556, weight_loss: 82, start_end_time: '2026-09-21 10:30 - 2026-09-21 13:30' },
  { stage_log_id: 3, batch_id: 1, stage_id: 3, machine_no: 'AM-01', input_weight: 1556, output_weight: 1478, weight_loss: 78, start_end_time: '2026-09-21 14:00 - ...' },
  { stage_log_id: 4, batch_id: 2, stage_id: 1, machine_no: 'WM-01', input_weight: 1316, output_weight: 1185, weight_loss: 131, start_end_time: '2026-09-20 06:00 - 2026-09-20 10:00' },
  { stage_log_id: 5, batch_id: 2, stage_id: 2, machine_no: 'RM-01', input_weight: 1185, output_weight: 1126, weight_loss: 59, start_end_time: '2026-09-20 10:30 - 2026-09-20 13:30' },
  { stage_log_id: 6, batch_id: 2, stage_id: 3, machine_no: 'AM-01', input_weight: 1126, output_weight: 1070, weight_loss: 56, start_end_time: '2026-09-20 14:00 - 2026-09-20 18:00' },
  { stage_log_id: 7, batch_id: 2, stage_id: 4, machine_no: 'DM-01', input_weight: 1070, output_weight: 320, weight_loss: 750, start_end_time: '2026-09-20 18:30 - 2026-09-21 02:00' },
  { stage_log_id: 8, batch_id: 2, stage_id: 5, machine_no: 'GM-01', input_weight: 320, output_weight: 305, weight_loss: 15, start_end_time: '2026-09-21 02:30 - 2026-09-21 06:00' },
  { stage_log_id: 9, batch_id: 3, stage_id: 1, machine_no: 'WM-02', input_weight: 909, output_weight: 818, weight_loss: 91, start_end_time: '2026-09-19 06:00 - 2026-09-19 10:00' },
  { stage_log_id: 10, batch_id: 3, stage_id: 2, machine_no: 'RM-02', input_weight: 818, output_weight: 777, weight_loss: 41, start_end_time: '2026-09-19 10:30 - 2026-09-19 13:30' },
  { stage_log_id: 11, batch_id: 3, stage_id: 3, machine_no: 'AM-02', input_weight: 777, output_weight: 739, weight_loss: 38, start_end_time: '2026-09-19 14:00 - 2026-09-19 18:00' },
  { stage_log_id: 12, batch_id: 3, stage_id: 4, machine_no: 'DM-01', input_weight: 739, output_weight: 222, weight_loss: 517, start_end_time: '2026-09-19 18:30 - 2026-09-20 02:00' },
  { stage_log_id: 13, batch_id: 3, stage_id: 5, machine_no: 'GM-01', input_weight: 222, output_weight: 211, weight_loss: 11, start_end_time: '2026-09-20 02:30 - 2026-09-20 05:30' },
];

export const TEA_GRADES = [
  { grade_id: 1, grade_name: 'BOP', description: 'Broken Orange Pekoe - Premium grade' },
  { grade_id: 2, grade_name: 'BOPF', description: 'Broken Orange Pekoe Fannings' },
  { grade_id: 3, grade_name: 'Dust', description: 'Fine tea dust grade' },
  { grade_id: 4, grade_name: 'FF', description: 'Flowery Fannings' },
  { grade_id: 5, grade_name: 'BP', description: 'Broken Pekoe' },
];

export const FINISHED_OUTPUTS = [
  { output_id: 1, batch_id: 2, grade_id: 1, quantity: 125, unit_cost: 1850, out_date: '2026-09-21', tax_percentage: 8 },
  { output_id: 2, batch_id: 2, grade_id: 2, quantity: 90, unit_cost: 1650, out_date: '2026-09-21', tax_percentage: 8 },
  { output_id: 3, batch_id: 2, grade_id: 3, quantity: 65, unit_cost: 1200, out_date: '2026-09-21', tax_percentage: 8 },
  { output_id: 4, batch_id: 2, grade_id: 4, quantity: 25, unit_cost: 1400, out_date: '2026-09-21', tax_percentage: 8 },
  { output_id: 5, batch_id: 3, grade_id: 1, quantity: 85, unit_cost: 1850, out_date: '2026-09-20', tax_percentage: 8 },
  { output_id: 6, batch_id: 3, grade_id: 2, quantity: 72, unit_cost: 1650, out_date: '2026-09-20', tax_percentage: 8 },
  { output_id: 7, batch_id: 3, grade_id: 3, quantity: 40, unit_cost: 1200, out_date: '2026-09-20', tax_percentage: 8 },
  { output_id: 8, batch_id: 3, grade_id: 5, quantity: 14, unit_cost: 1550, out_date: '2026-09-20', tax_percentage: 8 },
];

export const SUPPLIER_PAYMENTS = [
  { payment_id: 1, supplier_id: 1, pay_date: '2026-09-15', amount: 72345, payment_status: 'Paid' },
  { payment_id: 2, supplier_id: 2, pay_date: '2026-09-15', amount: 52200, payment_status: 'Paid' },
  { payment_id: 3, supplier_id: 5, pay_date: '2026-09-15', amount: 84100, payment_status: 'Paid' },
  { payment_id: 4, supplier_id: 7, pay_date: '2026-09-15', amount: 63550, payment_status: 'Pending' },
  { payment_id: 5, supplier_id: 1, pay_date: '2026-08-15', amount: 68900, payment_status: 'Paid' },
  { payment_id: 6, supplier_id: 2, pay_date: '2026-08-15', amount: 49800, payment_status: 'Paid' },
];

export const ATTENDANCE = [
  { attendance_id: 1, employee_id: 1, date: '2026-09-21', status: 'Present', work_hours: 8 },
  { attendance_id: 2, employee_id: 2, date: '2026-09-21', status: 'Present', work_hours: 8.5 },
  { attendance_id: 3, employee_id: 3, date: '2026-09-21', status: 'Present', work_hours: 8 },
  { attendance_id: 4, employee_id: 4, date: '2026-09-21', status: 'Present', work_hours: 8 },
  { attendance_id: 5, employee_id: 5, date: '2026-09-21', status: 'On Leave', work_hours: 0 },
  { attendance_id: 6, employee_id: 6, date: '2026-09-21', status: 'Present', work_hours: 9 },
  { attendance_id: 7, employee_id: 7, date: '2026-09-21', status: 'Present', work_hours: 8 },
  { attendance_id: 8, employee_id: 8, date: '2026-09-21', status: 'Present', work_hours: 8 },
];
