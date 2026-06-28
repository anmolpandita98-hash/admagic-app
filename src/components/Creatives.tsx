import React, { useState, useEffect } from "react";
import { 
  Image as ImageIcon, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Download, 
  Copy,
  Layout,
  Video,
  FileText,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";

export default function Creatives() {
  const { user } = useAuth();
  const [creatives, setCreatives] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('URL'); // URL or UPLOAD

  const [formData, setFormData] = useState({
    name: "",
    campaignId: "",
    type: "Banner",
    url: "",
    status: "Active"
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "creatives"), where("createdBy", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCreatives(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const qCamp = query(collection(db, "campaigns"), where("createdBy", "==", user.uid));
    getDocs(qCamp).then(snapshot => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddCreative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "creatives"), {
        ...formData,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setFormData({ name: "", campaignId: "", type: "Banner", url: "", status: "Active" });
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Video': return Video;
      case 'Native': return FileText;
      default: return ImageIcon;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Creatives Repository</h2>
          <p className="text-sm text-[#64748b]">Centralized management for banners, videos, and dynamic ad assets.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Upload Asset
        </button>
      </div>

      {showAdd && (
        <div className="panel border-[#1ea4d9] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[#1e293b]">Register Marketing Asset</h3>
            <button onClick={() => setShowAdd(false)} className="text-[#64748b] hover:text-[#1e293b]">✕</button>
          </div>
          
          <div className="flex gap-6 mb-8 border-b border-[#f1f5f9]">
             <button 
               onClick={() => setActiveTab('URL')}
               className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'URL' ? 'text-[#1ea4d9]' : 'text-[#94a3b8]'}`}
             >
                URL Metadata
                {activeTab === 'URL' && <motion.div layoutId="creativeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ea4d9]" />}
             </button>
             <button 
               onClick={() => setActiveTab('UPLOAD')}
               className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'UPLOAD' ? 'text-[#1ea4d9]' : 'text-[#94a3b8]'}`}
             >
                Digital Asset Upload
                {activeTab === 'UPLOAD' && <motion.div layoutId="creativeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1ea4d9]" />}
             </button>
          </div>

          <form onSubmit={handleAddCreative} className="space-y-6">
            {activeTab === 'URL' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <label className="panel-label block mb-1">Asset Name</label>
                  <input 
                    required type="text" 
                    className="w-full border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Summer Sale 728x90"
                  />
                </div>
                <div>
                  <label className="panel-label block mb-1">Type</label>
                  <select 
                    className="w-full border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none bg-white font-medium"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Banner">Image / Banner</option>
                    <option value="Video">Video Ad</option>
                    <option value="Native">Native Text</option>
                  </select>
                </div>
                <div>
                  <label className="panel-label block mb-1">Campaign (Optional)</label>
                  <select 
                    className="w-full border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none bg-white"
                    value={formData.campaignId}
                    onChange={e => setFormData({...formData, campaignId: e.target.value})}
                  >
                    <option value="">Agnostic Asset</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div className="md:col-span-4">
                  <label className="panel-label block mb-1">Asset URL (CDN Link)</label>
                  <div className="flex">
                    <span className="bg-[#f8fafc] border border-[#e2e8f0] border-r-0 px-3 py-2.5 text-xs text-[#94a3b8] flex items-center rounded-l-xl">https://</span>
                    <input 
                      required type="text" 
                      className="flex-1 border border-[#e2e8f0] rounded-r-xl px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none"
                      value={formData.url}
                      onChange={e => setFormData({...formData, url: e.target.value})}
                      placeholder="cdn.example.com/assets/banner_v1.jpg"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 bg-[#f8fafc] rounded-3xl border-2 border-dashed border-[#e2e8f0] text-center space-y-4">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Download className="w-6 h-6 text-[#1ea4d9]" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-black text-[#1e293b] uppercase tracking-widest">Select Files or Drag & Drop</p>
                    <p className="text-xs text-[#64748b]">Max file size: 50MB (Supports: MP4, JPEG, PNG, GIF, HTML5 Zip)</p>
                 </div>
                 <div className="flex justify-center gap-3">
                    <button type="button" className="btn-secondary !py-2">Browse Local</button>
                    <button type="button" className="btn-secondary !py-2">Cloud Storage</button>
                 </div>
              </div>
            )}

            <div className="flex justify-end">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={activeTab === 'UPLOAD'} // Only URL work for now
              >
                {activeTab === 'URL' ? 'Provision Creative' : 'Initialize Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {creatives.map((creative) => {
          const Icon = getIcon(creative.type);
          return (
            <div key={creative.id} className="panel !p-0 overflow-hidden group hover:border-[#1ea4d9] transition-all">
              <div className="aspect-video bg-[#f8fafc] flex items-center justify-center relative border-b border-[#f1f5f9]">
                {creative.url ? (
                  <img 
                    src={creative.url.startsWith('http') ? creative.url : `https://${creative.url}`} 
                    alt={creative.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "https://picsum.photos/seed/placeholder/400/225")}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Icon className="w-12 h-12 text-[#e2e8f0]" />
                )}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 bg-white shadow rounded-md hover:text-[#1ea4d9]"><Download className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 bg-white shadow rounded-md hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#1ea4d9] bg-[#f0f9ff] px-1.5 py-0.5 rounded border border-[#1ea4d9]/20 font-mono">
                    {creative.type.toUpperCase()}
                  </span>
                  <div className="flex items-center text-[#16a34a]">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    <span className="text-[10px] uppercase font-bold">{creative.status}</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-[#1e293b] mb-1 truncate">{creative.name}</h4>
                <p className="text-[10px] text-[#64748b] truncate mb-4">
                  {campaigns.find(c => c.id === creative.campaignId)?.title || "Global Asset"}
                </p>
                <div className="flex space-x-2">
                  <button className="flex-1 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded text-[10px] font-bold text-[#64748b] hover:text-[#1ea4d9] hover:bg-[#f0f9ff] transition-all flex items-center justify-center">
                    <Copy className="w-3 h-3 mr-1" /> CODE
                  </button>
                  <button className="flex-1 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded text-[10px] font-bold text-[#64748b] hover:text-[#1ea4d9] hover:bg-[#f0f9ff] transition-all flex items-center justify-center">
                    <ExternalLink className="w-3 h-3 mr-1" /> PREVIEW
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {creatives.length === 0 && !loading && (
          <div className="md:col-span-4 panel py-20 text-center text-[#94a3b8]">
            <ImageIcon className="w-12 h-12 text-[#e2e8f0] mx-auto mb-4" />
            <p className="text-sm italic">Asset vault is currently vacant. Syncing local creatives to regional edges.</p>
          </div>
        )}
      </div>
    </div>
  );
}
