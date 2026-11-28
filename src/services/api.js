// TeaSyncPro Central API Client
// Connects React frontend directly to Node.js / Database REST API with mockData fallback

import * as MOCK from '../data/mockData';

const BASE_URL = '/api';
const TOKEN_KEY = 'teasync_token';

let authToken = typeof window !== 'undefined' ? window.sessionStorage.getItem(TOKEN_KEY) : null;

function emitDataChanged(action) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('teasync:data-changed', { detail: { action } }));
  }
}

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
  // COLLECTIONS
  async getCollections() {
    const data = await request('/collections');
    return data || MOCK.TEA_COLLECTIONS;
  },

  async createCollection(collectionData) {
    const res = await request('/collections', {
      method: 'POST',
      body: JSON.stringify(collectionData)
    });
    if (res) emitDataChanged('collection:create');
    return res;
  },

  async updateCollection(id, collectionData) {
    const res = await request(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collectionData)
    });
    if (res) emitDataChanged('collection:update');
    return res;
  },

  async deleteCollection(id) {
    const res = await request(`/collections/${id}`, {
      method: 'DELETE'
    });
    if (res) emitDataChanged('collection:delete');
    return res;
  },

  async getSchedules() {
    const data = await request('/collections/meta/schedules');
    return data || MOCK.COLLECTION_SCHEDULES;
  },

  async createSchedule(scheduleData) {
    const res = await request('/collections/meta/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
    if (res) emitDataChanged('schedule:create');
    return res;
  },

  async getRates() {
    const data = await request('/collections/meta/rates');
    return data || MOCK.DAILY_LEAF_RATES;
  },

  async createRate(rateData) {
    const res = await request('/collections/meta/rates', {
      method: 'POST',
      body: JSON.stringify(rateData)
    });
    if (res) emitDataChanged('rate:create');
    return res;
  },

  // SUPPLIERS 
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

  // PRODUCTION BATCHES & STAGES
  async getBatches() {
    const data = await request('/batches');
    return data || MOCK.PRODUCTION_BATCHES;
  },

  async createBatch(batchData) {
    const res = await request('/batches', {
      method: 'POST',
      body: JSON.stringify(batchData)
    });
    if (res) emitDataChanged('batch:create');
    return res;
  },

  async updateBatch(id, batchData) {
    const res = await request(`/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(batchData)
    });
    if (res) emitDataChanged('batch:update');
    return res;
  },

  async getStageLogs() {
    const data = await request('/batches/logs/all');
    return data || MOCK.PRODUCTION_STAGE_LOGS;
  },

  async createStageLog(logData) {
    const res = await request('/batches/logs', {
      method: 'POST',
      body: JSON.stringify(logData)
    });
    if (res) emitDataChanged('stage:create');
    return res;
  },

  async getProductionStages() {
    const data = await request('/batches/meta/stages');
    return data || MOCK.PRODUCTION_STAGES;
  },

  // GRADING & FINISHED GOODS
  async getFinishedOutputs() {
    const data = await request('/grading');
    return data || MOCK.FINISHED_OUTPUTS;
  },

  async createFinishedOutput(outputData) {
    const res = await request('/grading', {
      method: 'POST',
      body: JSON.stringify(outputData)
    });
    if (res) emitDataChanged('grading:create');
    return res;
  },

  async deleteFinishedOutput(id) {
    const res = await request(`/grading/${id}`, {
      method: 'DELETE'
    });
    if (res) emitDataChanged('grading:delete');
    return res;
  },

  async getTeaGrades() {
    const data = await request('/grading/grades');
    return data || MOCK.TEA_GRADES;
  },

  // FINANCE & PAYMENTS
  async getSupplierPayments() {
    const data = await request('/finance/payments');
    return data || MOCK.SUPPLIER_PAYMENTS;
  },

  async createSupplierPayment(paymentData) {
    const res = await request('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
    if (res) emitDataChanged('payment:create');
    return res;
  },

  async updatePaymentStatus(id, payment_status) {
    const res = await request(`/finance/payments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status })
    });
    if (res) emitDataChanged('payment:update');
    return res;
  },

  // EMPLOYEES & ATTENDANCE
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

  // SALES INVOICES 
  async getSalesInvoices() {
    const data = await request('/sales');
    return data || [];
  },

  async createSalesInvoice(invoiceData) {
    const res = await request('/sales', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
    if (res) emitDataChanged('sales:create');
    return res;
  },

  async updateSalesInvoiceStatus(id, payment_status) {
    const res = await request(`/sales/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status })
    });
    if (res) emitDataChanged('sales:update');
    return res;
  },

  // DASHBOARD SUMMARY & LIVE NOTIFICATIONS
  async getDashboardSummary() {
    return await request('/dashboard/summary');
  },

  async getNotifications() {
    return await request('/dashboard/notifications');
  },

  // AUTHENTICATION
  async getUsers() {
    const data = await request('/auth/users');
    return data || MOCK.USERS.map(({ password_sha256: _ignored, ...u }) => u);
  },

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

  async requestPasswordReset(username, email) {
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data.error || 'Could not process password reset request.' };
      return data;
    } catch {
      return { error: 'Backend server is offline. Start the server to reset passwords.' };
    }
  },

  async resetPassword(username, code, newPassword) {
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code, newPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data.error || 'Password reset failed.' };
      return data;
    } catch {
      return { error: 'Backend server is offline. Start the server to reset passwords.' };
    }
  },

  logout() {
    setAuthToken(null);
  }
};

export default api;
