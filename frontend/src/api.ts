import axios from 'axios';
import { SquawkCase, Vendor, VendorMemoryStat, ActivityLog, BatchProcessResult } from './types';

const API_BASE = '/api';

export const api = {
  async getCases(status?: string, priority?: string): Promise<SquawkCase[]> {
    const params: any = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    const res = await axios.get(`${API_BASE}/cases`, { params });
    return res.data;
  },

  async getCase(id: string): Promise<SquawkCase> {
    const res = await axios.get(`${API_BASE}/cases/${id}`);
    return res.data;
  },

  async createCase(payload: any): Promise<SquawkCase> {
    const res = await axios.post(`${API_BASE}/cases`, payload);
    return res.data;
  },

  async processCase(id: string): Promise<SquawkCase> {
    const res = await axios.post(`${API_BASE}/cases/${id}/process`);
    return res.data;
  },

  async approveCase(id: string, payload: any): Promise<SquawkCase> {
    const res = await axios.post(`${API_BASE}/cases/${id}/approve`, payload);
    return res.data;
  },

  async rejectCase(id: string, payload: any): Promise<SquawkCase> {
    const res = await axios.post(`${API_BASE}/cases/${id}/reject`, payload);
    return res.data;
  },

  async requestInfoCase(id: string, payload: any): Promise<SquawkCase> {
    const res = await axios.post(`${API_BASE}/cases/${id}/request-info`, payload);
    return res.data;
  },

  async submitOutcome(id: string, payload: any): Promise<any> {
    const res = await axios.post(`${API_BASE}/cases/${id}/outcome`, payload);
    return res.data;
  },

  async processBatch(): Promise<BatchProcessResult> {
    const res = await axios.post(`${API_BASE}/batch/process`);
    return res.data;
  },

  async getVendors(): Promise<Vendor[]> {
    const res = await axios.get(`${API_BASE}/vendors`);
    return res.data;
  },

  async getMemory(): Promise<{ total_tracked_vendors: number; total_verified_outcomes: number; overall_system_reliability: number; vendor_stats: VendorMemoryStat[] }> {
    const res = await axios.get(`${API_BASE}/memory`);
    return res.data;
  },

  async getActivity(): Promise<ActivityLog[]> {
    const res = await axios.get(`${API_BASE}/activity`);
    return res.data;
  }
};
