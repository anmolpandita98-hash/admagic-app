import React, { useState, useEffect } from "react";
import { 
  Layers, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  ShieldCheck,
  Globe,
  Smartphone,
  Monitor,
  Trash2,
  Play
} from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export default function BulkTargeting() {
  const { user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!user) return;
    const qCount = query(collection(db, "campaigns"), where("createdBy", "==", user.uid));
    getDocs(qCount).then(snapshot => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Simulating rules from database
    const MOCK_RULES = [
      { id: '1', campaign: 'Spring Promo', variable: 'Country', logic: 'DENY', value: 'CN, RU, IR', status: 'Active' },
      { id: '2', campaign: 'FinTech App', variable: 'Device', logic: 'ALLOW', value: 'iPhone 15, Galaxy S24', status: 'Simulation' },
      { id: '3', campaign: 'Global Survey', variable: 'Source', logic: 'DENY', value: 'Known Center IPs', status: 'Rule Active' }
    ];
    setRules(MOCK_RULES);
  }, [user]);

  const handleFileUpload = (e: any) => {
    setUploading(true);
    // Simulate parsing
    setTimeout(() => {
      setUploading(false);
      alert("CSV Payload Processed: 12 rules analyzed, 2 conflicts detected in regional subsets.");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Bulk Targeting</h2>
          <p className="text-sm text-[#64748b]">Upload and distribute targeting logic across multi-campaign segments.</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" /> Download Template
          </button>
          <button className="btn-primary flex items-center bg-[#1e293b] text-white">
            <Play className="w-4 h-4 mr-2" /> Validate All Rules
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div 
            className={`panel border-2 border-dashed h-full flex flex-col items-center justify-center py-12 text-center transition-all ${
              dragActive ? 'border-[#1ea4d9] bg-[#f0f9ff]' : 'border-[#e2e8f0]'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e); }}
          >
            {uploading ? (
              <div className="space-y-4">
                <div className="w-12 h-12 border-4 border-[#1ea4d9] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-[#1e293b] animate-pulse">Parsing CSV Directives...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-[#f8fafc] rounded-full flex items-center justify-center mb-6">
                  <Upload className="w-8 h-8 text-[#94a3b8]" />
                </div>
                <h3 className="font-bold text-[#1e293b] mb-2">Drop Targeting Payload</h3>
                <p className="text-xs text-[#64748b] max-w-[200px] mb-6">Supports .csv or .xlsx with Campaign_ID and Rule_Logic headers.</p>
                <input 
                  type="file" 
                  id="csv-upload" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  accept=".csv"
                />
                <label 
                  htmlFor="csv-upload" 
                  className="btn-secondary cursor-pointer hover:bg-[#f1f5f9]"
                >
                  Browse Files
                </label>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="panel !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <h3 className="text-[11px] font-bold text-[#1e293b] uppercase tracking-widest">Active Rule Preview</h3>
              <div className="flex items-center space-x-2">
                <button className="p-1.5 hover:bg-[#f1f5f9] rounded text-[#64748b]"><Filter className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 hover:bg-[#f1f5f9] rounded text-[#64748b]"><Search className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="trackier-table">
                <thead>
                  <tr>
                    <th className="text-left lowercase !normal-case text-[#64748b]">scope</th>
                    <th className="text-left lowercase !normal-case text-[#64748b]">logic</th>
                    <th className="text-left lowercase !normal-case text-[#64748b]">variable</th>
                    <th className="text-left lowercase !normal-case text-[#64748b]">values</th>
                    <th className="text-center lowercase !normal-case text-[#64748b]">status</th>
                    <th className="text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="group hover:bg-[#f8fafc]">
                      <td className="font-bold text-[#1ea4d9]">{rule.campaign}</td>
                      <td>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          rule.logic === 'DENY' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                          {rule.logic}
                        </span>
                      </td>
                      <td className="text-xs font-medium text-[#1e293b]">
                        <div className="flex items-center">
                          {rule.variable === 'Device' && <Smartphone className="w-3 h-3 mr-1.5 text-[#64748b]" />}
                          {rule.variable === 'Country' && <Globe className="w-3 h-3 mr-1.5 text-[#64748b]" />}
                          {rule.variable}
                        </div>
                      </td>
                      <td className="text-[11px] text-[#64748b] font-mono">{rule.value}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          <span className="text-[9px] font-bold uppercase text-[#94a3b8]">Evaluated</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <button className="p-1.5 text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="panel bg-[#f0fdf4] border-[#bbf7d0] flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Valid Directives</p>
                <p className="text-lg font-bold text-[#1e293b]">42 Active</p>
              </div>
            </div>
            <div className="panel bg-[#fff7ed] border-[#fed7aa] flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Shadow Overlaps</p>
                <p className="text-lg font-bold text-[#1e293b]">2 Conflicts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
