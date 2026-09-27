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
    <div className="p-4 space-y-4 max-w-7xl mx-auto bg-[#000000] font-mono text-neutral-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2 tracking-wide uppercase">
            <Database className="w-4 h-4 text-[#BC0202]" />
            <span>CERTIFIED AVIATION SUPPLIER & ROTABLES NETWORK</span>
          </h2>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Database of authorized 145 repair stations, rotable distributors, and OEM parts hubs
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded bg-[#080808] text-white border border-[#1E1E1E]">
          {vendors.length} SUPPLIERS
        </span>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {vendors.map((v) => (
          <div key={v.id} className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building className="w-3.5 h-3.5 text-[#BC0202]" />
                <span className="text-xs text-neutral-400 font-mono">CAGE: {v.cage_code || 'N/A'}</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                {Math.round(v.calculated_reliability * 100)}% REL
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white font-sans">{v.name}</h3>
              <div className="flex items-center space-x-1.5 text-xs text-neutral-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                <span>Primary Hub: <strong className="text-white">{v.location_hub}</strong></span>
              </div>
            </div>

            <div className="p-2 bg-[#080808] border border-[#1E1E1E] rounded grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <div className="text-[9px] text-neutral-500 uppercase">ORDERS</div>
                <div className="font-bold text-white">{v.verified_orders_count}</div>
              </div>
              <div>
                <div className="text-[9px] text-neutral-500 uppercase">AVG DELAY</div>
                <div className="font-bold text-white">{v.avg_delay_minutes}m</div>
              </div>
            </div>

            <div className="pt-1.5 border-t border-[#1E1E1E] text-[10px] text-neutral-400 space-y-0.5">
              {v.contact_aog_desk && (
                <div className="flex items-center space-x-1.5">
                  <Phone className="w-3 h-3 text-[#BC0202]" />
                  <span>{v.contact_aog_desk}</span>
                </div>
              )}
              {v.contact_email && (
                <div className="flex items-center space-x-1.5 truncate">
                  <Mail className="w-3 h-3 text-[#BC0202]" />
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
