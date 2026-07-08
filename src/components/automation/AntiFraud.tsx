import React, { useState, useEffect } from "react";
import { ShieldCheck, Zap, AlertTriangle, ShieldAlert, Cpu, Activity, Info, BarChart3 } from "lucide-react";
import { api } from "../../lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AntiFraud() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    blockVpn: true,
    blockProxy: true,
    blockDatacenter: true,
    blockBot: true,
    aiThreshold: 85
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/api/automation/antifraud");
      setSettings(data);
    } catch (e) {
      console.error("Failed to fetch anti-fraud settings", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (newSettings: any) => {
    setSettings(newSettings);
    setSaving(true);
    try {
      await api.post("/api/automation/antifraud", newSettings);
    } catch (e) {
      console.error("Failed to update anti-fraud settings", e);
    } finally {
      setSaving(false);
    }
  };

  const chartData = [
    { name: "00:00", clean: 400, suspect: 24 },
    { name: "04:00", clean: 300, suspect: 13 },
    { name: "08:00", clean: 600, suspect: 98 },
    { name: "12:00", clean: 800, suspect: 39 },
    { name: "16:00", clean: 500, suspect: 48 },
    { name: "20:00", clean: 400, suspect: 38 },
  ];

  if (loading) return <div className="p-20 text-center text-gray-400 font-bold animate-pulse">Initializing Security Layers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Anti-Fraud Arsenal</h2>
          <p className="text-gray-500 mt-1">Multi-layer traffic purification and proxy detection engine.</p>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-[10px] font-black text-blue-600 animate-pulse uppercase tracking-[0.2em]">Syncing...</span>}
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <ShieldAlert className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold text-green-700 tracking-wider">NETWORK STATUS: SECURE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Core Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              Guard Settings
            </h3>
            
            <div className="space-y-6">
              {[
                { label: "Block VPN Traffic", key: "blockVpn" },
                { label: "Block Public Proxy", key: "blockProxy" },
                { label: "Block Data Centers", key: "blockDatacenter" },
                { label: "Block Search Bots", key: "blockBot" },
              ].map((item) => (
                <div key={item.key} className="flex justify-between items-center group cursor-pointer">
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{item.label}</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" className="sr-only peer" 
                      checked={(settings as any)[item.key]} 
                      onChange={e => handleUpdate({ ...settings, [item.key]: e.target.checked })}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-50">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-3 text-center">AI Confidence Threshold</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" className="flex-1 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                  min="50" max="100" 
                  value={settings.aiThreshold}
                  onChange={e => setSettings({ ...settings, aiThreshold: parseInt(e.target.value) })}
                  onMouseUp={() => handleUpdate(settings)}
                  onTouchEnd={() => handleUpdate(settings)}
                />
                <span className="text-sm font-bold text-blue-600 font-mono">{settings.aiThreshold}%</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center font-medium italic">Higher thresholds decrease false positives.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-xl shadow-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 fill-current" />
              <h4 className="font-bold">Real-time Stats</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-blue-100 italic text-xs">
                <span>Blocked IPs (24h)</span>
                <span className="font-bold text-white not-italic text-sm">14,291</span>
              </div>
              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[12%]" />
              </div>
              <p className="text-[10px] text-blue-100 leading-relaxed font-medium">
                Our AI model has successfully deflected 12% of total incoming traffic today based on fingerprint inconsistencies.
              </p>
            </div>
          </div>
        </div>

        {/* Traffic Chart */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Purification Analytics
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-gray-400">CLEAN TRAFFIC</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-xs font-bold text-gray-400">SUSPICIOUS NODES</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 700}}
                    cursor={{stroke: '#3b82f6', strokeWidth: 2}}
                  />
                  <Line type="monotone" dataKey="clean" stroke="#3b82f6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="suspect" stroke="#f87171" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-widest">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Live Alarm Stream
              </h3>
              <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">EXPORT INCIDENTS</button>
            </div>
            <div className="divide-y divide-gray-50 uppercase tracking-tighter font-mono text-[11px]">
              {[
                { ip: "45.182.19.4", type: "VPN_LEAK", country: "DE", time: "Just now" },
                { ip: "192.0.2.25", type: "DATACENTER_PROXY", country: "US", time: "2m ago" },
                { ip: "77.111.90.134", type: "HEADLESS_CHROME", country: "CN", time: "5m ago" },
                { ip: "103.21.244.0", type: "IP_SPOOFING", country: "IN", time: "12m ago" },
              ].map((log, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-6">
                    <span className="text-gray-400 font-bold">{log.time}</span>
                    <span className="text-gray-900 font-black">{log.ip}</span>
                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-black">{log.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-bold">{log.country}</span>
                    <Info className="w-3.5 h-3.5 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
