import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Settings, 
  Pause, 
  Play,
  RotateCw,
  MoreVertical,
  Link,
  ShieldCheck,
  Globe
} from "lucide-react";

export default function OfferCheck() {
  const [rules, setRules] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const MOCK_RULES = [
      { id: '1', name: 'Spring Sale Landing', url: 'offer.track/s2024', interval: '15m', status: 'Healthy', lastCheck: '2m ago', hops: 2 },
      { id: '2', name: 'Global Finance App', url: 'finance.app/v1', interval: '30m', status: 'Warning', lastCheck: '12m ago', hops: 5 },
      { id: '3', name: 'Gaming Pre-Reg', url: 'play.store/gameX', interval: '1h', status: 'Critical', lastCheck: '45m ago', hops: 0 }
    ];
    setRules(MOCK_RULES);
  }, []);

  const runManualCheck = () => {
    setChecking(true);
    setTimeout(() => setChecking(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Offer Check & Hop Audit</h2>
          <p className="text-sm text-[#64748b]">Automated monitoring of landing page health and redirect chain integrity.</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Settings className="w-4 h-4 mr-2" /> Audit Rules
          </button>
          <button 
            onClick={runManualCheck}
            disabled={checking}
            className="btn-primary flex items-center bg-[#1e293b] text-white disabled:opacity-50"
          >
            {checking ? <RotateCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Scan All Offers
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="panel bg-[#f0fdf4] border-[#bbf7d0]">
          <h4 className="text-[10px] font-bold text-[#166534] uppercase tracking-widest mb-2">Network Health</h4>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-[#1e293b]">94%</span>
            <span className="text-xs font-bold text-[#166534] bg-white px-2 py-0.5 rounded border border-[#bbf7d0]">Stable</span>
          </div>
        </div>
        <div className="panel bg-[#fff7ed] border-[#fed7aa]">
          <h4 className="text-[10px] font-bold text-[#9a3412] uppercase tracking-widest mb-2">Redirect Hops (Avg)</h4>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-[#1e293b]">3.2</span>
            <span className="text-xs font-bold text-[#9a3412] bg-white px-2 py-0.5 rounded border border-[#fed7aa]">Elevated</span>
          </div>
        </div>
        <div className="panel bg-[#fef2f2] border-[#fecaca]">
          <h4 className="text-[10px] font-bold text-[#991b1b] uppercase tracking-widest mb-2">Broken Destinations</h4>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-[#1e293b]">2</span>
            <span className="text-xs font-bold text-[#991b1b] bg-white px-2 py-0.5 rounded border border-[#fecaca] animate-pulse font-mono tracking-tighter">ACTION_REQ</span>
          </div>
        </div>
      </div>

      <div className="panel !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center space-x-4">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input 
                type="text" 
                placeholder="Search offer urls..." 
                className="w-full bg-white border border-[#e2e8f0] rounded pl-10 pr-4 py-2 text-sm focus:border-[#1ea4d9] outline-none"
              />
            </div>
            <div className="flex space-x-2">
              <span className="text-[10px] font-bold text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded">ALL REGIONS</span>
              <span className="text-[10px] font-bold text-[#64748b] bg-[#f1f5f9] px-2 py-1 rounded">24H AGGREGATED</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="trackier-table">
            <thead>
              <tr>
                <th className="text-left lowercase !normal-case text-[#64748b]">offer name</th>
                <th className="text-left lowercase !normal-case text-[#64748b]">destination</th>
                <th className="text-center lowercase !normal-case text-[#64748b]">interval</th>
                <th className="text-center lowercase !normal-case text-[#64748b]">hops</th>
                <th className="text-center lowercase !normal-case text-[#64748b]">status</th>
                <th className="text-right lowercase !normal-case text-[#64748b]">last_sync</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="group hover:bg-[#f8fafc]">
                  <td>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3.5 h-3.5 text-[#1ea4d9]" />
                      <span className="font-bold text-[#1e293b]">{rule.name}</span>
                    </div>
                  </td>
                  <td className="text-xs font-mono text-[#64748b] max-w-xs truncate">{rule.url}</td>
                  <td className="text-center text-xs font-bold text-[#64748b]">{rule.interval}</td>
                  <td className="text-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      rule.hops >= 5 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]'
                    }`}>
                      {rule.hops} Hops
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center">
                      {rule.status === 'Healthy' && <CheckCircle2 className="w-4 h-4 text-green-500 mr-1.5" />}
                      {rule.status === 'Warning' && <AlertTriangle className="w-4 h-4 text-orange-500 mr-1.5" />}
                      {rule.status === 'Critical' && <Pause className="w-4 h-4 text-red-500 mr-1.5" />}
                      <span className={`text-[10px] font-bold uppercase ${
                        rule.status === 'Healthy' ? 'text-green-700' : 
                        rule.status === 'Warning' ? 'text-orange-700' : 'text-red-700'
                      }`}>
                        {rule.status}
                      </span>
                    </div>
                  </td>
                  <td className="text-right text-[10px] font-bold text-[#94a3b8] uppercase">{rule.lastCheck}</td>
                  <td className="text-right">
                    <button className="p-1 px-2 border border-[#e2e8f0] rounded text-[#64748b] hover:border-[#1ea4d9] hover:text-[#1ea4d9] transition-all opacity-0 group-hover:opacity-100">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
