import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle,
  Search,
  Filter
} from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";

const ROLES = [
  { id: 'ADMIN', label: 'Administrator', desc: 'Full system access and financial control.' },
  { id: 'MANAGER', label: 'Network Manager', desc: 'Manage campaigns, publishers and reports.' },
  { id: 'ACCOUNT_MANAGER', label: 'Account Manager', desc: 'Assigned to specific publishers/advertisers.' }
];

export default function TeamManagement() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "ACCOUNT_MANAGER"
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "team_members"), where("createdBy", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "team_members"), {
        ...formData,
        status: "INVITED",
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setFormData({ name: "", email: "", role: "ACCOUNT_MANAGER" });
    } catch (e) {
      console.error("Error inviting member:", e);
    }
  };

  const removeMember = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this team member? This will revoke their access immediately.")) return;
    try {
      await deleteDoc(doc(db, "team_members", id));
    } catch (e) {
      console.error("Error removing member:", e);
    }
  };

  const updateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "DISABLED" ? "ACTIVE" : "DISABLED";
    try {
      await updateDoc(doc(db, "team_members", id), { status: nextStatus });
    } catch (e) {
      console.error("Error updating status:", e);
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">Team Management</h2>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            Build your organization by inviting collaborators and defining specialized access roles.
          </p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-[#1ea4d9] text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center shadow-lg shadow-blue-100"
        >
          <UserPlus className="w-5 h-5 mr-2" /> INVITE COLLEAGUE
        </button>
      </header>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="panel border-[#1ea4d9] shadow-xl shadow-blue-50"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#f1f5f9]">
              <h3 className="font-black text-[#1e293b] uppercase tracking-widest text-sm">Send Collaboration Invite</h3>
              <button onClick={() => setShowAdd(false)} className="text-[#94a3b8] hover:text-[#1e293b]">✕</button>
            </div>
            <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest block mb-2">Colleague Name</label>
                <input 
                  required type="text" 
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:border-[#1ea4d9] focus:bg-white outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest block mb-2">Corporate Email</label>
                <input 
                  required type="email" 
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:border-[#1ea4d9] focus:bg-white outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="john@company.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest block mb-2">Access Role</label>
                <select 
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:border-[#1ea4d9] focus:bg-white outline-none"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  {ROLES.map(role => (
                    <option key={role.id} value={role.id}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="bg-[#1e293b] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest">
                  Dispatch Invite Email
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="panel !p-0 overflow-hidden shadow-sm border-[#e2e8f0]">
        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-white flex items-center justify-between">
           <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input 
                type="text" 
                placeholder="Search team..." 
                className="w-full pl-9 pr-4 py-1.5 text-xs border border-[#e2e8f0] rounded-lg focus:border-[#1ea4d9] outline-none"
              />
           </div>
           <button className="text-[10px] font-black text-[#64748b] uppercase tracking-widest flex items-center hover:text-[#1e293b]">
              <Filter className="w-3.5 h-3.5 mr-1" /> ALL ROLES
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th className="px-6 py-4 text-left font-black text-[10px] text-[#64748b] uppercase tracking-widest">Team Member</th>
                <th className="px-6 py-4 text-left font-black text-[10px] text-[#64748b] uppercase tracking-widest">Access Level</th>
                <th className="px-6 py-4 text-left font-black text-[10px] text-[#64748b] uppercase tracking-widest">Lifecycle Status</th>
                <th className="px-6 py-4 text-right font-black text-[10px] text-[#64748b] uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#1ea4d9]">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1e293b]">{member.name}</span>
                        <span className="text-[11px] text-[#64748b]">{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Shield className="w-3.5 h-3.5 text-amber-500" />
                       <span className="text-[11px] font-black text-[#1e293b] uppercase tracking-widest">{member.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                      member.status === 'INVITED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {member.status === 'INVITED' ? <Clock className="w-3 h-3 mr-1" /> : member.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {member.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => updateStatus(member.id, member.status)}
                         className="p-1 px-3 text-[10px] font-black text-[#64748b] hover:bg-white rounded-lg border border-transparent hover:border-[#e2e8f0]"
                       >
                         {member.status === 'DISABLED' ? 'ENABLE' : 'DISABLE'}
                       </button>
                       <button 
                         onClick={() => removeMember(member.id)}
                         className="p-1.5 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                   <td colSpan={4} className="py-20 text-center">
                      <div className="max-w-xs mx-auto space-y-3">
                         <AlertCircle className="w-10 h-10 text-[#cbd5e1] mx-auto" />
                         <p className="text-sm font-bold text-[#64748b]">No additional team members found.</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
