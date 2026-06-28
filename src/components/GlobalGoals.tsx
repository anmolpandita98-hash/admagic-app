import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Plus, 
  Search, 
  Settings, 
  CheckCircle2, 
  MoreVertical,
  Layers,
  Zap,
  DollarSign,
  Target,
  Globe,
  Lock,
  Eye,
  Trash2,
  Edit2,
  AlertCircle
} from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";

export default function GlobalGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    default_visibility: "PUBLIC"
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "goals"), where("createdBy", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching goals:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "goals"), {
        ...formData,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setFormData({ name: "", code: "", description: "", default_visibility: "PUBLIC" });
    } catch (e) {
      console.error("Error adding goal:", e);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!window.confirm("Are you sure you want to archive this global goal blueprint? This will not affect existing campaigns using this goal.")) return;
    try {
      await deleteDoc(doc(db, "goals", id));
    } catch (e) {
      console.error("Error deleting goal:", e);
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1ea4d9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">Global Goals Registry</h2>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            Standardize conversion naming and logic across campaigns. Reuse templates like INSTALL, REGISTRATION, or FTD.
          </p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-[#1ea4d9] text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center shadow-lg shadow-blue-100 hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5 mr-2" /> CREATE GLOBAL BLUEPRINT
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="panel border-[#1ea4d9] mb-6">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#f1f5f9]">
                <div className="flex items-center gap-2">
                   <Target className="w-5 h-5 text-[#1ea4d9]" />
                   <h3 className="font-black text-[#1e293b] uppercase tracking-widest text-sm">New Global Goal Blueprint</h3>
                </div>
                <button onClick={() => setShowAdd(false)} className="text-[#94a3b8] hover:text-[#1e293b]">✕</button>
              </div>
              <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest block mb-2">Goal Title</label>
                  <input 
                    required type="text" 
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:border-[#1ea4d9] focus:bg-white outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. First Deposit"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest block mb-2">Goal Code / Value</label>
                  <input 
                    required type="text" 
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:border-[#1ea4d9] focus:bg-white outline-none font-mono"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                    placeholder="deposit_FTD"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest block mb-2">Default Visibility</label>
                  <select 
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:border-[#1ea4d9] focus:bg-white outline-none"
                    value={formData.default_visibility}
                    onChange={e => setFormData({...formData, default_visibility: e.target.value})}
                  >
                    <option value="PUBLIC">Public (Visible to All)</option>
                    <option value="PRIVATE">Private (Internal Only)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest block mb-2">Internal Notes</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:border-[#1ea4d9] focus:bg-white outline-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Short description..."
                  />
                </div>
                <div className="lg:col-span-4 flex justify-end">
                  <button type="submit" className="bg-[#1e293b] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200">
                    Deploy Global Blueprint
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {goals.length === 0 ? (
        <div className="panel py-32 text-center bg-white border-2 border-dashed border-[#e2e8f0] rounded-[40px]">
           <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 bg-[#f1f5f9] rounded-full flex items-center justify-center mx-auto">
                 <Target className="w-10 h-10 text-[#cbd5e1]" />
              </div>
              <div className="space-y-2">
                 <h4 className="text-xl font-black text-[#1e293b]">No Global Blueprints Yet</h4>
                 <p className="text-[#64748b] text-sm">Global Goals let you define "what events" count as conversions across campaigns and how they’re paid and reported. Define your first one to get started.</p>
              </div>
              <button 
                onClick={() => setShowAdd(true)}
                className="text-[#1ea4d9] font-black text-xs uppercase tracking-widest hover:underline"
              >
                Create your first conversion event
              </button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <motion.div 
              layout
              key={goal.id} 
              className="panel group hover:border-[#1ea4d9] transition-all relative overflow-hidden bg-white shadow-sm hover:shadow-xl hover:shadow-blue-50"
            >
              <div className="absolute top-2 right-2 flex gap-1 transform translate-y-[-100%] group-hover:translate-y-0 transition-transform bg-white/90 backdrop-blur rounded-lg border border-[#e2e8f0] p-1 shadow-sm">
                 <button className="p-2 text-[#94a3b8] hover:text-[#1ea4d9] hover:bg-blue-50 rounded-md transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                 </button>
                 <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                 >
                    <Trash2 className="w-3.5 h-3.5" />
                 </button>
              </div>

              <div className="flex items-start space-x-4 mb-6">
                <div className={`p-4 rounded-2xl ${goal.default_visibility === 'PRIVATE' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-[#1ea4d9]'}`}>
                  {goal.default_visibility === 'PRIVATE' ? <Lock className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-black text-[#1e293b] text-lg leading-tight">{goal.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] font-mono text-[#64748b] bg-[#f8fafc] px-2 py-0.5 rounded border border-[#e2e8f0]">
                       {goal.code}
                     </span>
                     <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                       goal.default_visibility === 'PRIVATE' ? 'bg-slate-200 text-slate-500' : 'bg-green-100 text-green-700'
                     }`}>
                       {goal.default_visibility}
                     </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#64748b] font-medium mb-6 line-clamp-3 min-h-[48px]">
                {goal.description || "No extended metadata provided for this blueprint."}
              </p>

              <div className="pt-5 border-t border-[#f1f5f9] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                   <AlertCircle className="w-3.5 h-3.5 text-[#94a3b8]" />
                   <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest underline decoration-dotted">Blueprint Only</span>
                </div>
                <div className="flex gap-4">
                   <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-[#94a3b8] uppercase tracking-tighter">Usage</span>
                      <span className="text-xs font-black text-[#1e293b]">0 DIRECTIVES</span>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-[#1e293b] rounded-[32px] p-8 md:p-12 text-white overflow-hidden relative mt-12">
         <div className="relative z-10 max-w-3xl">
            <h3 className="text-2xl font-black mb-4">Why use Global Goals?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <h5 className="font-bold text-[#1ea4d9]">Standardize naming</h5>
                  <p className="text-xs text-white/70">Establish consistent event labels across your network to simplify analytics.</p>
               </div>
               <div className="space-y-2">
                  <h5 className="font-bold text-[#1ea4d9]">Multi-event funnels</h5>
                  <p className="text-xs text-white/70">Track more than just one conversion: install + registration + purchase.</p>
               </div>
               <div className="space-y-2">
                  <h5 className="font-bold text-[#1ea4d9]">Differential payouts</h5>
                  <p className="text-xs text-white/70">Scale revenue by paying differently for registration vs. subscriptions.</p>
               </div>
               <div className="space-y-2">
                  <h5 className="font-bold text-[#1ea4d9]">Automation ready</h5>
                  <p className="text-xs text-white/70">Once defined, goals can be used in Smart Links and Workflow Rules automatically.</p>
               </div>
            </div>
         </div>
         <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none">
            <Target className="w-full h-full transform translate-x-1/2 scale-150 rotate-12" />
         </div>
      </div>
    </div>
  );
}
