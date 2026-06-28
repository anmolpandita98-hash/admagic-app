import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink,
  ChevronLeft,
  Settings,
  Link as LinkIcon,
  Copy,
  Target,
  Globe,
  Lock,
  Eye,
  ArrowLeft,
  Save,
  Trash2,
  Calendar,
  Clock,
  ChevronDown,
  Monitor,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import CampaignWizard from "./campaigns/CampaignWizard";

type ViewState = 'list' | 'create' | 'details';

export default function Campaigns() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Sync state with URL path
  const currentView: ViewState = location.pathname.includes('/create') ? 'create' : 
                                location.pathname.includes('/manage') ? 'list' : 'list';
  
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    advertiserId: "",
    objective: "CPA",
    vertical: "E-commerce",
    url: "",
    trackingMethod: "Postback",
    status: "Active",
    visibility: "Public",
    revenue: 0,
    payout: 0,
    budget_daily: 0,
    budget_total: 0,
    caps: { clicks: 0, conversions: 0 },
    targeting: {
      geos: [] as string[],
      devices: ["Desktop", "Mobile"],
      browsers: ["Chrome", "Firefox", "Safari"]
    },
    macros: { click_id: "{click_id}", p1: "{p1}", p2: "{p2}" }
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "campaigns"), where("createdBy", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qAdv = query(collection(db, "advertisers"), where("createdBy", "==", user.uid));
    getDocs(qAdv).then(snapshot => {
      setAdvertisers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify({
          ...formData,
          tracking_url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`
        })
      });

      if (!response.ok) throw new Error('Failed to deploy campaign node');
      
      navigate('/campaigns/manage');
      setFormData({
        title: "",
        advertiserId: "",
        objective: "CPA",
        vertical: "E-commerce",
        url: "",
        trackingMethod: "Postback",
        status: "Active",
        visibility: "Public",
        revenue: 0,
        payout: 0,
        budget_daily: 0,
        budget_total: 0,
        caps: { clicks: 0, conversions: 0 },
        targeting: {
          geos: [] as string[],
          devices: ["Desktop", "Mobile"],
          browsers: ["Chrome", "Firefox", "Safari"]
        },
        macros: { click_id: "{click_id}", p1: "{p1}", p2: "{p2}" }
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (currentView === 'create') {
    return <CampaignWizard onClose={() => navigate('/campaigns/manage')} />;
  }

  // List and Details views follow similar pattern...
  // Details view:
  if (selectedCampaign && !location.pathname.includes('/create')) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-white rounded-full transition-all">
              <ArrowLeft className="w-5 h-5 text-[#64748b]" />
            </button>
            <h2 className="text-2xl font-bold text-[#1e293b]">{selectedCampaign.title}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              selectedCampaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {selectedCampaign.status}
            </span>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary text-red-500 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" /> Archive
            </button>
            <button className="btn-primary">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="panel">
              <h3 className="panel-label mb-6">Campaign Strategy & Reach</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Vertical</p>
                  <p className="text-sm font-bold text-[#1e293b]">{selectedCampaign.vertical || 'E-commerce'}</p>
                </div>
                <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Targeting</p>
                  <p className="text-sm font-bold text-[#1e293b]">{selectedCampaign.targeting?.geos?.join(', ') || 'Global'}</p>
                </div>
                <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Rev / Event</p>
                  <p className="text-sm font-bold text-[#16a34a]">${selectedCampaign.revenue}</p>
                </div>
                <div className="p-4 bg-[#f8fafc] rounded-lg border border-[#f1f5f9]">
                  <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-1">Payout</p>
                  <p className="text-sm font-bold text-[#f97316]">${selectedCampaign.payout}</p>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="flex items-center justify-between mb-6">
                <h3 className="panel-label">Tracking Link Generator</h3>
                <span className="text-[10px] uppercase font-bold text-[#1ea4d9] bg-[#f0f9ff] px-2 py-0.5 rounded border border-[#1ea4d9]/20">S2S Enabled</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2 block">Partner Scope</label>
                  <select className="w-full border border-[#e2e8f0] rounded px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none bg-white">
                    <option>Global Master Tracking Link</option>
                    <option>Direct Attribution Link</option>
                  </select>
                </div>
                <div className="p-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg relative group overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-1 bg-[#1ea4d9]" />
                  <p className="text-[13px] font-mono text-[#1e293b] break-all leading-relaxed pr-10">
                    {window.location.origin}/api/track/click?cmp={selectedCampaign.id}&aff=[PUB_ID]
                  </p>
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white border border-[#e2e8f0] rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:text-[#1ea4d9] transform translate-x-4 group-hover:translate-x-0">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1ea4d9]/5 -mr-16 -mt-16 rounded-full" />
              <h3 className="panel-label mb-6">Real-Time Vitals</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-[#64748b] tracking-wide uppercase">Clicks</span>
                  </div>
                  <span className="text-lg font-bold text-[#1e293b]">{selectedCampaign.clicks || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-xs font-bold text-[#64748b] tracking-wide uppercase">Events</span>
                  </div>
                  <span className="text-lg font-bold text-[#1e293b]">{selectedCampaign.conversions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-[#64748b] tracking-wide uppercase">Net Profit</span>
                  </div>
                  <span className="text-xl font-bold text-[#16a34a]">${(selectedCampaign.revenue_total - selectedCampaign.payout_total).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="panel bg-[#f8fafc] border-dashed text-center py-10">
              <ShieldCheck className="w-10 h-10 text-[#94a3b8] mx-auto mb-4" />
              <p className="text-xs font-bold text-[#1e293b] uppercase tracking-wider mb-2">Campaign Intelligence</p>
              <p className="text-[11px] text-[#64748b] leading-relaxed">AI Agents are monitoring this campaign. Anomaly detection active for high fraud regions.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Campaign Management</h2>
          <p className="text-sm text-[#64748b]">Monitor, adjust, and cross-scale active performance directives.</p>
        </div>
        <button 
          onClick={() => navigate('/campaigns/create')}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Campaign
        </button>
      </div>

      <div className="panel !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input 
              type="text" 
              placeholder="Search campaigns by title..." 
              className="w-full bg-white border border-[#e2e8f0] rounded pl-10 pr-4 py-2 text-sm focus:border-[#1ea4d9] outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary !py-2 !px-4 flex items-center text-xs">
              <Filter className="w-3.5 h-3.5 mr-2" /> All Verticals
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="trackier-table">
            <thead>
              <tr>
                <th className="text-left">TITLE</th>
                <th className="text-center">OBJECTIVE</th>
                <th className="text-center">CLICKS</th>
                <th className="text-center">CONV.</th>
                <th className="text-center">REVENUE</th>
                <th className="text-center">PROFIT</th>
                <th className="text-center">STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map((camp, i) => (
                <tr key={camp.id} className="group hover:bg-[#f8fafc] transition-colors cursor-pointer" onClick={() => setSelectedCampaign(camp)}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1ea4d9] group-hover:underline">
                        {camp.title}
                      </span>
                      <span className="text-[10px] text-[#94a3b8] font-mono">ID: {camp.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 border border-[#e2e8f0] rounded bg-[#f8fafc] text-[#64748b] uppercase tracking-tighter">
                      {camp.objective}
                    </span>
                  </td>
                  <td className="text-center font-medium">{camp.clicks || 0}</td>
                  <td className="text-center font-medium">{camp.conversions || 0}</td>
                  <td className="text-center text-[#16a34a] font-bold">${camp.revenue}</td>
                  <td className="text-center font-bold text-[#1e293b]">${(camp.revenue - camp.payout).toFixed(2)}</td>
                  <td className="text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      camp.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      camp.status === 'Paused' ? 'bg-orange-100 text-orange-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="p-2 hover:bg-white border hover:border-[#e2e8f0] rounded-md text-[#64748b] transition-all opacity-0 group-hover:opacity-100">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-[#94a3b8] text-sm italic">
                    <div className="flex flex-col items-center">
                      <Target className="w-10 h-10 mb-4 opacity-20" />
                      No active directives found. Deploy your first campaign to initiate tracking.
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
