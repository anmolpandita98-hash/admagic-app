import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Unlock, 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldCheck, 
  MoreVertical,
  Globe,
  Eye,
  Settings
} from "lucide-react";
import { collection, query, where, onSnapshot, updateDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export default function CampaignAccess() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "campaigns"), where("createdBy", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const updateAccess = async (campId: string, type: string) => {
    try {
      await updateDoc(doc(db, "campaigns", campId), { visibility: type });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Campaign Access Control</h2>
          <p className="text-sm text-[#64748b]">Regulate publisher authorization and private offer visibility.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Public Proxies', count: campaigns.filter(c => c.visibility === 'Public').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Private Directives', count: campaigns.filter(c => c.visibility === 'Private').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Approvals', count: campaigns.filter(c => c.visibility === 'Ask for Permission').length, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className={`panel ${stat.bg} border-transparent flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            </div>
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <ShieldCheck className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="panel !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input 
              type="text" 
              placeholder="Search campaign scoping..." 
              className="w-full bg-white border border-[#e2e8f0] rounded pl-10 pr-4 py-2 text-sm focus:border-[#1ea4d9] outline-none"
            />
          </div>
          <button className="btn-secondary flex items-center">
            <Filter className="w-3.5 h-3.5 mr-2" /> All Clusters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="trackier-table">
            <thead>
              <tr>
                <th className="text-left font-mono text-[10px] uppercase">scope</th>
                <th className="text-center font-mono text-[10px] uppercase">authorizations</th>
                <th className="text-left font-mono text-[10px] uppercase">access_model</th>
                <th className="text-right font-mono text-[10px] uppercase">controls</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[#f8fafc] group">
                  <td className="font-bold text-[#1e293b]">{camp.title}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-[#94a3b8]" />
                      <span className="text-xs font-bold text-[#1e293b]">0 Partner(s)</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-3">
                      {[
                        { id: 'Public', icon: Globe },
                        { id: 'Private', icon: Lock },
                        { id: 'Ask for Permission', icon: Eye }
                      ].map((v) => (
                        <button 
                          key={v.id}
                          onClick={() => updateAccess(camp.id, v.id)}
                          title={v.id}
                          className={`p-1.5 rounded-md border transition-all ${
                            camp.visibility === v.id ? 'bg-[#1ea4d9] border-[#1ea4d9] text-white shadow-sm' : 'bg-white border-[#e2e8f0] text-[#94a3b8] hover:border-[#1ea4d9] hover:text-[#1ea4d9]'
                          }`}
                        >
                          <v.icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                      <span className="text-[10px] font-bold text-[#64748b] uppercase">{camp.visibility}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="text-[#1ea4d9] text-[10px] font-bold uppercase hover:underline">Manage Whitelist</button>
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
