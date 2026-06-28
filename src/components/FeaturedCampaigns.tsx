import React, { useState, useEffect } from "react";
import { 
  Megaphone, 
  Star, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  ExternalLink,
  Zap,
  Layout,
  MousePointer2
} from "lucide-react";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export default function FeaturedCampaigns() {
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

  const toggleFeatured = async (campId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "campaigns", campId), { is_featured: !current });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Featured Campaigns</h2>
          <p className="text-sm text-[#64748b]">Promote high-yield directives to the publisher edge network.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {campaigns.filter(c => c.is_featured).map((camp) => (
          <div key={camp.id} className="panel bg-[#f0f9ff] border-[#1ea4d9] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3">
              <Star className="w-5 h-5 text-[#1ea4d9] fill-[#1ea4d9]" />
            </div>
            <div className="mb-4">
              <span className="text-[10px] font-bold text-[#1ea4d9] uppercase tracking-widest">{camp.vertical || 'E-commerce'}</span>
              <h4 className="text-sm font-bold text-[#1e293b] mt-1">{camp.title}</h4>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-[#64748b] font-bold uppercase">Net Profit</p>
                <p className="text-lg font-bold text-[#16a34a]">${(camp.revenue - camp.payout).toFixed(2)}</p>
              </div>
              <button 
                onClick={() => toggleFeatured(camp.id, true)}
                className="text-[10px] font-bold text-[#ef4444] uppercase hover:underline"
              >
                UNFEATURE
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="panel !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <h3 className="text-[11px] font-bold text-[#1e293b] uppercase tracking-widest">Global Directives Pool</h3>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input 
              type="text" 
              placeholder="Filter pool..." 
              className="w-full bg-white border border-[#e2e8f0] rounded pl-10 pr-4 py-2 text-sm focus:border-[#1ea4d9] outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="trackier-table">
            <thead>
              <tr>
                <th className="text-left font-mono text-[10px]">DIRECTIVE</th>
                <th className="text-center font-mono text-[10px]">CTR_EST</th>
                <th className="text-center font-mono text-[10px]">CR_TARGET</th>
                <th className="text-center font-mono text-[10px]">FEATURE_STATE</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[#f8fafc] group">
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded bg-white border border-[#f1f5f9] flex items-center justify-center ${camp.is_featured ? 'text-[#1ea4d9]' : 'text-[#94a3b8]'}`}>
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[#1e293b]">{camp.title}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="text-xs font-bold text-[#64748b]">2.4%</span>
                  </td>
                  <td className="text-center">
                    <span className="text-xs font-bold text-[#64748b]">0.85%</span>
                  </td>
                  <td className="text-center">
                    <button 
                      onClick={() => toggleFeatured(camp.id, !!camp.is_featured)}
                      className={`p-1.5 rounded-full transition-all ${
                        camp.is_featured ? 'text-[#1ea4d9] bg-[#f0f9ff]' : 'text-[#94a3b8] hover:text-[#1ea4d9]'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${camp.is_featured ? 'fill-[#1ea4d9]' : ''}`} />
                    </button>
                  </td>
                  <td className="text-right px-6">
                    <button className="text-[#1ea4d9] text-[10px] font-bold uppercase hover:underline flex items-center justify-end">
                      ANALYTICS <ExternalLink className="w-3 h-3 ml-1" />
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
