import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Search, 
  Mail, 
  Share2, 
  Smartphone, 
  Tv, 
  Layout, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink
} from "lucide-react";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";

const CHANNELS = [
  { 
    id: 'SEARCH', 
    label: 'Search Engine', 
    icon: Search, 
    desc: 'Bidding on keywords in Google, Bing, etc.',
    color: 'blue'
  },
  { 
    id: 'SOCIAL', 
    label: 'Social Media', 
    icon: Share2, 
    desc: 'Traffic from Facebook, Instagram, TikTok, LinkedIn.',
    color: 'pink'
  },
  { 
    id: 'EMAIL', 
    label: 'Email Marketing', 
    icon: Mail, 
    desc: 'Direct newsletters or solo email blasts.',
    color: 'orange'
  },
  { 
    id: 'NATIVE', 
    label: 'Native Ads', 
    icon: Layout, 
    desc: 'Discovery ads like Outbrain, Taboola or RevContent.',
    color: 'indigo'
  },
  { 
    id: 'PUSH', 
    label: 'Push / SMS', 
    icon: Globe, 
    desc: 'Direct notifications or text message traffic.',
    color: 'cyan'
  },
  { 
    id: 'APP', 
    label: 'In-App Display', 
    icon: Smartphone, 
    desc: 'Static or video banners inside mobile applications.',
    color: 'green'
  },
  { 
    id: 'INCENT', 
    label: 'Incentivized', 
    icon: Trophy, 
    desc: 'Reward-based traffic where users earn for clicks/actions.',
    color: 'amber'
  }
];

// Re-importing Trophy from lucide-react if needed, or using a fallback if it's missing from generic selection above
import { Trophy } from "lucide-react";

export default function TrafficChannels() {
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

  const toggleChannel = async (campId: string, channelId: string, current: string[] = []) => {
    const list = Array.isArray(current) ? current : [];
    const updated = list.includes(channelId)
      ? list.filter(c => c !== channelId)
      : [...list, channelId];
    
    try {
      await updateDoc(doc(db, "campaigns", campId), { allowed_traffic_channels: updated });
    } catch (e) {
      console.error("Failed to update channels:", e);
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
          <h2 className="text-2xl font-black text-[#1e293b] tracking-tight">ALLOWED TRAFFIC CHANNELS</h2>
          <p className="text-sm text-[#64748b] font-medium max-w-2xl mt-1">
            Trackier’s Allowed Traffic Channels tells publishers *where* they’re allowed to get traffic from. 
            This is a control layer protecting advertiser rules and improving traffic quality.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
           <ShieldCheck className="w-4 h-4 text-[#1ea4d9]" />
           <span className="text-[10px] font-black text-[#1ea4d9] uppercase tracking-widest">Enforcement Mode: ACTIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <div className="panel !p-0 overflow-hidden shadow-xl border-[#e2e8f0]">
          <div className="px-6 py-4 border-b border-[#e2e8f0] bg-white flex items-center justify-between">
            <h3 className="text-[11px] font-black text-[#1e293b] uppercase tracking-widest">Campaign Directive Matrix</h3>
            <div className="flex items-center space-x-4">
               <div className="flex items-center text-[10px] font-bold text-[#64748b]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-1" /> Approved
               </div>
               <div className="flex items-center text-[10px] font-bold text-[#64748b]">
                  <XCircle className="w-3.5 h-3.5 text-red-500 mr-1" /> Disallowed
               </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="px-6 py-4 text-left font-black text-[10px] text-[#64748b] uppercase tracking-widest w-72">Campaign Target</th>
                  {CHANNELS.map(c => (
                    <th key={c.id} className="px-4 py-4 text-center font-black text-[10px] text-[#64748b] uppercase tracking-widest min-w-[100px]">
                      <div className="flex flex-col items-center group cursor-help">
                        <c.icon className="w-4 h-4 mb-2 text-[#94a3b8]" />
                        {c.id}
                        <div className="hidden group-hover:block absolute bg-[#1e293b] text-white p-2 rounded text-[9px] normal-case mt-10 w-32 z-50 shadow-2xl">
                          {c.desc}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors">
                    <td className="px-6 py-6 font-black text-sm text-[#1e293b]">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#f1f5f9] flex items-center justify-center overflow-hidden border border-[#e2e8f0]">
                             {camp.thumbnail_url ? <img src={camp.thumbnail_url} className="w-full h-full object-cover" /> : <Megaphone className="w-4 h-4 text-[#94a3b8]" />}
                          </div>
                          <div className="flex flex-col">
                             <span>{camp.title}</span>
                             <span className="text-[9px] text-[#94a3b8] font-mono">{camp.id}</span>
                          </div>
                       </div>
                    </td>
                    {CHANNELS.map(c => {
                      const isAllowed = camp.allowed_traffic_channels?.includes(c.id);
                      return (
                        <td key={c.id} className="p-0">
                          <button 
                            onClick={() => toggleChannel(camp.id, c.id, camp.allowed_traffic_channels)}
                            className={`w-full h-full py-6 flex items-center justify-center transition-all ${
                              isAllowed 
                                ? 'bg-green-50/30 text-green-600 hover:bg-green-50' 
                                : 'text-[#cbd5e1] hover:text-[#1ea4d9] hover:bg-[#1ea4d9]/5'
                            }`}
                          >
                            {isAllowed 
                               ? <div className="p-1 bg-green-100 rounded-full animate-in zoom-in-50 duration-300"><CheckCircle2 className="w-5 h-5" /></div> 
                               : <XCircle className="w-5 h-5 opacity-30" />
                            }
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={CHANNELS.length + 1} className="py-20 text-center">
                      <div className="max-w-xs mx-auto space-y-3">
                         <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                         <p className="text-sm font-bold text-[#64748b]">No active directives found for this account.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
         <div className="panel bg-[#1ea4d9] border-none text-white shadow-lg shadow-blue-200">
            <h4 className="font-black text-lg mb-2">Publisher Visibility</h4>
            <p className="text-white/80 text-sm mb-6">These flags are shown directly to your publishers on their campaign detail pages, ensuring they know exactly which acquisition sources are permitted.</p>
            <div className="flex flex-wrap gap-2">
               {CHANNELS.slice(0, 4).map(c => (
                 <div key={c.id} className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center">
                   <c.icon className="w-3 h-3 mr-2" />
                   {c.label}
                 </div>
               ))}
            </div>
         </div>
         <div className="panel border-dashed border-2 bg-transparent">
            <h4 className="font-black text-lg text-[#1e293b] mb-2">Operational Enforcement</h4>
            <p className="text-[#64748b] text-sm mb-6 italic">Combined with targeting and fallback, you can route or block "waste traffic" that comes from disallowed channels via referrer checks.</p>
            <button className="text-[10px] font-black text-[#1ea4d9] uppercase tracking-widest flex items-center hover:underline">
               Learn about fallback routing
               <ExternalLink className="w-3 h-3 ml-2" />
            </button>
         </div>
      </div>
    </div>
  );
}

import { Megaphone } from "lucide-react";
