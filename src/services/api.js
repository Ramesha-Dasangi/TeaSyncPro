// TeaSyncPro Central API Client
// Connects React frontend directly to Node.js / Database REST API with mockData fallback

import * as MOCK from '../data/mockData';

const BASE_URL = '/api';
const TOKEN_KEY = 'teasync_token';

let authToken = typeof window !== 'undefined' ? window.sessionStorage.getItem(TOKEN_KEY) : null;

export function setAuthToken(token) {
  authToken = token || null;
  if (typeof window !== 'undefined') {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  }
}

async function request(endpoint, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401 || res.status === 403) {
      const errData = await res.json().catch(() => ({}));
      console.warn(`[API] Access denied (${res.status}) for ${endpoint}:`, errData.error || res.statusText);
      return null;
    }

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[API] Fallback to local memory for ${endpoint}:`, err.message);
    return null;
  }
}

export const api = {
  // ─── COLLECTIONS ──────────────────────────────────────────
  async getCollections() {
    const data = await request('/collections');
    return data || MOCK.TEA_COLLECTIONS;
  },

  async createCollection(collectionData) {
    const res = await request('/collections', {
      method: 'POST',
      body: JSON.stringify(collectionData)
    });
    return res;
  },

  async updateCollection(id, collectionData) {
    return await request(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collectionData)
    });
  },

  async deleteCollection(id) {
    return await request(`/collections/${id}`, {
      method: 'DELETE'
    });
  },

  async getSchedules() {
    const data = await request('/collections/meta/schedules');
    return data || MOCK.COLLECTION_SCHEDULES;
  },

  async createSchedule(scheduleData) {
    return await request('/collections/meta/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  },

  async getRates() {
    const data = await request('/collections/meta/rates');
    return data || MOCK.DAILY_LEAF_RATES;
  },

  async createRate(rateData) {
    return await request('/collections/meta/rates', {
      method: 'POST',
      body: JSON.stringify(rateData)
    });
  },

  // ─── SUPPLIERS ────────────────────────────────────────────
  async getSuppliers() {
    const data = await request('/suppliers');
    return data || MOCK.SUPPLIERS;
  },

  async createSupplier(supplierData) {
    return await request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData)
    });
  },

  async updateSupplier(id, supplierData) {
    return await request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData)
    });
  },

  async deleteSupplier(id) {
    return await request(`/suppliers/${id}`, {
      method: 'DELETE'
    });
  },

  // ─── PRODUCTION BATCHES & STAGES ─────────────────────────
  async getBatches() {
    const data = await request('/batches');
    return data || MOCK.PRODUCTION_BATCHES;
  },

  async createBatch(batchData) {
    return await request('/batches', {
      method: 'POST',
      body: JSON.stringify(batchData)
    });
  },

  async updateBatch(id, batchData) {
    return await request(`/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(batchData)
    });
  },

  async getStageLogs() {
    const data = await request('/batches/logs/all');
    return data || MOCK.PRODUCTION_STAGE_LOGS;
  },

  async createStageLog(logData) {
    return await request('/batches/logs', {
      method: 'POST',
      body: JSON.stringify(logData)
    });
  },

  async getProductionStages() {
    const data = await request('/batches/meta/stages');
    return data || MOCK.PRODUCTION_STAGES;
  },

  // ─── GRADING & FINISHED GOODS ─────────────────────────────
  async getFinishedOutputs() {
    const data = await request('/grading');
    return data || MOCK.FINISHED_OUTPUTS;
  },

  async createFinishedOutput(outputData) {
    return await request('/grading', {
      method: 'POST',
      body: JSON.stringify(outputData)
    });
  },

  async deleteFinishedOutput(id) {
    return await request(`/grading/${id}`, {
      method: 'DELETE'
    });
  },

  async getTeaGrades() {
    const data = await request('/grading/grades');
    return data || MOCK.TEA_GRADES;
  },

  // ─── FINANCE & PAYMENTS ───────────────────────────────────
  async getSupplierPayments() {
    const data = await request('/finance/payments');
    return data || MOCK.SUPPLIER_PAYMENTS;
  },

  async createSupplierPayment(paymentData) {
    return await request('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  async updatePaymentStatus(id, payment_status) {
    return await request(`/finance/payments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status })
    });
  },

  // ─── EMPLOYEES & ATTENDANCE ───────────────────────────────
  async getEmployees() {
    const data = await request('/employees');
    return data || MOCK.EMPLOYEES;
  },

  async createEmployee(employeeData) {
    return await request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  },

  async updateEmployee(id, employeeData) {
    return await request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData)
    });
  },

  async deleteEmployee(id) {
    return await request(`/employees/${id}`, {
      method: 'DELETE'
    });
  },

  async getAttendance() {
    const data = await request('/employees/meta/attendance');
    return data || [];
  },

  async markAttendance(attendanceData) {
    return await request('/employees/meta/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  },

  // ─── SALES INVOICES ───────────────────────────────────────
  async getSalesInvoices() {
    const data = await request('/sales');
    return data || [];
  },

  async createSalesInvoice(invoiceData) {
    return await request('/sales', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  },

  async updateSalesInvoiceStatus(id, payment_status) {
    return await request(`/sales/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status })
    });
  },

  // ─── DASHBOARD SUMMARY ────────────────────────────────────
  async getDashboardSummary() {
    return await request('/dashboard/summary');
  },

  // ─── AUTHENTICATION ───────────────────────────────────────
  async login(username, password) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.status === 401 || res.status === 403 || res.status === 400) {
        return { error: 'Invalid username or password. Please try again.' };
      }
      if (res.status === 429) {
        return { error: 'Too many login attempts. Please try again later.' };
      }
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data?.token) setAuthToken(data.token);
      return { user: data };
    } catch (err) {
      console.warn('[API] Auth offline, falling back to local users:', err.message);
      return null;
    }
  },

  logout() {
    setAuthToken(null);
  }
};

export default api;
