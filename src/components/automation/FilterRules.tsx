import React, { useState, useEffect } from "react";
import { Filter, Plus, ArrowUpDown, Shield, Globe, Monitor, Map, Trash2, Edit3, MoreHorizontal } from "lucide-react";
import { api } from "../../lib/api";

interface FilterRule {
  id: string;
  name: string;
  priority: number;
  criteria: any;
  action: string;
  status: string;
}

export default function FilterRules() {
  const [rules, setRules] = useState<FilterRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", priority: 10, action: "Allow", criteria: { geo: "ALL" } });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const { data } = await api.get("/api/automation/filters");
      setRules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    try {
      await api.post("/api/automation/filters", { ...newRule, status: "Active" });
      setShowAddModal(false);
      fetchRules();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Traffic Gatekeepers</h2>
          <p className="text-gray-500 mt-1">Conditional logic to filter or redirect traffic before it hits your campaigns.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-emerald-200"
        >
          <Plus className="w-4 h-4" />
          Add Filter Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: "IP Blacklist", value: "24,091", icon: Shield, color: "text-red-500", bg: "bg-red-50" },
           { label: "Blocked Countries", value: "14", icon: Globe, color: "text-blue-500", bg: "bg-blue-50" },
           { label: "Detected Proxy", value: "892", icon: Map, color: "text-amber-500", bg: "bg-amber-50" },
           { label: "Rules Active", value: rules.length || "0", icon: Filter, color: "text-emerald-500", bg: "bg-emerald-50" },
         ].map(stat => (
           <div key={stat.label} className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-xl font-black text-gray-900">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm mt-4">
        <div className="px-8 py-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
           <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-emerald-600" />
              Execution Priority Stack
           </h3>
           <div className="flex gap-2">
             <button className="text-[10px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50">IMPORT SET</button>
             <button className="text-[10px] font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50">REORDER ALL</button>
           </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-400">Loading your security stack...</div>
        ) : rules.length === 0 ? (
          <div className="p-16 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
               <Filter className="w-8 h-8 text-gray-300" />
             </div>
             <h4 className="font-bold text-gray-900 mb-2">No Filter Rules Defined</h4>
             <p className="text-sm text-gray-500">Add a rule to start prioritizing or blocking traffic based on specific criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-4">Priority</th>
                    <th className="px-8 py-4">Rule Identity</th>
                    <th className="px-8 py-4">Filter Criteria</th>
                    <th className="px-8 py-4">Operation</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rules.map((rule, idx) => (
                    <tr key={rule.id} className="hover:bg-emerald-50/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">
                           {rule.priority || idx + 1}
                        </div>
                      </td>
                      <td className="px-8 py-6 font-bold text-gray-900">{rule.name}</td>
                      <td className="px-8 py-6 font-medium text-xs text-gray-500 italic max-w-xs truncate">
                        {JSON.stringify(rule.criteria || {})}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                           rule.action === "Allow" ? "bg-green-100 text-green-700" : 
                           rule.action === "Block" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {rule.action}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold text-gray-700">{rule.status}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-gray-400 hover:text-emerald-600"><Edit3 className="w-4 h-4" /></button>
                            <button className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            <button className="text-gray-400 hover:text-gray-900"><MoreHorizontal className="w-4 h-4" /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
            <h4 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
               <Map className="w-5 h-5 text-emerald-600" />
               Regional Guard
            </h4>
            <div className="space-y-4">
               {['Mainland China', 'Nigeria', 'North Korea'].map(country => (
                 <div key={country} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 group hover:bg-white hover:border-emerald-200 transition-all cursor-pointer">
                    <span className="font-bold text-sm text-gray-700">{country}</span>
                    <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded group-hover:bg-red-500 group-hover:text-white transition-all">ALWAYS BLOCK</span>
                 </div>
               ))}
               <button className="w-full py-3 mt-2 border-2 border-dashed border-gray-100 rounded-xl text-xs font-black text-gray-300 hover:border-emerald-200 hover:text-emerald-500 transition-all uppercase tracking-widest">Add Exception</button>
            </div>
         </div>

         <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
            <h4 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
               <Monitor className="w-5 h-5 text-indigo-600" />
               Device Integrity
            </h4>
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <div>
                    <p className="font-extrabold text-sm text-gray-900">Block Emulators</p>
                    <p className="text-[10px] text-gray-400 font-bold">Prevents BlueStacks/Genymotion traffic.</p>
                  </div>
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" /></div>
               </div>
               <div className="flex justify-between items-center opacity-60">
                  <div>
                    <p className="font-extrabold text-sm text-gray-900">Block Jailbroken Devices</p>
                    <p className="text-[10px] text-gray-400 font-bold">Requires SDK level 0.14+</p>
                  </div>
                  <div className="w-10 h-5 bg-gray-200 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5" /></div>
               </div>
               <div className="flex justify-between items-center">
                  <div>
                    <p className="font-extrabold text-sm text-gray-900">Block Low Resolution</p>
                    <p className="text-[10px] text-gray-400 font-bold">Filters 0x0 or 1x1 pixel nodes.</p>
                  </div>
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" /></div>
               </div>
            </div>
         </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6">Define Traffic Node</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Rule Label</label>
                <input 
                  type="text" 
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-bold text-gray-700"
                  placeholder="e.g. Block US Proxy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Priority</label>
                  <input 
                    type="number" 
                    value={newRule.priority}
                    onChange={(e) => setNewRule({...newRule, priority: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-bold text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Operation</label>
                  <select 
                    value={newRule.action}
                    onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-bold text-gray-700"
                  >
                    <option>Allow</option>
                    <option>Block</option>
                    <option>Redirect</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors text-gray-600"
              >
                Dismiss
              </button>
              <button 
                onClick={handleAddRule}
                className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200"
              >
                Deploy Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
