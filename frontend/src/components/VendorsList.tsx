import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Building, 
  MapPin, 
  Phone, 
  Mail 
} from 'lucide-react';
import { Vendor } from '../types';
import { api } from '../api';

export const VendorsList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await api.getVendors();
      setVendors(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto font-mono text-[#252820]">
      
      {/* Header */}
      <div className="p-5 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-base font-bold text-[#252820] flex items-center space-x-2 tracking-wide uppercase">
            <Database className="w-4 h-4 text-[#D9A62E]" />
            <span>CERTIFIED AVIATION SUPPLIER & ROTABLES NETWORK</span>
          </h2>
          <p className="text-xs text-[#4A483E] font-sans mt-0.5">
            Database of authorized 145 repair stations, rotable distributors, and OEM parts hubs
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[rgba(217,166,46,0.35)] font-bold shadow-sm">
          {vendors.length} SUPPLIERS
        </span>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {vendors.map((v) => (
          <div key={v.id} className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.25)] rounded-xl p-4 space-y-2.5 shadow-md hover:border-[#D9A62E] transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-[#A87813]" />
                <span className="text-xs text-[#8C8472] font-mono">CAGE: {v.cage_code || 'N/A'}</span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#78966A]/20 text-[#4E6B42] border border-[#78966A]/40">
                {Math.round(v.calculated_reliability * 100)}% REL
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#252820] font-sans">{v.name}</h3>
              <div className="flex items-center space-x-1.5 text-xs text-[#4A483E] mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#A87813]" />
                <span>Primary Hub: <strong className="text-[#252820]">{v.location_hub}</strong></span>
              </div>
            </div>

            <div className="p-2 bg-[rgba(255,248,235,0.85)] border border-[rgba(217,166,46,0.25)] rounded grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <div className="text-[9px] text-[#8C8472] uppercase font-bold">ORDERS</div>
                <div className="font-bold text-[#252820] font-mono">{v.verified_orders_count}</div>
              </div>
              <div>
                <div className="text-[9px] text-[#8C8472] uppercase font-bold">AVG DELAY</div>
                <div className="font-bold text-[#A87813] font-mono">{v.avg_delay_minutes}m</div>
              </div>
            </div>

            <div className="pt-2 border-t border-[rgba(217,166,46,0.2)] text-[10px] text-[#4A483E] space-y-1">
              {v.contact_aog_desk && (
                <div className="flex items-center space-x-1.5 font-mono">
                  <Phone className="w-3 h-3 text-[#A87813]" />
                  <span>{v.contact_aog_desk}</span>
                </div>
              )}
              {v.contact_email && (
                <div className="flex items-center space-x-1.5 truncate font-mono">
                  <Mail className="w-3 h-3 text-[#A87813]" />
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
