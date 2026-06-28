import React, { useState, useEffect } from "react";
import { History, Plus, Bell, Slack, Mail, ArrowRight, Zap, Target, MoreVertical, Trash2 } from "lucide-react";
import axios from "axios";

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlert, setNewAlert] = useState({ name: "", trigger: "if CR > 10%", channel: "Slack" });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await axios.get("/api/automation/alerts");
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = async () => {
    try {
      await axios.post("/api/automation/alerts", { ...newAlert, status: "Active" });
      setShowAddModal(false);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-time Performance Notifications</h2>
          <p className="text-gray-500 mt-1">Configure thresholds to get notified immediately when significant events occur.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-rose-100"
        >
          <Plus className="w-4 h-4" />
          Create Alert
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
               <Bell className="w-5 h-5 text-rose-500" />
               New Alert Logic
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Alert Profile</label>
                <input 
                  type="text" 
                  value={newAlert.name}
                  onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all font-bold text-gray-700"
                  placeholder="e.g. EPC Anomaly Detected"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Logic Trigger</label>
                <input 
                  type="text" 
                  value={newAlert.trigger}
                  onChange={(e) => setNewAlert({...newAlert, trigger: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all font-bold text-gray-700"
                  placeholder="e.g. if ROI < 5%"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Dispatch Through</label>
                <select 
                  value={newAlert.channel}
                  onChange={(e) => setNewAlert({...newAlert, channel: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all font-bold text-gray-700"
                >
                  <option>Slack</option>
                  <option>Mail (SMTP)</option>
                  <option>Webhook POST</option>
                  <option>SMS Node</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors text-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddAlert}
                className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-200"
              >
                Deploy Alert
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
               <h3 className="font-extrabold text-gray-900 mb-8 uppercase tracking-widest text-xs flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-500" />
                  Channel Connectors
               </h3>
               
               <div className="space-y-4">
                  {[
                    { name: "Slack", icon: Slack, status: "Connected", color: "text-purple-600", bg: "bg-purple-50" },
                    { name: "Email (SMTP)", icon: Mail, status: "Active", color: "text-blue-600", bg: "bg-blue-50" },
                    { name: "Webhooks", icon: Zap, status: "Not Configured", color: "text-gray-400", bg: "bg-gray-50" },
                  ].map(channel => (
                    <div key={channel.name} className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl group cursor-pointer hover:bg-white hover:border-rose-200 transition-all">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${channel.bg} ${channel.color} rounded-xl flex items-center justify-center`}>
                             <channel.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{channel.name}</p>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider leading-none mt-1">{channel.status}</p>
                          </div>
                       </div>
                       <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-500 transition-colors" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl shadow-gray-200">
               <div className="flex items-center gap-2 text-rose-500 mb-4">
                 <Bell className="w-5 h-5 fill-current" />
                 <span className="text-[10px] font-black uppercase tracking-widest">SYSTEM PULSE</span>
               </div>
               <h4 className="text-xl font-bold mb-4 italic">34 Alerts Dispatched</h4>
               <p className="text-sm text-gray-400 leading-relaxed font-medium mb-6">
                 Over the last 24 hours, your threshold rules have saved approximately 4 hours of manual monitoring.
               </p>
               <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest">View Dispatch History</button>
            </div>
         </div>

         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
               <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-gray-400" />
                    Active Alert Monitors
                  </h3>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
               </div>
               
               <div className="divide-y divide-gray-50">
                  {alerts.map(alert => (
                    <div key={alert.id} className="px-8 py-6 hover:bg-rose-50/10 transition-colors group cursor-pointer">
                       <div className="flex justify-between items-start">
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <h4 className="font-extrabold text-gray-900 group-hover:text-rose-600 transition-colors">{alert.name}</h4>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase ${
                                   alert.channel === "Slack" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                }`}>
                                   VIA {alert.channel}
                                </span>
                             </div>
                             <p className="text-xs font-bold text-gray-400 font-mono bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 mt-3 inline-block">
                                {alert.trigger}
                             </p>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               {alerts.length === 0 && (
                 <div className="p-20 text-center space-y-4">
                    <Bell className="w-12 h-12 text-gray-200 mx-auto" />
                    <p className="text-sm font-bold text-gray-400">Silence is golden, but alerts are smarter.</p>
                 </div>
               )}
            </div>

            <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
               <h4 className="font-extrabold text-gray-900 mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                 <Zap className="w-5 h-5 text-rose-500" />
                 Instant Trigger Templates
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Fraud Spike in GEO",
                    "Offer Link 404 Error",
                    "Significant EPC Drop",
                    "Unexpected Conversion Volume"
                  ].map(tpl => (
                    <button key={tpl} className="text-left p-4 bg-gray-50 border border-transparent hover:border-rose-300 hover:bg-white rounded-2xl transition-all group">
                       <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{tpl}</p>
                       <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">ONE-CLICK SETUP</p>
                    </button>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
