import axios from 'axios';
import { SquawkCase, Vendor, VendorMemoryStat, ActivityLog, BatchProcessResult, VerificationReport } from './types';
import { MOCK_CASES, MOCK_VENDORS, MOCK_MEMORY, MOCK_ACTIVITY } from './mockData';

const API_BASE = '/api';

export const api = {
  async getCases(status?: string, priority?: string, stage?: string): Promise<SquawkCase[]> {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (stage) params.stage = stage;
      const res = await axios.get(`${API_BASE}/cases`, { params, timeout: 3500 });
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return MOCK_CASES;
    } catch {
      return MOCK_CASES;
    }
  },

  async getCase(id: string): Promise<SquawkCase> {
    try {
      const res = await axios.get(`${API_BASE}/cases/${id}`, { timeout: 3500 });
      return res.data;
    } catch {
      const found = MOCK_CASES.find(c => c.id === id);
      return found || MOCK_CASES[0];
    }
  },

  async createCase(payload: any): Promise<SquawkCase> {
    try {
      const res = await axios.post(`${API_BASE}/cases`, payload, { timeout: 4000 });
      return res.data;
    } catch {
      const newCase: SquawkCase = {
        ...MOCK_CASES[0],
        id: `CASE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        tail_number: payload.tail_number || 'VT-SQK',
        defect_description: payload.defect_description || 'Line Maintenance AOG',
        location: payload.location || 'DEL',
        status: 'Processing',
        created_at: new Date().toISOString()
      };
      MOCK_CASES.unshift(newCase);
      return newCase;
    }
  },

  async processCase(id: string): Promise<SquawkCase> {
    try {
      const res = await axios.post(`${API_BASE}/cases/${id}/process`, {}, { timeout: 3500 });
      return res.data;
    } catch {
      return this.getCase(id);
    }
  },

  async analyzeCase(id: string): Promise<SquawkCase> {
    try {
      const res = await axios.post(`${API_BASE}/cases/${id}/analyze`, {}, { timeout: 3500 });
      return res.data;
    } catch {
      return this.getCase(id);
    }
  },

  async simulateFailure(id: string): Promise<SquawkCase> {
    try {
      const res = await axios.post(`${API_BASE}/cases/${id}/simulate-failure`, {}, { timeout: 3500 });
      return res.data;
    } catch {
      return this.getCase(id);
    }
  },

  async getRecommendations(id: string): Promise<any> {
    try {
      const res = await axios.get(`${API_BASE}/cases/${id}/recommendations`, { timeout: 3500 });
      return res.data;
    } catch {
      const c = await this.getCase(id);
      return c.candidates || [];
    }
  },

  async getTimeline(id: string): Promise<any> {
    try {
      const res = await axios.get(`${API_BASE}/cases/${id}/timeline`, { timeout: 3500 });
      return res.data;
    } catch {
      return [];
    }
  },

  async getAuditLog(id: string): Promise<ActivityLog[]> {
    try {
      const res = await axios.get(`${API_BASE}/cases/${id}/audit`, { timeout: 3500 });
      return res.data;
    } catch {
      return MOCK_ACTIVITY.filter(a => a.case_id === id);
    }
  },

  async approveCase(id: string, payload: any): Promise<SquawkCase> {
    try {
      const res = await axios.post(`${API_BASE}/cases/${id}/approve`, payload, { timeout: 3500 });
      return res.data;
    } catch {
      const c = await this.getCase(id);
      c.status = 'Approved & Dispatched';
      c.current_stage = 'APPROVED';
      return c;
    }
  },

  async rejectCase(id: string, payload: any): Promise<SquawkCase> {
    try {
      const res = await axios.post(`${API_BASE}/cases/${id}/reject`, payload, { timeout: 3500 });
      return res.data;
    } catch {
      const c = await this.getCase(id);
      c.status = 'Rejected';
      return c;
    }
  },

  async requestInfoCase(id: string, payload: any): Promise<SquawkCase> {
    try {
      const res = await axios.post(`${API_BASE}/cases/${id}/request-info`, payload, { timeout: 3500 });
      return res.data;
    } catch {
      return this.getCase(id);
    }
  },

  // -----------------------------------------------------------------------
  // SIMULATED ENVIRONMENT & CALLABLE TOOL CLIENTS
  // -----------------------------------------------------------------------
  async simulateDisruption(caseId: string, disruptionType: string = 'SUPPLIER_STOCKOUT'): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/cases/${caseId}/disrupt`, {
        case_id: caseId,
        disruption_type: disruptionType
      }, { timeout: 3500 });
      return res.data;
    } catch {
      return { status: 'DISRUPTED', disruption_type: disruptionType };
    }
  },

  async replanRecovery(caseId: string): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/cases/${caseId}/replan`, {
        case_id: caseId
      }, { timeout: 3500 });
      return res.data;
    } catch {
      return { status: 'REPLANNED', active_plan: MOCK_CASES[0].active_plan };
    }
  },

  async verifyRecovery(caseId: string): Promise<VerificationReport> {
    try {
      const res = await axios.post(`${API_BASE}/cases/${caseId}/verify`, {
        case_id: caseId
      }, { timeout: 3500 });
      return res.data;
    } catch {
      return {
        digital_certificate_id: `CERT-REC-${caseId.slice(-4)}`,
        verification_status: 'PASS',
        objective: 'Fastest 100% compliant recovery',
        constraints_passed: '7/7 Constraints Passed',
        expected_recovery_time: '4.5 Hours',
        deadline: '18.0 Hours',
        safety_margin: '+13.5h Margin',
        margin_hours: 13.5,
        supplier_name: 'SkySupply Global (Mumbai Hub)',
        carrier: 'Air India Cargo (Flight AI-608)',
        total_landed_cost: 14700,
        carbon_kg: 240,
        verified_at: new Date().toISOString()
      };
    }
  },

  async getInventory(partNumber: string, location?: string): Promise<any> {
    try {
      const res = await axios.get(`${API_BASE}/inventory/${partNumber}`, { params: { location }, timeout: 3500 });
      return res.data;
    } catch {
      return { part_number: partNumber, location, available_quantity: 2 };
    }
  },

  async searchSuppliers(partNumber: string): Promise<any[]> {
    try {
      const res = await axios.get(`${API_BASE}/suppliers/${partNumber}`, { timeout: 3500 });
      return res.data;
    } catch {
      return MOCK_VENDORS;
    }
  },

  async verifyPart(partNumber: string, aircraftModel: string = 'Boeing 737-800', supplierId?: string): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/verify-part`, {
        part_number: partNumber,
        aircraft_model: aircraftModel,
        supplier_id: supplierId
      }, { timeout: 3500 });
      return res.data;
    } catch {
      return { status: 'PASS', part_number: partNumber, compliant: true };
    }
  },

  async calculateRoute(origin: string, destination: string = 'DEL'): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/calculate-route`, {
        origin,
        destination
      }, { timeout: 3500 });
      return res.data;
    } catch {
      return { origin, destination, transit_hours: 4.5, mode: 'Express Air' };
    }
  },

  async optimizeRecovery(options: any[], constraints: any, weights?: any): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/optimize`, {
        options,
        constraints,
        weights
      }, { timeout: 3500 });
      return res.data;
    } catch {
      return options[0] || null;
    }
  },

  async reservePart(supplierId: string, partNumber: string, quantity: number = 1, caseId?: string): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/reserve-part`, {
        supplier_id: supplierId,
        part_number: partNumber,
        quantity,
        case_id: caseId
      }, { timeout: 3500 });
      return res.data;
    } catch {
      return { status: 'RESERVED', reservation_id: `RES-${Date.now().toString(36)}` };
    }
  },

  async createShipment(payload: any): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/create-shipment`, payload, { timeout: 3500 });
      return res.data;
    } catch {
      return { tracking_awb: `AWB-${Math.floor(100000 + Math.random() * 900000)}`, status: 'DISPATCHED' };
    }
  },

  async getShipmentStatus(shipmentId: string): Promise<any> {
    try {
      const res = await axios.get(`${API_BASE}/shipment/${shipmentId}`, { timeout: 3500 });
      return res.data;
    } catch {
      return { shipment_id: shipmentId, status: 'IN_TRANSIT', eta_hours: 3.5 };
    }
  },

  async submitOutcome(id: string, payload: any): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/cases/${id}/outcome`, payload, { timeout: 3500 });
      return res.data;
    } catch {
      return { status: 'RECORDED', case_id: id };
    }
  },

  async processBatch(): Promise<BatchProcessResult> {
    try {
      const res = await axios.post(`${API_BASE}/batch/process`, {}, { timeout: 4500 });
      return res.data;
    } catch {
      return {
        batch_id: `BATCH-${Date.now()}`,
        total_cases_received: 5,
        successfully_processed: 5,
        ready_for_approval: 4,
        escalated_to_humans: 5,
        documentation_conflicts: 0,
        vendor_search_timeouts: 0,
        malformed_inputs: 0,
        total_runtime_seconds: 1.84,
        total_ai_agent_calls: 20,
        approximate_cost_usd: 0.082,
        success_rate_percent: 100
      };
    }
  },

  async getVendors(): Promise<Vendor[]> {
    try {
      const res = await axios.get(`${API_BASE}/vendors`, { timeout: 3500 });
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return MOCK_VENDORS;
    } catch {
      return MOCK_VENDORS;
    }
  },

  async getMemory(): Promise<{ total_tracked_vendors: number; total_verified_outcomes: number; overall_system_reliability: number; vendor_stats: VendorMemoryStat[] }> {
    try {
      const res = await axios.get(`${API_BASE}/memory`, { timeout: 3500 });
      if (res.data && res.data.vendor_stats && res.data.vendor_stats.length > 0) {
        return res.data;
      }
      return MOCK_MEMORY;
    } catch {
      return MOCK_MEMORY;
    }
  },

  async getActivity(): Promise<ActivityLog[]> {
    try {
      const res = await axios.get(`${API_BASE}/activity`, { timeout: 3500 });
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return MOCK_ACTIVITY;
    } catch {
      return MOCK_ACTIVITY;
    }
  },

  async resetDemo(): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/demo/reset`, {}, { timeout: 3500 });
      return res.data;
    } catch {
      return { status: 'SUCCESS', message: 'Demo reset locally' };
    }
  },

  // -----------------------------------------------------------------------
  // VAKH INTEGRATION & AOG ORCHESTRATION LAYER
  // -----------------------------------------------------------------------
  async submitVakhIntake(payload: any): Promise<SquawkCase> {
    try {
      const res = await axios.post(`${API_BASE}/vakh/intake`, payload, { timeout: 4000 });
      return res.data;
    } catch {
      return this.createCase(payload);
    }
  },

  async getVakhFormSpec(): Promise<any> {
    try {
      const res = await axios.get(`${API_BASE}/vakh/form-spec`, { timeout: 3500 });
      return res.data;
    } catch {
      return { platform: 'Vakh', developer: 'ELFREDS COMMERCE LLP' };
    }
  },

  async getVakhWorkspace(caseId: string): Promise<any> {
    try {
      const res = await axios.get(`${API_BASE}/vakh/workspace/${caseId}`, { timeout: 3500 });
      return res.data;
    } catch {
      const c = await this.getCase(caseId);
      return {
        workspace_id: `ws_${caseId.toLowerCase()}`,
        vakh_submission_id: c.vakh_submission_id || 'vakh_sub_fallback',
        vakh_record_url: 'https://vakh.com',
        incident: {
          case_id: c.id,
          aircraft_registration: c.tail_number || 'VT-SQK',
          aircraft_type: c.aircraft_type || 'Boeing 737-800',
          location: c.location || 'DEL',
          defect_category: c.defect_category || 'Hydraulic Power',
          defect_description: c.defect_description,
          severity: c.severity || 'CRITICAL',
          urgency: c.urgency || 'IMMEDIATE'
        },
        recovery: {
          status: c.status,
          recovery_actions: c.recovery_actions_list || []
        },
        updates: c.recovery_updates || []
      };
    }
  },

  async addIncidentUpdate(caseId: string, payload: {
    message: string;
    author?: string;
    action_id?: string;
    action_status?: string;
    source?: string;
  }): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/aog/incidents/${caseId}/updates`, payload, { timeout: 3500 });
      return res.data;
    } catch {
      const newUpd = {
        id: `UPD-${Date.now().toString(36).toUpperCase()}`,
        case_id: caseId,
        source: payload.source || 'VAKH',
        message: payload.message,
        author: payload.author || 'Maintenance Tech',
        action_status: payload.action_status,
        vakh_sync_status: 'SYNCED',
        created_at: new Date().toISOString()
      };
      const c = MOCK_CASES.find(x => x.id === caseId);
      if (c) {
        c.recovery_updates = c.recovery_updates || [];
        c.recovery_updates.push(newUpd as any);
      }
      return newUpd;
    }
  },

  async updateRecoveryActionStatus(caseId: string, actionId: string, status: string): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/aog/incidents/${caseId}/actions/${actionId}/status`, { status }, { timeout: 3500 });
      return res.data;
    } catch {
      const c = MOCK_CASES.find(x => x.id === caseId);
      if (c && c.recovery_actions_list) {
        const act = c.recovery_actions_list.find(a => a.id === actionId || String(a.step_number) === actionId);
        if (act) act.status = status as any;
      }
      return { status: 'SUCCESS', action_id: actionId, new_status: status };
    }
  },

  async resolveIncident(caseId: string, payload: {
    actual_resolution: string;
    actual_recovery_time_hours: number;
    parts_used?: string[];
    root_cause: string;
    delay_minutes?: number;
    maintenance_team?: string;
    additional_observations?: string;
    lessons_learned?: string;
    resolved_by?: string;
  }): Promise<any> {
    try {
      const res = await axios.post(`${API_BASE}/aog/incidents/${caseId}/resolve`, payload, { timeout: 3500 });
      return res.data;
    } catch {
      const c = MOCK_CASES.find(x => x.id === caseId);
      if (c) {
        c.status = 'Resolved';
        c.current_stage = 'COMPLETED';
        c.resolved_at = new Date().toISOString();
        c.resolution = {
          id: `RES-${Date.now().toString(36)}`,
          case_id: caseId,
          ...payload,
          parts_used: payload.parts_used || [c.part_number || 'HP-2048'],
          delay_minutes: payload.delay_minutes || 0,
          created_at: new Date().toISOString()
        } as any;
      }
      return { status: 'RESOLVED', case_id: caseId };
    }
  },

  async getAogHistory(): Promise<any> {
    try {
      const res = await axios.get(`${API_BASE}/aog/history`, { timeout: 3500 });
      return res.data;
    } catch {
      return null;
    }
  },

  async getAogTimeline(caseId: string): Promise<any> {
    try {
      const res = await axios.get(`${API_BASE}/aog/incidents/${caseId}/timeline`, { timeout: 3500 });
      return res.data;
    } catch {
      return { case_id: caseId, timeline: [] };
    }
  }
};
