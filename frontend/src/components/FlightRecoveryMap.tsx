import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Plane, 
  AlertTriangle, 
  RotateCcw, 
  Plus, 
  Minus, 
  Crosshair, 
  X,
  ChevronDown,
  Navigation,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  Maximize2,
  Building2,
  Package,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  Leaf,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { SquawkCase, RecoveryCandidate } from '../types';

interface FlightRecoveryMapProps {
  caseData?: SquawkCase | null;
  demoRunning?: boolean;
  demoStep?: number;
  isDisrupted?: boolean;
  isVerified?: boolean;
  replanCount?: number;
  onSelectCandidate?: (candidate: RecoveryCandidate) => void;
}

// 1. STRUCTURED TYPES
export interface SupplierCandidate {
  id: string;
  name: string;
  locationCode: string;
  locationName: string;
  lat: number;
  lng: number;
  stock: number;
  etaHours: number;
  etaLabel: string;
  cost: number;
  reliability: number;
  carbonKg: number;
  compliance: string;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISQUALIFIED';
  disqualifyReason?: string;
  routeCoords: [number, number][];
}

export interface Flight {
  id: string;
  flightNumber: string;
  aircraft: string;
  aircraftType: string;
  airline: string;
  origin: {
    code: string;
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    code: string;
    name: string;
    lat: number;
    lng: number;
  };
  currentPosition: {
    lat: number;
    lng: number;
  };
  status: 'AOG' | 'TURNBACK' | 'DIVERTED' | 'MAINTENANCE_HOLD';
  statusLabel: string;
  groundedLocation: {
    code: string;
    name: string;
    bay: string;
    lat: number;
    lng: number;
  };
  defect: string;
  defectDetail: string;
  ataChapter: string;
  requiredPart: string;
  quantity: number;
  recoveryDeadlineHours: number;
  recoveryDeadline: string;
  flightRouteCoords: [number, number][];
  suppliers: SupplierCandidate[];
  defaultSelectedSupplierId: string;
  timeline: Array<{ time: string; label: string; type: 'normal' | 'alert' | 'success' | 'warn' }>;
}

export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  aogCount: number;
  availableSuppliers: number;
  activeRecoveries: number;
}

// 2. REAL AIRPORTS DATASET (World & Regional Hubs)
const AIRPORTS_DATASET: Record<string, AirportInfo> = {
  SIN: { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915, aogCount: 0, availableSuppliers: 4, activeRecoveries: 1 },
  DEL: { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', lat: 28.5562, lng: 77.1000, aogCount: 1, availableSuppliers: 3, activeRecoveries: 1 },
  BOM: { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj Intl', city: 'Mumbai', country: 'India', lat: 19.0896, lng: 72.8656, aogCount: 1, availableSuppliers: 4, activeRecoveries: 1 },
  BLR: { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', lat: 13.1986, lng: 77.7066, aogCount: 0, availableSuppliers: 2, activeRecoveries: 0 },
  DXB: { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657, aogCount: 1, availableSuppliers: 3, activeRecoveries: 1 },
  KUL: { code: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lng: 101.7072, aogCount: 1, availableSuppliers: 2, activeRecoveries: 1 },
  SYD: { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753, aogCount: 0, availableSuppliers: 2, activeRecoveries: 0 },
  FRA: { code: 'FRA', name: 'Frankfurt am Main Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lng: 8.5622, aogCount: 1, availableSuppliers: 4, activeRecoveries: 1 },
  PNQ: { code: 'PNQ', name: 'Pune International Airport', city: 'Pune', country: 'India', lat: 18.5822, lng: 73.9197, aogCount: 0, availableSuppliers: 1, activeRecoveries: 0 },
  HYD: { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', lat: 17.2403, lng: 78.4294, aogCount: 0, availableSuppliers: 2, activeRecoveries: 0 },
  AUH: { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'UAE', lat: 24.4330, lng: 54.6511, aogCount: 0, availableSuppliers: 2, activeRecoveries: 1 },
  DOH: { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', lat: 25.2731, lng: 51.6080, aogCount: 0, availableSuppliers: 2, activeRecoveries: 0 },
  BAH: { code: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain', lat: 26.2708, lng: 50.6336, aogCount: 0, availableSuppliers: 1, activeRecoveries: 0 },
  BKK: { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lng: 100.7501, aogCount: 0, availableSuppliers: 2, activeRecoveries: 0 },
  HKG: { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lng: 113.9185, aogCount: 0, availableSuppliers: 3, activeRecoveries: 0 },
  NRT: { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', lat: 35.7720, lng: 140.3929, aogCount: 0, availableSuppliers: 2, activeRecoveries: 0 },
  AMS: { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lng: 4.7683, aogCount: 0, availableSuppliers: 3, activeRecoveries: 0 },
  CDG: { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479, aogCount: 0, availableSuppliers: 2, activeRecoveries: 0 },
  LHR: { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', lat: 51.4700, lng: -0.4543, aogCount: 0, availableSuppliers: 3, activeRecoveries: 0 },
  MAD: { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'Spain', lat: 40.4839, lng: -3.5680, aogCount: 0, availableSuppliers: 2, activeRecoveries: 0 }
};

// 3. 5 INDEPENDENT EXACT FLIGHT SCENARIOS
const INITIAL_FLIGHTS_DATASET: Flight[] = [
  // FLIGHT 1: SQ-402 (SIN -> DEL) - AOG at DEL
  {
    id: 'SQ-402',
    flightNumber: 'SQ-402',
    aircraft: 'VT-SQK',
    aircraftType: 'Boeing 737-800',
    airline: 'Singapore Airlines',
    origin: {
      code: 'SIN',
      name: 'Singapore Changi Airport',
      lat: 1.3644,
      lng: 103.9915
    },
    destination: {
      code: 'DEL',
      name: 'Indira Gandhi International Airport',
      lat: 28.5562,
      lng: 77.1000
    },
    currentPosition: {
      lat: 28.5562,
      lng: 77.1000
    },
    status: 'AOG',
    statusLabel: 'Grounded at DEL',
    groundedLocation: {
      code: 'DEL',
      name: 'Indira Gandhi International Airport',
      bay: 'Gate 42 / Terminal 3',
      lat: 28.5562,
      lng: 77.1000
    },
    defect: 'Hydraulic System A Engine-Driven Pump',
    defectDetail: 'Low-Pressure Failure (ATA 29)',
    ataChapter: '29 - Hydraulic Power',
    requiredPart: 'HP-2048',
    quantity: 1,
    recoveryDeadlineHours: 18.0,
    recoveryDeadline: '18 hours',
    flightRouteCoords: [
      [1.3644, 103.9915],
      [7.5, 96.0],
      [14.0, 89.0],
      [21.0, 83.0],
      [28.5562, 77.1000]
    ],
    defaultSelectedSupplierId: 'SUP-AEROPARTS-SIN',
    suppliers: [
      {
        id: 'SUP-AEROPARTS-SIN',
        name: 'AeroParts',
        locationCode: 'SIN',
        locationName: 'Singapore Changi Hub',
        lat: 1.3644,
        lng: 103.9915,
        stock: 2,
        etaHours: 8.33,
        etaLabel: '8h 20m',
        cost: 18200,
        reliability: 96,
        carbonKg: 420,
        compliance: 'Dual Release (FAA 8130-3 + EASA Form 1)',
        status: 'AVAILABLE',
        routeCoords: [[1.3644, 103.9915], [14.0, 89.0], [28.5562, 77.1000]]
      },
      {
        id: 'SUP-SKYSUPPLY-BOM',
        name: 'SkySupply Global',
        locationCode: 'BOM',
        locationName: 'Mumbai / Dubai Network Hub',
        lat: 19.0896,
        lng: 72.8656,
        stock: 3,
        etaHours: 11.16,
        etaLabel: '11h 10m',
        cost: 14700,
        reliability: 91,
        carbonKg: 510,
        compliance: 'FAA 8130-3 + OEM Traceability',
        status: 'AVAILABLE',
        routeCoords: [[19.0896, 72.8656], [24.0, 75.0], [28.5562, 77.1000]]
      },
      {
        id: 'SUP-GLOBALPARTS-FRA',
        name: 'GlobalParts',
        locationCode: 'FRA',
        locationName: 'Frankfurt European Central Stores',
        lat: 50.0379,
        lng: 8.5622,
        stock: 1,
        etaHours: 20.5,
        etaLabel: '20h 30m',
        cost: 9200,
        reliability: 84,
        carbonKg: 390,
        compliance: 'Limited (EASA Form 1 Only)',
        status: 'DISQUALIFIED',
        disqualifyReason: 'Exceeds 18h maximum recovery deadline (ETA: 20h 30m)',
        routeCoords: [[50.0379, 8.5622], [42.0, 40.0], [28.5562, 77.1000]]
      }
    ],
    timeline: [
      { time: '13:04', label: 'AOG detected · Grounded DEL Gate 42', type: 'alert' },
      { time: '13:06', label: 'Aircraft telemetry retrieved · ATA 29 Hydraulic Low Press', type: 'normal' },
      { time: '13:07', label: 'Local Delhi line inventory checked · HP-2048 Stock: 0', type: 'warn' },
      { time: '13:08', label: 'Multi-hub supplier search initiated', type: 'normal' },
      { time: '13:10', label: 'Compliance & airworthiness trace verified (FAA/EASA)', type: 'normal' },
      { time: '13:12', label: 'Recovery options optimized (Delivery 40%, Rel 25%, Cost 15%)', type: 'normal' },
      { time: '13:13', label: 'AeroParts SIN selected as optimal recovery route', type: 'success' },
      { time: '13:15', label: 'Recovery authorized by human flight operations engineer', type: 'success' },
      { time: '13:18', label: 'Part HP-2048 reserved · Changi Express Cargo Airway Bill generated', type: 'success' }
    ]
  },

  // FLIGHT 2: AI-608 (BOM -> BLR -> BOM) - Turnback grounded at BOM
  {
    id: 'AI-608',
    flightNumber: 'AI-608',
    aircraft: 'VT-AIG',
    aircraftType: 'Airbus A320',
    airline: 'Air India',
    origin: {
      code: 'BOM',
      name: 'Chhatrapati Shivaji Maharaj Intl',
      lat: 19.0896,
      lng: 72.8656
    },
    destination: {
      code: 'BLR',
      name: 'Kempegowda International Airport (Original)',
      lat: 13.1986,
      lng: 77.7066
    },
    currentPosition: {
      lat: 19.0896,
      lng: 72.8656
    },
    status: 'TURNBACK',
    statusLabel: 'Turnback / Grounded at BOM',
    groundedLocation: {
      code: 'BOM',
      name: 'Chhatrapati Shivaji Maharaj Intl',
      bay: 'Ramp Stand B14',
      lat: 19.0896,
      lng: 72.8656
    },
    defect: 'Engine Starter Fault',
    defectDetail: 'Pneumatic Starter Clutch Disengage (ATA 80)',
    ataChapter: '80 - Starting',
    requiredPart: 'ES-3180',
    quantity: 1,
    recoveryDeadlineHours: 8.0,
    recoveryDeadline: '8 hours',
    flightRouteCoords: [
      [19.0896, 72.8656],
      [17.8, 74.2],
      [16.2, 75.5],
      [15.0, 76.2],
      [16.0, 75.0],
      [17.5, 73.8],
      [19.0896, 72.8656]
    ],
    defaultSelectedSupplierId: 'SUP-AEROTECH-PNQ',
    suppliers: [
      {
        id: 'SUP-AEROTECH-PNQ',
        name: 'AeroTech Bharat',
        locationCode: 'PNQ',
        locationName: 'Pune / Mumbai Regional Stores',
        lat: 18.5822,
        lng: 73.9197,
        stock: 2,
        etaHours: 2.33,
        etaLabel: '2h 20m',
        cost: 4200,
        reliability: 95,
        carbonKg: 80,
        compliance: 'DGCA India + FAA 8130-3',
        status: 'AVAILABLE',
        routeCoords: [[18.5822, 73.9197], [19.0896, 72.8656]]
      },
      {
        id: 'SUP-INDAERO-DEL',
        name: 'IndAero Components',
        locationCode: 'DEL',
        locationName: 'Delhi Airside Stores',
        lat: 28.5562,
        lng: 77.1000,
        stock: 1,
        etaHours: 5.75,
        etaLabel: '5h 45m',
        cost: 6100,
        reliability: 92,
        carbonKg: 310,
        compliance: 'Dual Release (DGCA + EASA)',
        status: 'AVAILABLE',
        routeCoords: [[28.5562, 77.1000], [24.0, 75.0], [19.0896, 72.8656]]
      },
      {
        id: 'SUP-DECCAN-HYD',
        name: 'Deccan Spares Hub',
        locationCode: 'HYD',
        locationName: 'Hyderabad MRO Hub',
        lat: 17.2403,
        lng: 78.4294,
        stock: 3,
        etaHours: 4.16,
        etaLabel: '4h 10m',
        cost: 5500,
        reliability: 89,
        carbonKg: 240,
        compliance: 'EASA Form 1 + OEM Certificate',
        status: 'AVAILABLE',
        routeCoords: [[17.2403, 78.4294], [19.0896, 72.8656]]
      },
      {
        id: 'SUP-GULFAERO-DXB2',
        name: 'GulfAero Spares',
        locationCode: 'DXB',
        locationName: 'Dubai Logistics Hub',
        lat: 25.2532,
        lng: 55.3657,
        stock: 2,
        etaHours: 8.5,
        etaLabel: '8h 30m',
        cost: 8900,
        reliability: 93,
        carbonKg: 480,
        compliance: 'FAA 8130-3 + GCAA',
        status: 'DISQUALIFIED',
        disqualifyReason: 'Exceeds 8h deadline for rapid turnaround',
        routeCoords: [[25.2532, 55.3657], [22.0, 64.0], [19.0896, 72.8656]]
      }
    ],
    timeline: [
      { time: '09:20', label: 'Departed · Mumbai (BOM) for Bengaluru', type: 'normal' },
      { time: '09:42', label: 'Climb FL240 · Engine Starter Valve Warning Flagged', type: 'alert' },
      { time: '09:48', label: 'Precautionary Air Turnback Declared by Flight Crew', type: 'warn' },
      { time: '10:15', label: 'Safe Touchdown · Mumbai Runway 27', type: 'normal' },
      { time: '10:20', label: 'AOG Declared · Grounded at Stand B14', type: 'alert' },
      { time: '10:25', label: 'AeroTech Bharat (PNQ) Starter ES-3180 Allocated', type: 'success' }
    ]
  },

  // FLIGHT 3: EK-517 (DEL -> DXB) - Grounded at DXB
  {
    id: 'EK-517',
    flightNumber: 'EK-517',
    aircraft: 'A6-EKD',
    aircraftType: 'Boeing 777-300ER',
    airline: 'Emirates',
    origin: {
      code: 'DEL',
      name: 'Indira Gandhi International Airport',
      lat: 28.5562,
      lng: 77.1000
    },
    destination: {
      code: 'DXB',
      name: 'Dubai International Airport',
      lat: 25.2532,
      lng: 55.3657
    },
    currentPosition: {
      lat: 25.2532,
      lng: 55.3657
    },
    status: 'AOG',
    statusLabel: 'Grounded at DXB',
    groundedLocation: {
      code: 'DXB',
      name: 'Dubai International Airport',
      bay: 'Concourse B / Stand F8',
      lat: 25.2532,
      lng: 55.3657
    },
    defect: 'Flight-Control Actuator Fault',
    defectDetail: 'Elevator Power Control Unit Internal Leak (ATA 27)',
    ataChapter: '27 - Flight Controls',
    requiredPart: 'FC-7712',
    quantity: 1,
    recoveryDeadlineHours: 12.0,
    recoveryDeadline: '12 hours',
    flightRouteCoords: [
      [28.5562, 77.1000],
      [27.5, 71.0],
      [26.5, 64.0],
      [25.8, 59.0],
      [25.2532, 55.3657]
    ],
    defaultSelectedSupplierId: 'SUP-GULFAERO-AUH',
    suppliers: [
      {
        id: 'SUP-GULFAERO-AUH',
        name: 'GulfAero Components',
        locationCode: 'AUH',
        locationName: 'Abu Dhabi Freezone Logistics',
        lat: 24.4330,
        lng: 54.6511,
        stock: 2,
        etaHours: 2.25,
        etaLabel: '2h 15m',
        cost: 16400,
        reliability: 97,
        carbonKg: 110,
        compliance: 'GCAA UAE + FAA 8130-3 Dual Release',
        status: 'AVAILABLE',
        routeCoords: [[24.4330, 54.6511], [25.2532, 55.3657]]
      },
      {
        id: 'SUP-QATAR-DOH',
        name: 'Qatar Rotable Spares',
        locationCode: 'DOH',
        locationName: 'Doha Hamad Logistics',
        lat: 25.2731,
        lng: 51.6080,
        stock: 1,
        etaHours: 4.0,
        etaLabel: '4h 00m',
        cost: 18900,
        reliability: 93,
        carbonKg: 190,
        compliance: 'Dual Release (QCAA + EASA)',
        status: 'AVAILABLE',
        routeCoords: [[25.2731, 51.6080], [25.2532, 55.3657]]
      },
      {
        id: 'SUP-BAHRAIN-BAH',
        name: 'Gulf Bahrain Tech',
        locationCode: 'BAH',
        locationName: 'Bahrain MRO Stores',
        lat: 26.2708,
        lng: 50.6336,
        stock: 2,
        etaHours: 4.75,
        etaLabel: '4h 45m',
        cost: 15200,
        reliability: 90,
        carbonKg: 210,
        compliance: 'EASA Form 1 + OEM Cert',
        status: 'AVAILABLE',
        routeCoords: [[26.2708, 50.6336], [25.2532, 55.3657]]
      },
      {
        id: 'SUP-AEROPARTS-SIN3',
        name: 'AeroParts Asia',
        locationCode: 'SIN',
        locationName: 'Singapore Changi Hub',
        lat: 1.3644,
        lng: 103.9915,
        stock: 3,
        etaHours: 9.25,
        etaLabel: '9h 15m',
        cost: 21000,
        reliability: 96,
        carbonKg: 560,
        compliance: 'Dual Release (FAA + CAAS)',
        status: 'AVAILABLE',
        routeCoords: [[1.3644, 103.9915], [14.0, 80.0], [25.2532, 55.3657]]
      }
    ],
    timeline: [
      { time: '06:30', label: 'Departed · Delhi (DEL)', type: 'normal' },
      { time: '08:45', label: 'Landed · Dubai Runway 12L', type: 'normal' },
      { time: '09:10', label: 'Post-flight BITE Test Failed · Flight Control Actuator FC-7712', type: 'alert' },
      { time: '09:15', label: 'AOG Declared · Concourse B Gate Hold', type: 'alert' },
      { time: '09:25', label: 'GulfAero AUH Expedited Hot-Shot Dispatched (2h 15m ETA)', type: 'success' }
    ]
  },

  // FLIGHT 4: SQ-218 (SIN -> SYD -> KUL) - Diverted AOG at KUL
  {
    id: 'SQ-218',
    flightNumber: 'SQ-218',
    aircraft: '9V-SQH',
    aircraftType: 'Airbus A350',
    airline: 'Singapore Airlines',
    origin: {
      code: 'SIN',
      name: 'Singapore Changi Airport',
      lat: 1.3644,
      lng: 103.9915
    },
    destination: {
      code: 'SYD',
      name: 'Sydney Kingsford Smith (Scheduled)',
      lat: -33.9399,
      lng: 151.1753
    },
    currentPosition: {
      lat: 2.7456,
      lng: 101.7072
    },
    status: 'DIVERTED',
    statusLabel: 'Diverted to KUL',
    groundedLocation: {
      code: 'KUL',
      name: 'Kuala Lumpur International',
      bay: 'Terminal 1 Bay C2',
      lat: 2.7456,
      lng: 101.7072
    },
    defect: 'Electrical Power Control Unit Failure',
    defectDetail: 'EPCU Bus Transfer Circuit Open (ATA 24)',
    ataChapter: '24 - Electrical Power',
    requiredPart: 'EPCU-4401',
    quantity: 1,
    recoveryDeadlineHours: 14.0,
    recoveryDeadline: '14 hours',
    flightRouteCoords: [
      [1.3644, 103.9915],
      [1.6, 104.4],
      [1.9, 104.2],
      [2.3, 103.0],
      [2.7456, 101.7072]
    ],
    defaultSelectedSupplierId: 'SUP-MALAYSIA-KUL',
    suppliers: [
      {
        id: 'SUP-MALAYSIA-KUL',
        name: 'Malaysia Aero Logistics',
        locationCode: 'KUL',
        locationName: 'Kuala Lumpur Base Stores',
        lat: 2.7456,
        lng: 101.7072,
        stock: 1,
        etaHours: 1.75,
        etaLabel: '1h 45m',
        cost: 12500,
        reliability: 96,
        carbonKg: 40,
        compliance: 'CAAM + FAA 8130-3 Dual Release',
        status: 'AVAILABLE',
        routeCoords: [[2.7456, 101.7072], [2.7456, 101.7072]]
      },
      {
        id: 'SUP-SIAM-BKK',
        name: 'Siam Rotable Spares',
        locationCode: 'BKK',
        locationName: 'Bangkok Suvarnabhumi Hub',
        lat: 13.6900,
        lng: 100.7501,
        stock: 2,
        etaHours: 4.5,
        etaLabel: '4h 30m',
        cost: 14200,
        reliability: 92,
        carbonKg: 280,
        compliance: 'Dual Release (CAAT + EASA)',
        status: 'AVAILABLE',
        routeCoords: [[13.6900, 100.7501], [7.0, 101.0], [2.7456, 101.7072]]
      },
      {
        id: 'SUP-ASIAPAC-HKG',
        name: 'Asia Pacific Air Tech',
        locationCode: 'HKG',
        locationName: 'Hong Kong Logistics Hub',
        lat: 22.3080,
        lng: 113.9185,
        stock: 3,
        etaHours: 6.25,
        etaLabel: '6h 15m',
        cost: 16800,
        reliability: 94,
        carbonKg: 410,
        compliance: 'HKCAD + FAA Dual Release',
        status: 'AVAILABLE',
        routeCoords: [[22.3080, 113.9185], [12.0, 108.0], [2.7456, 101.7072]]
      },
      {
        id: 'SUP-NARITA-NRT',
        name: 'Narita Avionics',
        locationCode: 'NRT',
        locationName: 'Tokyo Narita Bonded Area',
        lat: 35.7720,
        lng: 140.3929,
        stock: 1,
        etaHours: 10.5,
        etaLabel: '10h 30m',
        cost: 19500,
        reliability: 91,
        carbonKg: 690,
        compliance: 'JCAB Japan + FAA 8130-3',
        status: 'AVAILABLE',
        routeCoords: [[35.7720, 140.3929], [20.0, 125.0], [2.7456, 101.7072]]
      }
    ],
    timeline: [
      { time: '07:15', label: 'Departed · Singapore Changi (SIN) for Sydney', type: 'normal' },
      { time: '07:45', label: 'Level FL310 · ACARS EPCU Bus Power Disagree Warning', type: 'alert' },
      { time: '08:00', label: 'Crew Initiated Diversion to Kuala Lumpur (KUL)', type: 'warn' },
      { time: '08:40', label: 'Safe Touchdown · Kuala Lumpur Runway 32R', type: 'normal' },
      { time: '08:50', label: 'AOG Declared · Grounded at Bay C2', type: 'alert' },
      { time: '09:05', label: 'KUL Local Base Stores EPCU-4401 Dispatched for Installation', type: 'success' }
    ]
  },

  // FLIGHT 5: LH-760 (FRA -> DEL) - Maintenance Grounded at FRA
  {
    id: 'LH-760',
    flightNumber: 'LH-760',
    aircraft: 'D-AFBC',
    aircraftType: 'Airbus A340',
    airline: 'Lufthansa',
    origin: {
      code: 'FRA',
      name: 'Frankfurt am Main Airport',
      lat: 50.0379,
      lng: 8.5622
    },
    destination: {
      code: 'DEL',
      name: 'Indira Gandhi International Airport',
      lat: 28.5562,
      lng: 77.1000
    },
    currentPosition: {
      lat: 50.0379,
      lng: 8.5622
    },
    status: 'MAINTENANCE_HOLD',
    statusLabel: 'Maintenance Hold at FRA',
    groundedLocation: {
      code: 'FRA',
      name: 'Frankfurt am Main Airport',
      bay: 'Gate B24 / Main Apron',
      lat: 50.0379,
      lng: 8.5622
    },
    defect: 'Fuel Control Unit Fault',
    defectDetail: 'Discovered during Pre-Flight Maintenance (ATA 73)',
    ataChapter: '73 - Engine Fuel and Control',
    requiredPart: 'FCU-9920',
    quantity: 1,
    recoveryDeadlineHours: 6.0,
    recoveryDeadline: '6 hours',
    flightRouteCoords: [
      [50.0379, 8.5622],
      [47.0, 22.0],
      [42.0, 42.0],
      [34.0, 60.0],
      [28.5562, 77.1000]
    ],
    defaultSelectedSupplierId: 'SUP-LHT-FRA',
    suppliers: [
      {
        id: 'SUP-LHT-FRA',
        name: 'Lufthansa Technik Stores',
        locationCode: 'FRA',
        locationName: 'Frankfurt Central Stores / AMS Pool',
        lat: 50.0379,
        lng: 8.5622,
        stock: 2,
        etaHours: 2.5,
        etaLabel: '2h 30m',
        cost: 11800,
        reliability: 98,
        carbonKg: 120,
        compliance: 'EASA Form 1 + FAA 8130-3 Dual Release',
        status: 'AVAILABLE',
        routeCoords: [[50.0379, 8.5622], [50.0379, 8.5622]]
      },
      {
        id: 'SUP-AEROFRANCE-CDG',
        name: 'AeroFrance Spares',
        locationCode: 'CDG',
        locationName: 'Paris Charles de Gaulle Hub',
        lat: 49.0097,
        lng: 2.5479,
        stock: 1,
        etaHours: 3.75,
        etaLabel: '3h 45m',
        cost: 13400,
        reliability: 95,
        carbonKg: 180,
        compliance: 'Dual Release (EASA + FAA)',
        status: 'AVAILABLE',
        routeCoords: [[49.0097, 2.5479], [50.0379, 8.5622]]
      },
      {
        id: 'SUP-BRITISH-LHR',
        name: 'British Rotable Logistics',
        locationCode: 'LHR',
        locationName: 'London Heathrow Bonded Stores',
        lat: 51.4700,
        lng: -0.4543,
        stock: 2,
        etaHours: 4.25,
        etaLabel: '4h 15m',
        cost: 14900,
        reliability: 94,
        carbonKg: 220,
        compliance: 'CAA UK + FAA 8130-3',
        status: 'AVAILABLE',
        routeCoords: [[51.4700, -0.4543], [50.0379, 8.5622]]
      },
      {
        id: 'SUP-IBERIA-MAD',
        name: 'Iberia Components',
        locationCode: 'MAD',
        locationName: 'Madrid Barajas MRO',
        lat: 40.4839,
        lng: -3.5680,
        stock: 1,
        etaHours: 5.83,
        etaLabel: '5h 50m',
        cost: 12200,
        reliability: 89,
        carbonKg: 340,
        compliance: 'EASA Form 1',
        status: 'AVAILABLE',
        routeCoords: [[40.4839, -3.5680], [45.0, 2.0], [50.0379, 8.5622]]
      }
    ],
    timeline: [
      { time: '14:00', label: 'Pre-flight Check · Frankfurt Gate B24', type: 'normal' },
      { time: '14:15', label: 'Maintenance Finding · Fuel Control Unit FCU-9920 Fault', type: 'alert' },
      { time: '14:20', label: 'Departure Postponed · Aircraft Placed on Maintenance Hold', type: 'warn' },
      { time: '14:30', label: 'AOG Declared · FRA Central Maintenance Area', type: 'alert' },
      { time: '14:45', label: 'Lufthansa Technik Stores FCU-9920 Allocated (2h 30m ETA)', type: 'success' }
    ]
  }
];

export const FlightRecoveryMap: React.FC<FlightRecoveryMapProps> = ({
  isDisrupted: externalDisrupted = false,
  isVerified: externalVerified = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});

  // Map Modes: NETWORK | SELECTED_FLIGHT | RECOVERY
  const [mapMode, setMapMode] = useState<'NETWORK' | 'SELECTED_FLIGHT' | 'RECOVERY'>('SELECTED_FLIGHT');

  // Active Flight & Data State
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS_DATASET);
  const [selectedFlightId, setSelectedFlightId] = useState<string>('SQ-402');
  const [activeTab, setActiveTab] = useState<'flights' | 'events' | 'map'>('flights');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('SUP-AEROPARTS-SIN');
  const [isStockoutDisrupted, setIsStockoutDisrupted] = useState<boolean>(false);
  const [isReplanned, setIsReplanned] = useState<boolean>(false);

  // Inspector Overlays
  const [inspectedAirport, setInspectedAirport] = useState<AirportInfo | null>(null);
  const [inspectedSupplier, setInspectedSupplier] = useState<SupplierCandidate | null>(null);
  const [showLayersModal, setShowLayersModal] = useState(false);
  const [showFlightDropdown, setShowFlightDropdown] = useState(false);

  // Map Layers Toggle State
  const [layers, setLayers] = useState({
    aircraft: true,
    airports: true,
    flightRoutes: true,
    suppliers: true,
    recoveryRoutes: true,
    aogEvents: true,
    disruptions: true,
    flightHistory: true,
    radarRange: false,
    firBoundaries: false
  });

  const selectedFlight = flights.find(f => f.id === selectedFlightId) || flights[0];
  const activeSupplier = selectedFlight.suppliers.find(s => s.id === selectedSupplierId) || selectedFlight.suppliers[0];

  // Update selected supplier whenever flight changes
  useEffect(() => {
    if (selectedFlightId === 'SQ-402') {
      if (isReplanned) {
        setSelectedSupplierId('SUP-SKYSUPPLY-BOM');
      } else {
        setSelectedSupplierId('SUP-AEROPARTS-SIN');
      }
    } else {
      setSelectedSupplierId(selectedFlight.defaultSelectedSupplierId);
    }
  }, [selectedFlightId, isReplanned]);

  // Handle Layer Toggle
  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetLayersToDefault = () => {
    setLayers({
      aircraft: true,
      airports: true,
      flightRoutes: true,
      suppliers: true,
      recoveryRoutes: true,
      aogEvents: true,
      disruptions: true,
      flightHistory: true,
      radarRange: false,
      firBoundaries: false
    });
  };

  // Helper for custom SVG div icons
  const createCustomIcon = (html: string, iconSize: [number, number] = [32, 32], anchor: [number, number] = [16, 16]) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html,
      iconSize,
      iconAnchor: anchor
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.0, 78.0],
      zoom: 4,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: true
    });

    // 100% Free OpenStreetMap with Dark Aviation Style
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'dark-aviation-tiles',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Create Layer Groups
    const layerGroups = {
      aircraft: L.layerGroup().addTo(map),
      airports: L.layerGroup().addTo(map),
      flightRoutes: L.layerGroup().addTo(map),
      suppliers: L.layerGroup().addTo(map),
      recoveryRoutes: L.layerGroup().addTo(map),
      aogEvents: L.layerGroup().addTo(map),
      disruptions: L.layerGroup().addTo(map),
      flightHistory: L.layerGroup().addTo(map),
      radarRange: L.layerGroup(),
      firBoundaries: L.layerGroup()
    };

    layerGroupsRef.current = layerGroups;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Layer Visibility with Leaflet Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    Object.entries(layers).forEach(([key, isVisible]) => {
      const group = layerGroupsRef.current[key];
      if (!group) return;

      if (isVisible) {
        if (!map.hasLayer(group)) map.addLayer(group);
      } else {
        if (map.hasLayer(group)) map.removeLayer(group);
      }
    });
  }, [layers]);

  // DYNAMIC MAP RENDER LOGIC
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const groups = layerGroupsRef.current;
    if (!groups.aircraft) return;

    // Clear previous elements
    Object.values(groups).forEach(g => g.clearLayers());

    // 1. RENDER AIRPORTS
    Object.values(AIRPORTS_DATASET).forEach(airport => {
      const isRelevant = 
        selectedFlight.origin.code === airport.code ||
        selectedFlight.destination.code === airport.code ||
        selectedFlight.groundedLocation.code === airport.code ||
        selectedFlight.suppliers.some(s => s.locationCode === airport.code);

      if (mapMode === 'RECOVERY' && !isRelevant) return;

      const markerHtml = `
        <div class="group relative flex items-center justify-center cursor-pointer">
          <div class="w-3 h-3 rounded-full ${isRelevant ? 'bg-cyan-400 ring-4 ring-cyan-500/30' : 'bg-blue-500'} border border-white shadow-md"></div>
          <span class="absolute -bottom-4 text-[9px] font-mono font-bold ${isRelevant ? 'text-cyan-300' : 'text-slate-400'} bg-[#070B11]/90 px-1 rounded shadow pointer-events-none">
            ${airport.code}
          </span>
        </div>
      `;
      const marker = L.marker([airport.lat, airport.lng], {
        icon: createCustomIcon(markerHtml, [24, 24], [12, 12])
      }).addTo(groups.airports);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setInspectedSupplier(null);
        setInspectedAirport(airport);
      });
    });

    // 2. RENDER SUPPLIERS (For current flight in SELECTED_FLIGHT/RECOVERY mode, or all in NETWORK mode)
    const suppliersToRender = mapMode === 'NETWORK'
      ? flights.flatMap(f => f.suppliers)
      : selectedFlight.suppliers;

    suppliersToRender.forEach(supplier => {
      const isSelected = supplier.id === selectedSupplierId;
      const isOut = supplier.status === 'OUT_OF_STOCK';
      const isDisq = supplier.status === 'DISQUALIFIED';

      const bgClass = isOut ? 'bg-red-600 ring-2 ring-red-400' : isDisq ? 'bg-slate-600 opacity-60' : isSelected ? 'bg-emerald-500 ring-4 ring-emerald-400/50 scale-125' : 'bg-emerald-600 opacity-80';

      const supplierHtml = `
        <div class="group relative flex items-center justify-center cursor-pointer">
          <div class="w-3.5 h-3.5 rounded ${bgClass} border border-white flex items-center justify-center text-[8px] text-black font-extrabold shadow-md">
            ${isOut ? '✕' : 'S'}
          </div>
          ${isSelected ? `
            <span class="absolute -top-4 text-[8px] font-mono font-bold text-emerald-300 bg-emerald-950/95 border border-emerald-700/80 px-1 rounded whitespace-nowrap shadow pointer-events-none">
              ${supplier.name} (${supplier.locationCode})
            </span>
          ` : ''}
        </div>
      `;
      const marker = L.marker([supplier.lat, supplier.lng], {
        icon: createCustomIcon(supplierHtml, [24, 24], [12, 12])
      }).addTo(groups.suppliers);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setInspectedAirport(null);
        setInspectedSupplier(supplier);
        if (supplier.status === 'AVAILABLE') {
          setSelectedSupplierId(supplier.id);
        }
      });
    });

    // 3. RENDER FLIGHT ROUTES
    flights.forEach(flight => {
      const isSelected = flight.id === selectedFlightId;
      if (mapMode === 'RECOVERY' && !isSelected) return;

      L.polyline(flight.flightRouteCoords, {
        color: isSelected ? '#00f0ff' : '#475569',
        weight: isSelected ? 3.5 : 1.5,
        opacity: isSelected ? 0.95 : 0.2,
        dashArray: flight.id === 'LH-760' ? '5, 5' : undefined
      }).addTo(groups.flightRoutes);
    });

    // 4. RENDER ACTIVE RECOVERY ROUTE
    if (activeSupplier && activeSupplier.routeCoords.length > 0 && activeSupplier.status !== 'DISQUALIFIED') {
      if (isStockoutDisrupted && selectedFlightId === 'SQ-402' && !isReplanned) {
        // Red Invalidated Route
        L.polyline(activeSupplier.routeCoords, {
          color: '#ef4444',
          weight: 3.5,
          opacity: 0.9,
          dashArray: '6, 6'
        }).addTo(groups.disruptions);
      } else {
        // Emerald / Amber Active Recovery Route
        L.polyline(activeSupplier.routeCoords, {
          color: isReplanned && selectedFlightId === 'SQ-402' ? '#f59e0b' : '#10b981',
          weight: 3.5,
          opacity: 0.95,
          dashArray: '6, 6'
        }).addTo(groups.recoveryRoutes);
      }
    }

    // 5. RENDER AOG BEACONS
    flights.forEach(flight => {
      const isSelected = flight.id === selectedFlightId;
      if (mapMode === 'RECOVERY' && !isSelected) return;

      const beaconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer select-none">
          <div class="w-4 h-4 rounded-full bg-red-600 border border-white flex items-center justify-center text-white shadow-lg ${isSelected ? 'scale-125' : 'opacity-85'}">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
          ${isSelected ? `
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-red-400 opacity-60"></span>
            <div class="absolute -bottom-6 px-1.5 py-0.5 rounded bg-red-950/95 border border-red-500 text-[9px] font-mono text-red-300 font-bold whitespace-nowrap shadow-lg">
              ${flight.groundedLocation.code} · ${flight.aircraft}
            </div>
          ` : ''}
        </div>
      `;
      const marker = L.marker([flight.groundedLocation.lat, flight.groundedLocation.lng], {
        icon: createCustomIcon(beaconHtml, [32, 32], [16, 16])
      }).addTo(groups.aogEvents);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setInspectedAirport(null);
        setInspectedSupplier(null);
        setSelectedFlightId(flight.id);
      });
    });

    // 6. RENDER AIRCRAFT MARKERS
    flights.forEach(flight => {
      const isSelected = flight.id === selectedFlightId;
      if (mapMode === 'RECOVERY' && !isSelected) return;

      const aircraftHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition transform ${isSelected ? 'scale-125 z-50' : 'opacity-85 hover:scale-110 z-20'}">
          ${isSelected ? `
            <div class="absolute -inset-2 rounded-full bg-cyan-400/20 border border-cyan-400 animate-pulse"></div>
          ` : ''}
          <div class="px-2 py-0.5 rounded-full ${isSelected ? 'bg-cyan-500 text-black font-extrabold shadow-lg shadow-cyan-500/50' : 'bg-slate-800 text-slate-200 border border-slate-600'} flex items-center space-x-1 shadow-md">
            <svg class="w-3.5 h-3.5 -rotate-45" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
            <span class="text-[9px] font-mono font-bold leading-none">${flight.flightNumber}</span>
          </div>
          ${isSelected ? `
            <div class="absolute -bottom-5 px-1.5 py-0.2 rounded bg-cyan-950/90 border border-cyan-500 text-[8px] font-mono text-cyan-300 font-bold whitespace-nowrap shadow-md pointer-events-none">
              ${flight.aircraft} · ${flight.statusLabel}
            </div>
          ` : ''}
        </div>
      `;

      const marker = L.marker([flight.currentPosition.lat, flight.currentPosition.lng], {
        icon: createCustomIcon(aircraftHtml, [80, 26], [40, 13])
      }).addTo(groups.aircraft);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setInspectedAirport(null);
        setInspectedSupplier(null);
        setSelectedFlightId(flight.id);
      });
    });

    // 7. RENDER RADAR & FIR OVERLAYS
    L.circle([28.5562, 77.1000], { radius: 500000, color: '#00f0ff', weight: 1, dashArray: '4, 4', fillOpacity: 0.03 }).addTo(groups.radarRange);
    L.circle([19.0896, 72.8656], { radius: 450000, color: '#10b981', weight: 1, dashArray: '4, 4', fillOpacity: 0.03 }).addTo(groups.radarRange);
    L.polygon([[32, 72], [32, 81], [25, 84], [22, 74], [26, 70], [32, 72]], { color: '#3b82f6', weight: 1, fillOpacity: 0.02, dashArray: '4, 4' }).addTo(groups.firBoundaries);

  }, [selectedFlightId, selectedSupplierId, mapMode, isStockoutDisrupted, isReplanned, flights]);

  // AUTO-FIT BOUNDS ON FLIGHT OR MODE CHANGE
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (mapMode === 'NETWORK') {
      const allPoints = flights.flatMap(f => [
        [f.origin.lat, f.origin.lng],
        [f.destination.lat, f.destination.lng],
        [f.currentPosition.lat, f.currentPosition.lng]
      ] as [number, number][]);
      map.flyToBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 5, duration: 0.8 });
    } else {
      const points: [number, number][] = [
        [selectedFlight.origin.lat, selectedFlight.origin.lng],
        [selectedFlight.destination.lat, selectedFlight.destination.lng],
        [selectedFlight.currentPosition.lat, selectedFlight.currentPosition.lng]
      ];
      if (activeSupplier) {
        points.push([activeSupplier.lat, activeSupplier.lng]);
      }
      map.flyToBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 6, duration: 0.8 });
    }
  }, [selectedFlightId, mapMode, selectedSupplierId]);

  // CRITICAL AGENTIC FAILURE TEST: TRIGGER SUPPLIER STOCKOUT (SQ-402)
  const handleTriggerStockout = () => {
    setIsStockoutDisrupted(true);
    setIsReplanned(false);

    // Update SQ-402 dataset: AeroParts stock goes 2 -> 0, status -> OUT_OF_STOCK
    setFlights(prev => prev.map(f => {
      if (f.id !== 'SQ-402') return f;
      const updatedSuppliers = f.suppliers.map(s => {
        if (s.id === 'SUP-AEROPARTS-SIN') {
          return {
            ...s,
            stock: 0,
            status: 'OUT_OF_STOCK' as const
          };
        }
        return s;
      });

      const updatedTimeline = [
        ...f.timeline,
        { time: '13:22', label: 'Disruption Detected · AeroParts SIN Reported Stockout (2 → 0)', type: 'alert' as const },
        { time: '13:23', label: 'Current Recovery Plan Invalidated · Triggering Autonomous Replanning', type: 'warn' as const }
      ];

      return {
        ...f,
        suppliers: updatedSuppliers,
        timeline: updatedTimeline
      };
    }));

    // Auto-trigger agentic replanning after brief delay
    setTimeout(() => {
      handleAutonomousReplan();
    }, 1200);
  };

  // AGENTIC MULTI-CRITERIA OPTIMIZATION & REPLANNING
  const handleAutonomousReplan = () => {
    setIsReplanned(true);
    setSelectedSupplierId('SUP-SKYSUPPLY-BOM');

    setFlights(prev => prev.map(f => {
      if (f.id !== 'SQ-402') return f;

      const updatedTimeline = [
        ...f.timeline,
        { time: '13:24', label: 'Multi-Criteria Re-Optimization: Delivery (40%) + Reliability (25%) + Cost (15%) + Compliance (10%) + Carbon (10%)', type: 'normal' as const },
        { time: '13:25', label: 'GlobalParts (FRA) Disqualified: 20h 30m > 18h Recovery Deadline', type: 'warn' as const },
        { time: '13:26', label: 'Optimal Candidate Selected: SkySupply Global BOM ($14,700, 11h 10m ETA, Rel: 91%)', type: 'success' as const },
        { time: '13:28', label: 'Airway Bill Generated · Hot-Shot Air Cargo BOM → DEL Confirmed', type: 'success' as const },
        { time: '13:30', label: 'Autonomous Recovery Verified · Dual Airworthiness Compliance Validated', type: 'success' as const }
      ];

      return {
        ...f,
        timeline: updatedTimeline
      };
    }));
  };

  // RESET SCENARIO
  const handleResetScenario = () => {
    setIsStockoutDisrupted(false);
    setIsReplanned(false);
    setFlights(INITIAL_FLIGHTS_DATASET);
    setSelectedSupplierId('SUP-AEROPARTS-SIN');
  };

  // Camera Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleFitAll = () => {
    setMapMode('NETWORK');
  };
  const handleFitSelected = () => {
    setMapMode('SELECTED_FLIGHT');
  };
  const handleCenterAOG = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedFlight.groundedLocation.lat, selectedFlight.groundedLocation.lng], 6, { duration: 0.8 });
    }
  };

  return (
    <div className="w-full bg-[#080C14] border border-[#151D2A] rounded-xl overflow-hidden shadow-2xl flex flex-col font-sans">
      
      {/* 1. TOP HEADER & MAP CONTROLS */}
      <div className="px-4 py-2.5 bg-[#090E17] border-b border-[#151D2A] flex flex-wrap items-center justify-between gap-2">
        
        {/* Left Title & Status */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shadow-md">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wider">FLIGHT & RECOVERY MAP</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 text-[9px] font-mono font-bold uppercase">
                OPERATIONS ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Interactive fleet tracking · 100% synchronized with multi-agent orchestrator
            </div>
          </div>
        </div>

        {/* Center: Map Modes Segmented Control */}
        <div className="flex items-center bg-[#070B11] border border-[#1E293B] rounded-lg p-0.5 text-[11px] font-mono font-bold">
          <button
            onClick={() => setMapMode('NETWORK')}
            className={`px-3 py-1 rounded transition cursor-pointer ${
              mapMode === 'NETWORK' ? 'bg-cyan-500 text-black font-extrabold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            NETWORK
          </button>
          <button
            onClick={() => setMapMode('SELECTED_FLIGHT')}
            className={`px-3 py-1 rounded transition cursor-pointer ${
              mapMode === 'SELECTED_FLIGHT' ? 'bg-cyan-500 text-black font-extrabold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            SELECTED FLIGHT
          </button>
          <button
            onClick={() => setMapMode('RECOVERY')}
            className={`px-3 py-1 rounded transition cursor-pointer ${
              mapMode === 'RECOVERY' ? 'bg-emerald-500 text-black font-extrabold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            RECOVERY
          </button>
        </div>

        {/* Right: Flight Filter Dropdown & Layers */}
        <div className="flex items-center space-x-2.5">
          
          {/* ALL FLIGHTS Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFlightDropdown(!showFlightDropdown)}
              className="bg-[#0D1420] border border-[#1E293B] hover:border-cyan-500 text-white px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center space-x-2 transition cursor-pointer"
            >
              <span>{mapMode === 'NETWORK' ? 'ALL FLIGHTS' : `${selectedFlight.flightNumber} — ${selectedFlight.groundedLocation.code}`}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showFlightDropdown && (
              <div className="absolute right-0 top-8 z-30 w-52 bg-[#0A101A] border border-[#1E293B] rounded-lg shadow-2xl py-1 text-xs font-mono select-none">
                <div
                  onClick={() => {
                    setMapMode('NETWORK');
                    setShowFlightDropdown(false);
                  }}
                  className="px-3 py-1.5 hover:bg-[#152238] text-slate-300 hover:text-cyan-400 cursor-pointer font-bold border-b border-[#1E293B]"
                >
                  All Flights (Network Overview)
                </div>
                {flights.map(f => (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedFlightId(f.id);
                      setMapMode('SELECTED_FLIGHT');
                      setShowFlightDropdown(false);
                    }}
                    className={`px-3 py-1.5 hover:bg-[#152238] cursor-pointer flex items-center justify-between ${
                      selectedFlightId === f.id && mapMode !== 'NETWORK' ? 'text-cyan-400 font-bold bg-[#0D1624]' : 'text-slate-300'
                    }`}
                  >
                    <span>{f.flightNumber}</span>
                    <span className="text-[10px] text-slate-500">{f.groundedLocation.code} ({f.aircraft})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map Layers Modal Button */}
          <button
            onClick={() => setShowLayersModal(!showLayersModal)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition cursor-pointer ${
              showLayersModal ? 'bg-cyan-950 text-cyan-300 border-cyan-600' : 'bg-[#0D1420] text-slate-300 border-[#1E293B] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Map Layers</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN MAP CANVAS & RIGHT DETAIL PANEL */}
      <div className="flex flex-col lg:flex-row h-[510px] relative">
        
        {/* Left Map Viewport */}
        <div className="flex-1 h-full relative overflow-hidden bg-[#05080E]">
          
          {/* Leaflet Canvas Container */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Left Camera Controls */}
          <div className="absolute top-3 left-3 z-10 flex flex-col space-y-1">
            <button 
              onClick={handleZoomIn}
              title="Zoom In"
              className="w-7 h-7 rounded bg-[#0A101A]/95 hover:bg-[#142032] border border-[#1E293B] text-slate-200 flex items-center justify-center shadow-lg transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleZoomOut}
              title="Zoom Out"
              className="w-7 h-7 rounded bg-[#0A101A]/95 hover:bg-[#142032] border border-[#1E293B] text-slate-200 flex items-center justify-center shadow-lg transition cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleFitAll}
              title="Fit All Network Flights"
              className="w-7 h-7 rounded bg-[#0A101A]/95 hover:bg-[#142032] border border-[#1E293B] text-slate-200 flex items-center justify-center shadow-lg transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            </button>
            <button 
              onClick={handleFitSelected}
              title="Fit Selected Flight Route"
              className="w-7 h-7 rounded bg-[#0A101A]/95 hover:bg-[#142032] border border-[#1E293B] text-slate-200 flex items-center justify-center shadow-lg transition cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {/* Floating Map Layers Control Widget */}
          {showLayersModal && (
            <div className="absolute top-3 right-3 z-20 w-48 bg-[#0A101A]/95 border border-[#1A2536] rounded-lg p-2.5 shadow-2xl backdrop-blur-sm text-[11px] space-y-1.5 select-none">
              <div className="flex items-center justify-between pb-1 border-b border-[#1A2536]">
                <span className="text-[10px] font-bold text-slate-300 font-mono tracking-wider uppercase">MAP LAYERS</span>
                <div className="flex items-center space-x-1 text-slate-400">
                  <button onClick={resetLayersToDefault} title="Reset to Default" className="hover:text-white cursor-pointer">
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <button onClick={() => setShowLayersModal(false)} title="Close" className="hover:text-white cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-0.5 pt-0.5">
                {[
                  { key: 'aircraft', label: 'Aircraft' },
                  { key: 'airports', label: 'Airports' },
                  { key: 'flightRoutes', label: 'Flight Routes' },
                  { key: 'suppliers', label: 'Suppliers' },
                  { key: 'recoveryRoutes', label: 'Recovery Routes' },
                  { key: 'aogEvents', label: 'AOG Events' },
                  { key: 'disruptions', label: 'Disruptions' },
                  { key: 'flightHistory', label: 'Flight History' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-0.5">
                    <span className="text-slate-300 text-[10px]">{label}</span>
                    <button
                      onClick={() => toggleLayer(key as keyof typeof layers)}
                      className={`w-6 h-3.5 flex items-center rounded-full p-0.5 cursor-pointer transition ${
                        layers[key as keyof typeof layers] ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-2.5 h-2.5 rounded-full shadow-md transform transition ${
                          layers[key as keyof typeof layers] ? 'translate-x-2.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-1 border-t border-[#1A2536] space-y-0.5">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Advanced Overlays</div>
                {[
                  { key: 'radarRange', label: 'Radar / Coverage' },
                  { key: 'firBoundaries', label: 'FIR Boundaries' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-0.5">
                    <span className="text-slate-400 text-[10px]">{label}</span>
                    <button
                      onClick={() => toggleLayer(key as keyof typeof layers)}
                      className={`w-6 h-3.5 flex items-center rounded-full p-0.5 cursor-pointer transition ${
                        layers[key as keyof typeof layers] ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-2.5 h-2.5 rounded-full shadow-md transform transition ${
                          layers[key as keyof typeof layers] ? 'translate-x-2.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Airport Inspector Overlay */}
          {inspectedAirport && (
            <div className="absolute bottom-12 left-3 z-20 w-64 bg-[#0A101A]/95 border border-cyan-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white font-mono">{inspectedAirport.code} · {inspectedAirport.city}</span>
                </div>
                <button onClick={() => setInspectedAirport(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[11px] text-slate-300 font-medium">{inspectedAirport.name}</div>
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-mono">
                <div className="p-1 rounded bg-[#111A28] border border-[#1E293B]">
                  <div className="text-[8px] text-slate-500">ACTIVE AOG</div>
                  <div className="text-xs font-bold text-red-400">{inspectedAirport.aogCount}</div>
                </div>
                <div className="p-1 rounded bg-[#111A28] border border-[#1E293B]">
                  <div className="text-[8px] text-slate-500">SUPPLIERS</div>
                  <div className="text-xs font-bold text-emerald-400">{inspectedAirport.availableSuppliers}</div>
                </div>
                <div className="p-1 rounded bg-[#111A28] border border-[#1E293B]">
                  <div className="text-[8px] text-slate-500">RECOVERIES</div>
                  <div className="text-xs font-bold text-cyan-400">{inspectedAirport.activeRecoveries}</div>
                </div>
              </div>
            </div>
          )}

          {/* Supplier Inspector Overlay */}
          {inspectedSupplier && (
            <div className="absolute bottom-12 left-3 z-20 w-72 bg-[#0A101A]/95 border border-emerald-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <div className="flex items-center space-x-1.5">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">{inspectedSupplier.name}</span>
                </div>
                <button onClick={() => setInspectedSupplier(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[11px] text-slate-300 font-medium">{inspectedSupplier.locationName} ({inspectedSupplier.locationCode})</div>
              
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono pt-1">
                <div className="flex justify-between bg-[#111A28] p-1 rounded">
                  <span className="text-slate-400">Stock:</span>
                  <span className={`font-bold ${inspectedSupplier.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {inspectedSupplier.stock} units
                  </span>
                </div>
                <div className="flex justify-between bg-[#111A28] p-1 rounded">
                  <span className="text-slate-400">ETA:</span>
                  <span className="text-cyan-400 font-bold">{inspectedSupplier.etaLabel}</span>
                </div>
                <div className="flex justify-between bg-[#111A28] p-1 rounded">
                  <span className="text-slate-400">Cost:</span>
                  <span className="text-white font-bold">${inspectedSupplier.cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bg-[#111A28] p-1 rounded">
                  <span className="text-slate-400">Reliability:</span>
                  <span className="text-cyan-300 font-bold">{inspectedSupplier.reliability}%</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-0.5 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>{inspectedSupplier.compliance}</span>
              </div>
            </div>
          )}

          {/* Bottom Map Legend Bar */}
          <div className="absolute bottom-2 left-2 z-10 bg-[#080E17]/90 border border-[#172233] px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-3 text-[10px] font-mono text-slate-300">
            <span className="flex items-center space-x-1">
              <Plane className="w-3 h-3 text-cyan-400" />
              <span>Aircraft</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Airport</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Supplier</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3.5 h-0.5 bg-cyan-400 inline-block"></span>
              <span>Flight Route</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3.5 h-0.5 border-t border-dashed border-emerald-400 inline-block"></span>
              <span>Recovery Route</span>
            </span>
            <span className="flex items-center space-x-1 text-red-400">
              <AlertTriangle className="w-3 h-3" />
              <span>AOG</span>
            </span>
          </div>

        </div>

        {/* 3. RIGHT DOCKED OPERATIONS PANEL */}
        <div className="w-full lg:w-[380px] bg-[#090E17] border-t lg:border-t-0 lg:border-l border-[#151D2A] flex flex-col justify-between overflow-hidden">
          
          {/* Top Panel Tabs Header */}
          <div className="border-b border-[#151D2A] flex items-center text-[11px] font-bold font-mono">
            <button 
              onClick={() => setActiveTab('flights')}
              className={`flex-1 py-2 text-center transition cursor-pointer ${
                activeTab === 'flights' 
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#0E1522]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FLIGHT & RECOVERY
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`flex-1 py-2 text-center transition cursor-pointer ${
                activeTab === 'events' 
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-[#0E1522]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              TIMELINE ({selectedFlight.timeline.length})
            </button>
          </div>

          {/* TAB 1: FLIGHT & RECOVERY DETAIL */}
          {activeTab === 'flights' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              
              {/* Flight Selector Cards */}
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {flights.map(f => {
                  const isSelected = f.id === selectedFlightId;
                  return (
                    <div
                      key={f.id}
                      onClick={() => {
                        setSelectedFlightId(f.id);
                        setMapMode('SELECTED_FLIGHT');
                        setInspectedAirport(null);
                        setInspectedSupplier(null);
                      }}
                      className={`p-2 rounded-lg border transition cursor-pointer space-y-1 ${
                        isSelected
                          ? 'bg-[#111A28] border-cyan-500 shadow-md shadow-cyan-950/50'
                          : 'bg-[#0D1420] border-[#1E293B] hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Plane className={`w-3.5 h-3.5 -rotate-45 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span className="text-xs font-black text-white">{f.flightNumber}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{f.aircraft}</span>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold font-mono border ${
                          f.status === 'TURNBACK'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : f.status === 'DIVERTED'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : 'bg-red-950 text-red-400 border-red-800'
                        }`}>
                          {f.statusLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>{f.origin.code} → {f.destination.code}</span>
                        <span className="text-slate-500 truncate max-w-[140px]">{f.defect}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Flight Detailed Operational Profile */}
              <div className="p-3 rounded-lg bg-[#0C121E] border border-[#1E293B] space-y-2 text-xs">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[#1E293B]">
                  <div>
                    <div className="text-sm font-extrabold text-white font-mono">{selectedFlight.flightNumber} · {selectedFlight.aircraft}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{selectedFlight.airline} · {selectedFlight.aircraftType}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500 text-red-400 text-[10px] font-mono font-bold">
                    AOG GROUNDED
                  </span>
                </div>

                {/* Location & Bay */}
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Grounded At:</span>
                  <span className="text-cyan-300 font-bold">{selectedFlight.groundedLocation.code} · {selectedFlight.groundedLocation.bay}</span>
                </div>

                {/* Defect Telemetry */}
                <div className="p-2 rounded bg-[#111A28] border border-[#1E293B] space-y-1">
                  <div className="text-[10px] font-mono text-slate-400">DEFECT & ATA CHAPTER</div>
                  <div className="text-xs font-bold text-slate-200">{selectedFlight.defect}</div>
                  <div className="text-[10px] text-amber-300 font-mono">{selectedFlight.defectDetail}</div>
                </div>

                {/* Required Part & Quantity */}
                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="p-1.5 rounded bg-[#111A28] border border-[#1E293B]">
                    <div className="text-[9px] text-slate-400">REQUIRED PART</div>
                    <div className="text-xs font-bold text-cyan-400">{selectedFlight.requiredPart}</div>
                  </div>
                  <div className="p-1.5 rounded bg-[#111A28] border border-[#1E293B]">
                    <div className="text-[9px] text-slate-400">RECOVERY DEADLINE</div>
                    <div className="text-xs font-bold text-red-400">{selectedFlight.recoveryDeadline}</div>
                  </div>
                </div>

                {/* Selected Supplier & Plan Matrix */}
                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 uppercase font-bold tracking-wider">SUPPLIER CANDIDATES ({selectedFlight.suppliers.length})</span>
                    <span className="text-emerald-400 font-bold">OPTIMIZED</span>
                  </div>

                  <div className="space-y-1">
                    {selectedFlight.suppliers.map(sup => {
                      const isChosen = sup.id === selectedSupplierId;
                      const isOut = sup.status === 'OUT_OF_STOCK';
                      const isDisq = sup.status === 'DISQUALIFIED';

                      return (
                        <div
                          key={sup.id}
                          onClick={() => {
                            if (sup.status === 'AVAILABLE') {
                              setSelectedSupplierId(sup.id);
                            }
                          }}
                          className={`p-2 rounded border text-[11px] font-mono transition cursor-pointer space-y-1 ${
                            isChosen
                              ? 'bg-[#142338] border-emerald-500 shadow-md'
                              : isOut
                              ? 'bg-red-950/20 border-red-900/50 opacity-75'
                              : isDisq
                              ? 'bg-[#0A101A] border-slate-800 opacity-60'
                              : 'bg-[#101826] border-[#1E293B] hover:border-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 font-bold">
                              <span className={isChosen ? 'text-emerald-400' : isOut ? 'text-red-400 line-through' : 'text-slate-200'}>
                                {sup.name}
                              </span>
                              <span className="text-[9px] text-slate-400">({sup.locationCode})</span>
                            </div>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                              isOut ? 'bg-red-950 text-red-400 border border-red-700' : isDisq ? 'bg-slate-900 text-slate-400' : isChosen ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {isOut ? 'OUT OF STOCK' : isDisq ? 'INFEASIBLE' : isChosen ? 'SELECTED' : 'AVAILABLE'}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1 text-[9px] text-slate-400">
                            <div>ETA: <span className="text-cyan-300 font-bold">{sup.etaLabel}</span></div>
                            <div>Cost: <span className="text-white font-bold">${sup.cost.toLocaleString()}</span></div>
                            <div>Rel: <span className="text-cyan-300 font-bold">{sup.reliability}%</span></div>
                            <div>CO2: <span className="text-slate-300">{sup.carbonKg}kg</span></div>
                          </div>

                          {isDisq && (
                            <div className="text-[8px] text-red-400/90">{sup.disqualifyReason}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Disruption & Replanning Interactive Action for SQ-402 */}
                {selectedFlight.id === 'SQ-402' && (
                  <div className="pt-2 border-t border-[#1E293B] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>AGENTIC FAILURE & REPLAN TEST</span>
                      </span>
                    </div>

                    {!isStockoutDisrupted ? (
                      <button
                        onClick={handleTriggerStockout}
                        className="w-full py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500 text-red-300 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>Trigger Supplier Stockout (AeroParts SIN)</span>
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="p-2 rounded bg-red-950/50 border border-red-600/70 text-[10px] font-mono text-red-200">
                          <div className="font-bold flex items-center space-x-1 text-red-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>AeroParts Reported Stockout (2 → 0)</span>
                          </div>
                          <div className="text-[9px] text-slate-300 pt-0.5">
                            Previous recovery route invalidated. SQUAWK autonomous replanner activated SkySupply Global (BOM Hub).
                          </div>
                        </div>

                        <button
                          onClick={handleResetScenario}
                          className="w-full py-1 rounded bg-[#101928] hover:bg-[#18263D] border border-[#1E293B] text-slate-300 text-[10px] font-mono flex items-center justify-center space-x-1.5 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-cyan-400" />
                          <span>Reset Recovery Scenario</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 2: LIVE OPERATIONAL EVENT TIMELINE */}
          {activeTab === 'events' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
              <div className="text-[10px] text-slate-400 pb-1 border-b border-[#1E293B] flex items-center justify-between">
                <span>EVENTS FOR {selectedFlight.flightNumber} ({selectedFlight.aircraft})</span>
                <span className="text-cyan-400">{selectedFlight.groundedLocation.code}</span>
              </div>

              <div className="space-y-2 pt-1">
                {selectedFlight.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-[11px]">
                    <span className="text-[10px] text-slate-500 font-bold shrink-0">{item.time}</span>
                    <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0 bg-cyan-400"></div>
                    <div className={`leading-tight ${
                      item.type === 'alert'
                        ? 'text-red-400 font-bold'
                        : item.type === 'warn'
                        ? 'text-amber-300 font-semibold'
                        : item.type === 'success'
                        ? 'text-emerald-400 font-semibold'
                        : 'text-slate-300'
                    }`}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="p-2.5 bg-[#070B11] border-t border-[#151D2A] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>ORCHESTRATOR: <strong className="text-emerald-400">ONLINE</strong></span>
            <span>OPTIMIZATION WEIGHT: <strong>DEL 40% · REL 25% · COST 15%</strong></span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default FlightRecoveryMap;
