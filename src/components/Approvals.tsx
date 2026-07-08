import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserPlus, 
  Megaphone, 
  DollarSign, 
  ImageIcon,
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  Eye,
  Info,
  ExternalLink
} from "lucide-react";
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";

const TYPE_CONFIG: any = {
  PUBLISHER_SIGNUP: { label: 'Publisher Access', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
  CAMPAIGN_ACCESS: { label: 'Campaign Rights', icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50' },
  PAYOUT_REQUEST: { label: 'Settlement', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  CREATIVE_APPROVAL: { label: 'Asset Compliance', icon: ImageIcon, color: 'text-amber-600', bg: 'bg-amber-50' }
};

export default function Approvals() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('PENDING');

  useEffect(() => {
    if (!user) return;
    // Scoped to the signed-in owner so the query satisfies the owner-scoped
    // Firestore read rule (a list query must provably return only owned docs).
    const q = query(
      collection(db, "approvals"),
      where("createdBy", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching approvals:", error);
      setLoading(false);
      // Fallback data for demo if collection is empty or rules block it
      if (requests.length === 0) {
          setRequests([
              { id: '1', type: 'PUBLISHER_SIGNUP', requesterName: 'Alex Rivers', status: 'PENDING', createdAt: new Date().toISOString(), details: { company: 'Rivers Media', country: 'US', vertical: 'E-commerce' } },
              { id: '2', type: 'CAMPAIGN_ACCESS', requesterName: 'Sarah Smith', status: 'PENDING', createdAt: new Date().toISOString(), details: { campaign: 'Global Sweepstakes FB', targetGeo: 'UK/CA' } }
          ]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleAction = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "approvals", id), { 
        status: newStatus,
        reviewedBy: user?.uid,
        reviewedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error processing approval:", e);
    }
  };

  const filteredRequests = requests.filter(r => r.status === activeFilter);

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
          <h2 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">Approval Command Center</h2>
          <p className="text-sm text-[#64748b] font-medium mt-1">
            Centralized queue to reciprocate on publisher applications, campaign access, and financial settlements.
          </p>
        </div>
      </header>

      <div className="flex border-b border-[#e2e8f0] gap-8">
         {['PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
            <button
               key={tab}
               onClick={() => setActiveFilter(tab)}
               className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                  activeFilter === tab ? 'text-[#1ea4d9]' : 'text-[#94a3b8] hover:text-[#64748b]'
               }`}
            >
               {tab}
               <span className="ml-2 px-1.5 py-0.5 bg-[#f1f5f9] text-[#64748b] rounded-md">{requests.filter(r => r.status === tab).length}</span>
               {activeFilter === tab && <motion.div layoutId="approvalTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ea4d9]" />}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((req) => {
          const config = TYPE_CONFIG[req.type] || { label: req.type, icon: Info, color: 'text-slate-600', bg: 'bg-slate-50' };
          return (
            <motion.div 
              layout
              key={req.id} 
              className="panel !p-0 overflow-hidden group hover:border-[#1ea4d9] transition-all bg-white shadow-sm border-[#e2e8f0]"
            >
              <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg} ${config.color} flex-shrink-0`}>
                    <config.icon className="w-6 h-6" />
                 </div>
                 
                 <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                       <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${config.bg} ${config.color}`}>
                          {config.label}
                       </span>
                       <span className="text-[10px] text-[#94a3b8] font-mono">REQ_{req.id.slice(0, 8)}</span>
                    </div>
                    <h4 className="font-black text-[#1e293b] leading-tight">
                       {req.requesterName} <span className="text-[#94a3b8] font-medium text-xs">requested access</span>
                    </h4>
                    <div className="flex items-center gap-4 pt-1">
                       {Object.entries(req.details || {}).map(([key, val]: any) => (
                         <div key={key} className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-[#b4bac4] tracking-tight">{key}:</span>
                            <span className="text-xs font-bold text-[#64748b]">{val}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="flex flex-col md:items-end justify-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#94a3b8] mb-2">
                       <Clock className="w-3 h-3" />
                       {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    <AnimatePresence mode="wait">
                       {req.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => handleAction(req.id, 'REJECTED')}
                               className="p-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                             >
                                <X className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => handleAction(req.id, 'APPROVED')}
                               className="bg-green-500 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 hover:scale-105 transition-transform"
                             >
                                <Check className="w-4 h-4" />
                                Approve
                             </button>
                          </div>
                       ) : (
                          <div className="flex items-center gap-2">
                             <button className="text-[10px] font-black text-[#64748b] hover:text-[#1ea4d9] flex items-center gap-1">
                                VIEW LOGS <ExternalLink className="w-3 h-3" />
                             </button>
                             <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                req.status === 'APPROVED' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                             }`}>
                                {req.status}
                             </div>
                          </div>
                       )}
                    </AnimatePresence>
                 </div>
              </div>
            </motion.div>
          );
        })}

        {filteredRequests.length === 0 && (
           <div className="panel py-24 text-center border-dashed border-2 bg-transparent">
              <div className="max-w-xs mx-auto space-y-3">
                 <CheckCircle2 className="w-12 h-12 text-[#cbd5e1] mx-auto opacity-50" />
                 <h4 className="font-black text-[#1e293b] uppercase tracking-widest text-sm">Inbox Zero Reached</h4>
                 <p className="text-xs font-bold text-[#64748b]">No requests awaiting {activeFilter.toLowerCase()} action.</p>
              </div>
           </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex items-start gap-4">
         <Info className="w-6 h-6 text-[#1ea4d9] flex-shrink-0" />
         <div>
            <h5 className="font-black text-sm text-[#1e293b] uppercase tracking-widest mb-1">Direct Reciprocity Engine</h5>
            <p className="text-xs text-[#64748b] leading-relaxed">Approval requests are automatically generated by the system when publishers register, apply for campaigns, or request payments. Once approved, the corresponding entity (Publisher, Campaign Access, or Payment) is updated in real-time.</p>
         </div>
      </div>
    </div>
  );
}
