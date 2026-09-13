import axios from 'axios';
import { SquawkCase, Vendor, VendorMemoryStat, ActivityLog, BatchProcessResult, VerificationReport } from './types';

const API_BASE = '/api';

export const api = {
  async getCases(status?: string, priority?: string, stage?: string): Promise<SquawkCase[]> {
    const params: any = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (stage) params.stage = stage;
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

  // -----------------------------------------------------------------------
  // SIMULATED ENVIRONMENT & CALLABLE TOOL CLIENTS
  // -----------------------------------------------------------------------
  async simulateDisruption(caseId: string, disruptionType: string = 'SUPPLIER_STOCKOUT'): Promise<any> {
    const res = await axios.post(`${API_BASE}/cases/${caseId}/disrupt`, {
      case_id: caseId,
      disruption_type: disruptionType
    });
    return res.data;
  },

  async replanRecovery(caseId: string): Promise<any> {
    const res = await axios.post(`${API_BASE}/cases/${caseId}/replan`, {
      case_id: caseId
    });
    return res.data;
  },

  async verifyRecovery(caseId: string): Promise<VerificationReport> {
    const res = await axios.post(`${API_BASE}/cases/${caseId}/verify`, {
      case_id: caseId
    });
    return res.data;
  },

  async getInventory(partNumber: string, location?: string): Promise<any> {
    const res = await axios.get(`${API_BASE}/inventory/${partNumber}`, { params: { location } });
    return res.data;
  },

  async searchSuppliers(partNumber: string): Promise<any[]> {
    const res = await axios.get(`${API_BASE}/suppliers/${partNumber}`);
    return res.data;
  },

  async verifyPart(partNumber: string, aircraftModel: string = 'Boeing 737-800', supplierId?: string): Promise<any> {
    const res = await axios.post(`${API_BASE}/verify-part`, {
      part_number: partNumber,
      aircraft_model: aircraftModel,
      supplier_id: supplierId
    });
    return res.data;
  },

  async calculateRoute(origin: string, destination: string = 'DEL'): Promise<any> {
    const res = await axios.post(`${API_BASE}/calculate-route`, {
      origin,
      destination
    });
    return res.data;
  },

  async optimizeRecovery(options: any[], constraints: any, weights?: any): Promise<any> {
    const res = await axios.post(`${API_BASE}/optimize`, {
      options,
      constraints,
      weights
    });
    return res.data;
  },

  async reservePart(supplierId: string, partNumber: string, quantity: number = 1, caseId?: string): Promise<any> {
    const res = await axios.post(`${API_BASE}/reserve-part`, {
      supplier_id: supplierId,
      part_number: partNumber,
      quantity,
      case_id: caseId
    });
    return res.data;
  },

  async createShipment(payload: any): Promise<any> {
    const res = await axios.post(`${API_BASE}/create-shipment`, payload);
    return res.data;
  },

  async getShipmentStatus(shipmentId: string): Promise<any> {
    const res = await axios.get(`${API_BASE}/shipment/${shipmentId}`);
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
  },

  async resetDemo(): Promise<any> {
    const res = await axios.post(`${API_BASE}/demo/reset`);
    return res.data;
  }
};
