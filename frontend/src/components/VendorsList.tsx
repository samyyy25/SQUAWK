import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Building, 
  MapPin, 
  Star, 
  Clock, 
  ShieldCheck, 
  Phone, 
  Mail 
} from 'lucide-react';
import { Vendor } from '../types';
import { api } from '../api';

export const VendorsList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await api.getVendors();
      setVendors(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Certified Aviation Supplier & Rotables Network</span>
          </h2>
          <p className="text-xs text-slate-400">
            Database of authorized 145 repair stations, rotable distributors, and OEM parts hubs
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded bg-slate-800 text-slate-300">
          {vendors.length} Authorized Suppliers
        </span>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vendors.map((v) => (
          <div key={v.id} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg hover:border-slate-700 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-slate-400">CAGE: {v.cage_code || 'N/A'}</span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {Math.round(v.calculated_reliability * 100)}% REL
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{v.name}</h3>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Primary Hub: <strong>{v.location_hub}</strong></span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/70 border border-slate-900 rounded-xl grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Verified Orders</div>
                <div className="font-mono font-bold text-slate-200">{v.verified_orders_count}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Avg Delay</div>
                <div className="font-mono font-bold text-slate-200">{v.avg_delay_minutes}m</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              {v.contact_aog_desk && (
                <div className="flex items-center space-x-1.5 font-mono">
                  <Phone className="w-3 h-3 text-cyan-400" />
                  <span>{v.contact_aog_desk}</span>
                </div>
              )}
              {v.contact_email && (
                <div className="flex items-center space-x-1.5 font-mono truncate">
                  <Mail className="w-3 h-3 text-cyan-400" />
                  <span className="truncate">{v.contact_email}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
