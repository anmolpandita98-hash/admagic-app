import React, { useState, useEffect } from "react";
import { Zap, Plus, Trash2, ArrowRight, Activity, Play, Pause, Cpu } from "lucide-react";
import { api } from "../../lib/api";

interface Workflow {
  id: string;
  name: string;
  condition: string;
  action: string;
  status: string;
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: "", condition: "ROI < 0%", action: "Pause Campaign", status: "Active" });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const { data } = await api.get("/api/automation/workflows");
      setWorkflows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkflow = async () => {
    try {
      await api.post("/api/automation/workflows", newWorkflow);
      setShowAddModal(false);
      fetchWorkflows();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Automation</h2>
          <p className="text-gray-500 mt-1">Design event-based sequences to manage your campaigns while you sleep.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4" />
          Create Trigger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full">
           <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-gray-400" />
              <h3 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Recommended Blueprints</h3>
           </div>
        </div>

        {[
          { title: "Smart Pause", desc: "If ROI < 0% for 3 hours, pause campaign and alert Slack.", icon: Pause, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "Dynamic Scaling", desc: "If CR > 5% on 1000 clicks, increase budget by 20%.", icon: Zap, color: "text-green-500", bg: "bg-green-50" },
          { title: "Offer Swap", desc: "If Offer A CR < Offer B CR, rotate weights to Offer B.", icon: Cpu, color: "text-blue-500", bg: "bg-blue-50" },
        ].map((tpl) => (
          <div key={tpl.title} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
            <div className={`w-12 h-12 ${tpl.bg} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <tpl.icon className={`w-6 h-6 ${tpl.color}`} />
            </div>
            <h4 className="font-extrabold text-gray-900 mb-2">{tpl.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium mb-6">{tpl.desc}</p>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
              <span>ACTIVATE TEMPLATE</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden mt-8 shadow-sm">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
               Current Active Logic
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">3 Rules Executing</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-400">Wait while we fetch your decision nodes...</div>
        ) : workflows.length === 0 ? (
           <div className="p-16 text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-indigo-200" />
              </div>
              <h4 className="font-black text-gray-900 mb-2">Silence in the Automation Engine</h4>
              <p className="text-sm text-gray-500 leading-relaxed">No custom workflows detected. Blueprints are a great way to start.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                 <tr>
                    <th className="px-8 py-5">Workflow Ident</th>
                    <th className="px-8 py-5">Logic Trigger</th>
                    <th className="px-8 py-5">System Action</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Ops</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {workflows.map((rule) => (
                   <tr key={rule.id} className="hover:bg-indigo-50/20 transition-colors cursor-pointer group">
                     <td className="px-8 py-6">
                       <span className="font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">{rule.name}</span>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                           <span className="text-xs font-bold text-gray-600 truncate max-w-[200px]">{rule.condition}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                           <span className="text-xs font-bold text-gray-600 truncate max-w-[200px]">{rule.action}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <Pause className="w-3 h-3 text-gray-400" />
                           <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider bg-gray-100 px-2 py-1 rounded-md">{rule.status}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors bg-white rounded-lg border border-gray-100"><Play className="w-4 h-4" /></button>
                           <button className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-lg border border-gray-100"><Trash2 className="w-4 h-4" /></button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
               <Cpu className="w-5 h-5 text-indigo-600" />
               New Decision Node
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Workflow Name</label>
                <input 
                  type="text" 
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-gray-700"
                  placeholder="e.g. ROI Protection Level 1"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">If Condition Matches</label>
                <select 
                  value={newWorkflow.condition}
                  onChange={(e) => setNewWorkflow({...newWorkflow, condition: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-gray-700"
                >
                  <option>ROI &lt; 0%</option>
                  <option>CR &lt; 1% (Last 1k clicks)</option>
                  <option>Spend &gt; $500 (Today)</option>
                  <option>Conversion Time &gt; 24h</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Then Execute</label>
                <select 
                  value={newWorkflow.action}
                  onChange={(e) => setNewWorkflow({...newWorkflow, action: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-bold text-gray-700"
                >
                  <option>Pause Campaign</option>
                  <option>Alert Slack/Email</option>
                  <option>Scale Up Budget (10%)</option>
                  <option>Swap to Secondary Offer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors text-gray-600"
              >
                Discard
              </button>
              <button 
                onClick={handleAddWorkflow}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
              >
                Save Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
