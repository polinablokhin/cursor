import axios, { AxiosResponse } from 'axios';
import {
  Country,
  VATRate,
  Report,
  Field,
  CreateCountryRequest,
  CreateVATRateRequest,
  CreateReportRequest,
  CreateFieldRequest,
  CountryWithDetails,
  ReportWithFields,
  SearchFilters
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw { error: 'Network error or server unavailable' };
  }
);

// Country API
export const countryApi = {
  getAll: async (search?: string): Promise<Country[]> => {
    const params = search ? { search } : {};
    const response: AxiosResponse<Country[]> = await api.get('/countries', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Country> => {
    const response: AxiosResponse<Country> = await api.get(`/countries/${id}`);
    return response.data;
  },

  getByIdWithDetails: async (id: number): Promise<CountryWithDetails> => {
    const response: AxiosResponse<CountryWithDetails> = await api.get(`/countries/${id}/details`);
    return response.data;
  },

  create: async (data: CreateCountryRequest): Promise<Country> => {
    const response: AxiosResponse<Country> = await api.post('/countries', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateCountryRequest>): Promise<Country> => {
    const response: AxiosResponse<Country> = await api.put(`/countries/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/countries/${id}`);
  },
};

// VAT Rate API
export const vatRateApi = {
  getAll: async (): Promise<VATRate[]> => {
    const response: AxiosResponse<VATRate[]> = await api.get('/vat-rates');
    return response.data;
  },

  getById: async (id: number): Promise<VATRate> => {
    const response: AxiosResponse<VATRate> = await api.get(`/vat-rates/${id}`);
    return response.data;
  },

  getByCountryId: async (countryId: number): Promise<VATRate[]> => {
    const response: AxiosResponse<VATRate[]> = await api.get(`/countries/${countryId}/vat-rates`);
    return response.data;
  },

  create: async (data: CreateVATRateRequest): Promise<VATRate> => {
    const response: AxiosResponse<VATRate> = await api.post('/vat-rates', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateVATRateRequest>): Promise<VATRate> => {
    const response: AxiosResponse<VATRate> = await api.put(`/vat-rates/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/vat-rates/${id}`);
  },
};

// Report API
export const reportApi = {
  getAll: async (search?: string): Promise<Report[]> => {
    const params = search ? { search } : {};
    const response: AxiosResponse<Report[]> = await api.get('/reports', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Report> => {
    const response: AxiosResponse<Report> = await api.get(`/reports/${id}`);
    return response.data;
  },

  getByIdWithFields: async (id: number): Promise<ReportWithFields> => {
    const response: AxiosResponse<ReportWithFields> = await api.get(`/reports/${id}/details`);
    return response.data;
  },

  getByCountryId: async (countryId: number): Promise<Report[]> => {
    const response: AxiosResponse<Report[]> = await api.get(`/countries/${countryId}/reports`);
    return response.data;
  },

  create: async (data: CreateReportRequest): Promise<Report> => {
    const response: AxiosResponse<Report> = await api.post('/reports', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateReportRequest>): Promise<Report> => {
    const response: AxiosResponse<Report> = await api.put(`/reports/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },

  generatePDF: async (id: number, template?: string): Promise<Blob> => {
    const response = await api.post(`/reports/${id}/pdf`, { template }, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      },
    });
    return response.data;
  },
};

// Field API
export const fieldApi = {
  getAll: async (): Promise<Field[]> => {
    const response: AxiosResponse<Field[]> = await api.get('/fields');
    return response.data;
  },

  getById: async (id: number): Promise<Field> => {
    const response: AxiosResponse<Field> = await api.get(`/fields/${id}`);
    return response.data;
  },

  getByReportId: async (reportId: number): Promise<Field[]> => {
    const response: AxiosResponse<Field[]> = await api.get(`/reports/${reportId}/fields`);
    return response.data;
  },

  getByReportIdAndType: async (reportId: number, type: string): Promise<Field[]> => {
    const response: AxiosResponse<Field[]> = await api.get(`/reports/${reportId}/fields/${type}`);
    return response.data;
  },

  create: async (data: CreateFieldRequest): Promise<Field> => {
    const response: AxiosResponse<Field> = await api.post('/fields', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateFieldRequest>): Promise<Field> => {
    const response: AxiosResponse<Field> = await api.put(`/fields/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/fields/${id}`);
  },
};

// Health check API
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Utility functions
export const downloadPDF = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default api;