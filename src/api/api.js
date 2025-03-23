import axios from 'axios';

// Set base URL for Laravel backend
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Resident API
export const residentAPI = {
  getAll: () => axios.get('/api/residents'),
  getById: (id) => axios.get(`/api/residents/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return axios.post('/api/residents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    formData.append('_method', 'PUT');
    return axios.post(`/api/residents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => axios.delete(`/api/residents/${id}`),
};

// House API
export const houseAPI = {
  getAll: () => axios.get('/api/houses'),
  getById: (id) => axios.get(`/api/houses/${id}`),
  create: (data) => axios.post('/api/houses', data),
  update: (id, data) => axios.put(`/api/houses/${id}`, data),
  delete: (id) => axios.delete(`/api/houses/${id}`),
  getHistory: (id) => axios.get(`/api/houses/${id}/history`),
  getPaymentHistory: (id) => axios.get(`/api/houses/${id}/payment-history`),
  addResident: (houseId, data) => axios.post(`/api/houses/${houseId}/add-resident`, data),
  removeResident: (houseId, data) => axios.post(`/api/houses/${houseId}/remove-resident`, data),
};

// Payment API
export const paymentAPI = {
  getAll: (params) => axios.get('/api/payments', { params }),
  getById: (id) => axios.get(`/api/payments/${id}`),
  create: (data) => axios.post('/api/payments', data),
  update: (id, data) => axios.put(`/api/payments/${id}`, data),
  delete: (id) => axios.delete(`/api/payments/${id}`),
  getSummary: (year) => axios.get(`/api/payments/summary?year=${year}`),
  getMonthlyDetail: (year, month) => axios.get(`/api/payments/monthly-detail?year=${year}&month=${month}`),
};

// Expense API
export const expenseAPI = {
  getAll: (params) => axios.get('/api/expenses', { params }),
  getById: (id) => axios.get(`/api/expenses/${id}`),
  create: (data) => axios.post('/api/expenses', data),
  update: (id, data) => axios.put(`/api/expenses/${id}`, data),
  delete: (id) => axios.delete(`/api/expenses/${id}`),
};

// Payment API
export const statisticAPI = {
  getDashboard: (year) => axios.get(`/api/statistics/dashboard?year=${year}`),
};

// Interceptor for handling errors globally
axios.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    // Handle specific error statuses
    if (response) {
      switch (response.status) {
        case 401: // Unauthorized
          console.error('Unauthorized access');
          break;
        case 403: // Forbidden
          console.error('Forbidden access');
          break;
        case 404: // Not Found
          console.error('Resource not found');
          break;
        case 422: // Validation Error
          console.error('Validation error', response.data.errors);
          break;
        case 500: // Server Error
          console.error('Server error');
          break;
        default:
          console.error('An error occurred:', response.data);
      }
    } else {
      console.error('Network error or server is not responding');
    }
    
    return Promise.reject(error);
  }
);

export default {
  residentAPI,
  houseAPI,
  paymentAPI,
  expenseAPI
};