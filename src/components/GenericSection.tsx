import React from "react";
import { 
  Users, 
  History, 
  ReceiptText, 
  HelpCircle, 
  CreditCard, 
  ArrowLeft,
  Search,
  Filter
} from "lucide-react";
import { Link } from "react-router-dom";

interface GenericSectionProps {
  title: string;
  description: string;
  icon: any;
  items?: any[];
}

export default function GenericSection({ title, description, icon: Icon, items = [] }: GenericSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white border border-[#e2e8f0] rounded-lg text-[#1ea4d9] shadow-sm">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1e293b]">{title}</h2>
            <p className="text-sm text-[#64748b]">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary !py-2">Export Data</button>
          <button className="btn-primary !py-2">Manage</button>
        </div>
      </div>

      <div className="panel !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input 
              type="text" 
              placeholder={`Search ${title.toLowerCase()}...`} 
              className="w-full bg-white border border-[#e2e8f0] rounded pl-10 pr-4 py-1.5 text-sm outline-none focus:border-[#1ea4d9]"
            />
          </div>
          <button className="btn-secondary !py-1.5 flex items-center text-xs">
            <Filter className="w-3.5 h-3.5 mr-2" /> All Logs
          </button>
        </div>
        
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-6">
            <Icon className="w-10 h-10 text-[#cbd5e1]" />
          </div>
          <h3 className="text-lg font-bold text-[#1e293b]">No data found in {title}</h3>
          <p className="text-sm text-[#64748b] max-w-sm mt-2">
            The {title.toLowerCase()} repository is currently being synced from regional nodes. 
            Operational records will appear here as activity unfolds.
          </p>
          <Link to="/" className="mt-8 text-[#1ea4d9] text-sm font-bold flex items-center hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="panel bg-[#f8fafc] border-dashed flex items-center justify-center py-12">
            <div className="text-center">
              <Box className="w-8 h-8 text-[#cbd5e1] mx-auto mb-3" />
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Node_0{i}_ACTIVE</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Box } from "lucide-react";
