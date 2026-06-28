import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Filter as FilterIcon, 
  Search, 
  ArrowUpRight, 
  MousePointer2, 
  CheckCircle2, 
  Eye,
  ChevronDown,
  FileBarChart,
  Star,
  Settings,
  MoreVertical,
  Zap,
  Clock,
  Globe,
  X,
  Plus,
  Check,
  ChevronRight,
  RefreshCcw,
  CalendarDays,
  MapPin,
  Smartphone,
  Info,
  Layers,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

// --- Constants ---

const DATE_PRESETS = [
  "Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Month", "Last Month", "This Year", "Custom Range"
];

const METRICS = [
  { id: "clicks", label: "Clicks", category: "Traffic" },
  { id: "gross_clicks", label: "Gross Clicks", category: "Traffic" },
  { id: "unique_clicks", label: "Unique Clicks", category: "Traffic" },
  { id: "rejected_clicks", label: "Rejected Clicks", category: "Traffic" },
  { id: "impressions", label: "Impressions", category: "Traffic" },
  { id: "rejected_impressions", label: "Rejected Impressions", category: "Traffic" },
  { id: "approved_conversions", label: "Approved Conversions", category: "Conversions" },
  { id: "pending_conversions", label: "Pending Conversions", category: "Conversions" },
  { id: "cancelled_conversions", label: "Cancelled Conversions", category: "Conversions" },
  { id: "rejected_conversions", label: "Rejected Conversions", category: "Conversions" },
  { id: "gross_conversions", label: "Gross Conversions", category: "Conversions" },
  { id: "revenue", label: "Revenue", category: "Financial" },
  { id: "payout", label: "Payout", category: "Financial" },
  { id: "profit", label: "Profit", category: "Financial" },
  { id: "epc", label: "EPC", category: "Financial" },
  { id: "ctr", label: "CTR (%)", category: "Calculated" },
  { id: "cr", label: "CR (%)", category: "Calculated" },
];

const DIMENSIONS = [
  { id: "campaign", label: "Campaign" },
  { id: "campaign_id", label: "Campaign ID" },
  { id: "publisher", label: "Publisher" },
  { id: "publisher_id", label: "Publisher ID" },
  { id: "advertiser", label: "Advertiser" },
  { id: "advertiser_id", label: "Advertiser ID" },
  { id: "goal", label: "Goal" },
  { id: "country", label: "Country (GEO)" },
  { id: "device", label: "Device" },
  { id: "os", label: "OS" },
  { id: "browser", label: "Browser" },
  { id: "hour", label: "Hour" },
  { id: "date", label: "Date" },
  { id: "month", label: "Month" },
  { id: "sub1", label: "Sub ID 1" },
  { id: "sub2", label: "Sub ID 2" },
];

const REPORT_TITLES: Record<string, string> = {
  campaign: "Campaigns Report",
  publisher: "Publishers Report",
  advertiser: "Advertisers Report",
  daily: "Daily Performance",
  goal: "Goals & Events",
  hourly: "Hourly Breakdown",
  subid: "SubID / Parameter Insights",
  cohort: "Cohort Retention",
  click: "Raw Click Log",
  conversion: "Conversion Record",
  impression: "Impression Log",
  additional: "Custom Intelligence"
};

// --- Components ---

function FilterModal({ isOpen, onClose, filters, setFilters, groupBy, setGroupBy, metrics, setMetrics }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="px-8 py-6 border-b border-[#f1f5f9] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#1ea4d9]/10 rounded-xl flex items-center justify-center">
                <FilterIcon className="w-5 h-5 text-[#1ea4d9]" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">Intelligence Configurator</h3>
                <p className="text-xs text-[#94a3b8] font-bold">Refine your data perspectives and reporting granularity</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-[#f8fafc] text-[#64748b] hover:text-[#1e293b] rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Section: Search & Additional */}
          <section>
             <div className="flex items-center gap-2 mb-6">
                <Search className="w-4 h-4 text-[#1ea4d9]" />
                <h4 className="text-[11px] font-black text-[#1e293b] uppercase tracking-widest">Search & Entity Filters</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Campaign', 'Publisher', 'Advertiser'].map((label) => (
                   <div key={label}>
                      <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest block mb-2">{label}</label>
                      <input 
                        type="text" 
                        placeholder={`Search ${label}...`}
                        className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm focus:border-[#1ea4d9] outline-none transition-all focus:bg-white"
                      />
                   </div>
                ))}
             </div>
          </section>

          {/* Section: Group By Dimensions */}
          <section>
             <div className="flex items-center gap-2 mb-6">
                <Layers className="w-4 h-4 text-[#1ea4d9]" />
                <h4 className="text-[11px] font-black text-[#1e293b] uppercase tracking-widest">Group By (Dimensions)</h4>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {DIMENSIONS.map((dim) => (
                  <label key={dim.id} className="flex items-center p-3 rounded-xl border border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer group transition-all">
                     <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={groupBy.includes(dim.id)}
                          onChange={(e) => {
                            if (e.target.checked) setGroupBy([...groupBy, dim.id]);
                            else setGroupBy(groupBy.filter((id: string) => id !== dim.id));
                          }}
                        />
                        <div className="w-5 h-5 border-2 border-[#e2e8f0] rounded-md peer-checked:bg-[#1ea4d9] peer-checked:border-[#1ea4d9] transition-all flex items-center justify-center">
                           <Check className="w-3 h-3 text-white" />
                        </div>
                     </div>
                     <span className="ml-3 text-xs font-bold text-[#475569] group-hover:text-[#1ea4d9]">{dim.label}</span>
                  </label>
                ))}
             </div>
          </section>

          {/* Section: Report Metrics */}
          <section>
             <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-4 h-4 text-[#1ea4d9]" />
                <h4 className="text-[11px] font-black text-[#1e293b] uppercase tracking-widest">Report Options (Metrics)</h4>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {METRICS.map((metric) => (
                  <label key={metric.id} className="flex items-center p-3 rounded-xl border border-[#f1f5f9] hover:bg-[#f8fafc] cursor-pointer group transition-all">
                     <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={metrics.includes(metric.id)}
                          onChange={(e) => {
                            if (e.target.checked) setMetrics([...metrics, metric.id]);
                            else setMetrics(metrics.filter((id: string) => id !== metric.id));
                          }}
                        />
                        <div className="w-5 h-5 border-2 border-[#e2e8f0] rounded-md peer-checked:bg-[#1ea4d9] peer-checked:border-[#1ea4d9] transition-all flex items-center justify-center">
                           <Check className="w-3 h-3 text-white" />
                        </div>
                     </div>
                     <div className="ml-3 flex flex-col">
                        <span className="text-xs font-bold text-[#475569] group-hover:text-[#1ea4d9]">{metric.label}</span>
                        <span className="text-[8px] font-black text-[#94a3b8] uppercase tracking-tighter">{metric.category}</span>
                     </div>
                  </label>
                ))}
             </div>
          </section>
        </div>

        <div className="p-8 border-t border-[#f1f5f9] bg-[#f8fafc] flex items-center justify-between shrink-0">
           <button className="text-[#94a3b8] font-black text-[10px] uppercase tracking-widest hover:text-[#1e293b]">Reset Configurator</button>
           <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-3 text-[11px] font-black text-[#64748b] uppercase tracking-widest hover:bg-white rounded-xl transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => {
                   // In a real app, this would trigger a query
                   onClose();
                }}
                className="bg-[#1ea4d9] text-white px-10 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2 hover:scale-105 transition-transform"
              >
                Assemble Intelligence
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function SaveReportModal({ isOpen, onClose, onSave }: any) {
  const [name, setName] = useState("");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl p-8">
        <h3 className="text-xl font-black text-[#1e293b] uppercase tracking-tight mb-2">Store Intelligence</h3>
        <p className="text-xs text-[#94a3b8] font-bold mb-6 uppercase tracking-widest">Pin this perspective to your vault</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest block mb-2">Report Alias</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Fraud Pipeline" 
              className="w-full border border-[#f1f5f9] bg-[#f8fafc] rounded-xl px-4 py-3 text-sm font-bold focus:border-[#1ea4d9] outline-none"
            />
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={onClose} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-[#64748b] hover:bg-[#f8fafc] rounded-xl transition-all">Cancel</button>
            <button 
              onClick={() => { onSave(name); setName(""); onClose(); }}
              className="flex-1 py-3 bg-[#1ea4d9] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all"
            >
              Pin View
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Reports() {
  const { type = "campaign" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState("Today");
  const [showSaved, setShowSaved] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Configuration State
  const [groupBy, setGroupBy] = useState<string[]>(["campaign"]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["clicks", "unique_clicks", "approved_conversions", "revenue", "payout", "profit", "cr"]);

  const [savedReports, setSavedReports] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "saved_reports"), where("createdBy", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSavedReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // Adjust defaults based on report type
  useEffect(() => {
    if (type === 'publisher') setGroupBy(['publisher']);
    if (type === 'advertiser') setGroupBy(['advertiser']);
    if (type === 'daily') setGroupBy(['date']);
    if (type === 'hourly') setGroupBy(['hour']);
    if (type === 'subid') setGroupBy(['sub1', 'sub2']);
    if (type === 'goal') setGroupBy(['goal']);
  }, [type]);

  const handleSaveReport = async (name: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "saved_reports"), {
        name,
        reportType: type,
        groupBy,
        metrics: selectedMetrics,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setShowSaved(true);
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };

  const MOCK_DATA = useMemo(() => {
     const base = [
        { campaign: "Dyson V15 Sweeps", campaign_id: "772", publisher: "AppNexus Direct", approved_conversions: 42, clicks: 1240, unique_clicks: 1100, revenue: 1240, payout: 850, profit: 390, cr: 3.38, impressions: 45000, rejected_clicks: 12, goal: "Registration", country: "US", device: "Desktop" },
        { campaign: "Hulu Subscription Plan", campaign_id: "812", publisher: "MGID UK", approved_conversions: 88, clicks: 5600, unique_clicks: 5200, revenue: 2100, payout: 1400, profit: 700, cr: 1.57, impressions: 210000, rejected_clicks: 45, goal: "Sale", country: "GB", device: "Mobile" },
        { campaign: "BetterHelp Therapy", campaign_id: "904", publisher: "PropellerAds", approved_conversions: 122, clicks: 880, unique_clicks: 860, revenue: 610, payout: 400, profit: 210, cr: 13.8, impressions: 12000, rejected_clicks: 2, goal: "Sign Up", country: "CA", device: "Tablet" },
        { campaign: "VPN Secure VPN+", campaign_id: "349", publisher: "MGID UK", approved_conversions: 15, clicks: 230, unique_clicks: 220, revenue: 90, payout: 45, profit: 45, cr: 6.52, impressions: 5600, rejected_clicks: 5, goal: "Install", country: "DE", device: "Mobile" },
     ];
     return base;
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-[#f1f5f9] shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <BarChart3 className="w-6 h-6 text-[#1ea4d9]" />
             <h2 className="text-2xl font-black text-[#1e293b] tracking-tight uppercase">{REPORT_TITLES[type] || "Reporting Engine"}</h2>
          </div>
          <p className="text-sm text-[#64748b] font-medium">Aggregating real-time performance data across your network nodes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Saved Reports Dropdown */}
          <div className="relative">
             <button 
               onClick={() => setShowSaved(!showSaved)}
               className={`flex items-center px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs font-black uppercase tracking-widest transition-all ${showSaved ? 'border-[#1ea4d9] text-[#1ea4d9]' : 'text-[#64748b] hover:text-[#1e293b]'}`}
             >
               <FileBarChart className="w-4 h-4 mr-2" />
               Saved Views
               <ChevronDown className="w-3 h-3 ml-2" />
             </button>
             <AnimatePresence>
                {showSaved && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute right-0 mt-3 w-80 bg-white border border-[#f1f5f9] shadow-2xl rounded-[24px] p-6 z-50 ring-1 ring-black/5"
                   >
                      <div className="flex items-center justify-between mb-4 border-b border-[#f8fafc] pb-3">
                         <div className="flex items-center gap-2">
                           <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                           <h4 className="text-[10px] uppercase font-black tracking-widest text-[#1e293b]">Intelligence Vault</h4>
                         </div>
                         <button onClick={() => setShowSaved(false)}><X className="w-4 h-4 text-[#94a3b8]" /></button>
                      </div>
                      <div className="space-y-1">
                         {savedReports.length > 0 ? savedReports.map((report) => (
                           <button key={report.id} className="w-full flex items-center justify-between p-3 hover:bg-[#f8fafc] rounded-xl group transition-all">
                              <div className="flex flex-col items-start px-1">
                                 <span className="text-xs font-black text-[#475569] group-hover:text-[#1ea4d9]">{report.name}</span>
                                 <span className="text-[8px] font-black text-[#94a3b8] uppercase mt-0.5">{report.reportType} report</span>
                              </div>
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#cbd5e1] group-hover:text-[#1ea4d9] transition-colors" />
                           </button>
                         )) : (
                           <p className="text-[10px] font-bold text-[#b4bac4] py-8 text-center uppercase tracking-widest">No saved views detected</p>
                         )}
                      </div>
                      <button 
                        onClick={() => { setShowSaveModal(true); setShowSaved(false); }}
                        className="w-full mt-6 py-3 border-2 border-dashed border-[#e2e8f0] rounded-xl text-[10px] font-black text-[#94a3b8] uppercase tracking-widest hover:border-[#1ea4d9] hover:text-[#1ea4d9] transition-all flex items-center justify-center gap-2 group"
                      >
                         <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                         Store Current Perspective
                      </button>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Configuration Trigger */}
          <button 
            onClick={() => setShowFilters(true)}
            className="flex items-center px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs font-black uppercase tracking-widest text-[#64748b] hover:text-[#1ea4d9] hover:border-[#1ea4d9] transition-all"
          >
            <FilterIcon className="w-4 h-4 mr-2" />
            Configurator
          </button>

          {/* Date Range Picker */}
          <div className="relative group">
             <button className="flex items-center px-4 py-2.5 bg-white border-2 border-[#1ea4d9] rounded-xl text-xs font-black uppercase tracking-widest text-[#1ea4d9] shadow-lg shadow-blue-50">
               <CalendarDays className="w-4 h-4 mr-2" />
               {dateRange}
               <ChevronDown className="w-3 h-3 ml-2" />
             </button>
             {/* Dropdown would go here in full implementation */}
          </div>

          <button className="bg-[#1e293b] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200 hover:scale-105 transition-transform">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Gross Impressions", val: "467.2M", icon: Eye, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Net Conversions", val: "12,904", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
          { label: "Aggregate Revenue", val: "$45,690", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Profit Margin", val: "32.4%", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((stat, i) => (
           <div key={i} className="panel hover:border-[#1ea4d9] transition-all">
              <div className="flex items-center justify-between mb-3">
                 <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">{stat.label}</span>
                 <div className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4" />
                 </div>
              </div>
              <div className="flex items-baseline gap-2">
                 <h3 className="text-2xl font-black text-[#1e293b]">{stat.val}</h3>
                 <span className="text-[10px] font-black text-green-500">+4.2%</span>
              </div>
           </div>
        ))}
      </div>

      {/* Main Table Interface */}
      <div className="panel !p-0 overflow-hidden shadow-2xl shadow-slate-100 border-[#f1f5f9]">
        <div className="px-8 py-5 border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]/50">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest">Live Engine</span>
              </div>
              <div className="h-4 w-px bg-[#e2e8f0]"></div>
              <div className="relative w-80">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                 <input 
                   type="text" 
                   placeholder="Global search insights..."
                   className="w-full bg-white border border-[#e2e8f0] rounded-xl pl-9 pr-4 py-2 text-xs focus:border-[#1ea4d9] outline-none transition-all focus:shadow-lg focus:shadow-blue-50"
                 />
              </div>
           </div>
           <div className="flex items-center gap-4">
              <button className="p-2 text-[#94a3b8] hover:text-[#1e293b] hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#e2e8f0]">
                 <RefreshCcw className="w-4 h-4" />
              </button>
              <button className="p-2 text-[#94a3b8] hover:text-[#1e293b] hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#e2e8f0]">
                 <Settings className="w-4 h-4" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
           <table className="trackier-table !border-0">
             <thead>
                <tr className="bg-[#f8fafc]">
                   {groupBy.map(id => (
                     <th key={id} className="text-left py-6 px-10">
                        <div className="flex items-center gap-1.5 group cursor-pointer">
                           <span className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest">{DIMENSIONS.find(d => d.id === id)?.label}</span>
                           <ChevronDown className="w-3 h-3 text-[#cbd5e1] group-hover:text-[#1ea4d9] transition-colors" />
                        </div>
                     </th>
                   ))}
                   {selectedMetrics.map(id => (
                     <th key={id} className={`text-center py-6 px-6`}>
                        <div className="flex flex-col items-center gap-0.5">
                           <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">{METRICS.find(m => m.id === id)?.label}</span>
                           <span className="text-[8px] font-black text-[#cbd5e1] uppercase tracking-tighter">{METRICS.find(m => m.id === id)?.category}</span>
                        </div>
                     </th>
                   ))}
                   <th className="px-10"></th>
                </tr>
             </thead>
             <tbody>
                {MOCK_DATA.map((row: any, i) => (
                  <tr key={i} className="group hover:bg-[#f0f9ff]/40 transition-all border-b border-[#f1f5f9] last:border-0 cursor-default">
                     {groupBy.map(id => (
                       <td key={id} className="py-5 px-10">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-blue-100 border border-[#1ea4d9]/30"></div>
                             <span className="text-xs font-black text-[#1e293b]">{row[id]}</span>
                          </div>
                       </td>
                     ))}
                     {selectedMetrics.map(id => {
                        const val = row[id];
                        const colorMap: any = {
                           approved_conversions: 'text-[#1e293b] font-black',
                           revenue: 'text-green-600 font-black',
                           payout: 'text-amber-600 font-bold',
                           profit: 'text-[#1ea4d9] font-black',
                           cr: 'text-[#64748b] italic'
                        };
                        return (
                          <td key={id} className={`text-center py-5 px-6 text-xs text-[#64748b] ${colorMap[id] || ''}`}>
                             {typeof val === 'number' ? (id.includes('revenue') || id.includes('payout') || id.includes('profit') ? `$${val.toFixed(2)}` : val.toLocaleString()) : val}
                             {id === 'cr' && '%'}
                          </td>
                        );
                     })}
                     <td className="px-10 text-right">
                        <button className="opacity-0 group-hover:opacity-100 ml-auto p-2 hover:bg-white rounded-lg border border-transparent hover:border-[#f1f5f9] text-[#94a3b8] hover:text-[#1ea4d9] transition-all">
                           <MoreVertical className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>
                ))}
             </tbody>
             <tfoot className="border-t border-[#e2e8f0]">
                <tr className="bg-[#f8fafc]/50">
                   <td colSpan={groupBy.length} className="py-6 px-10">
                      <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Aggregate Results (4 Entries)</span>
                   </td>
                   {selectedMetrics.map(id => {
                     const totalColor = id === 'profit' ? 'text-[#1ea4d9]' : (id.includes('revenue') ? 'text-green-600' : 'text-[#64748b]');
                     return (
                        <td key={id} className={`text-center py-6 px-6 text-[13px] font-black ${totalColor}`}>
                           {/* Simplified sums */}
                           { (id === 'approved_conversions' ? '267' : (id === 'revenue' ? '$4,050.00' : (id === 'profit' ? '$1,345.00' : '---')))}
                        </td>
                     );
                   })}
                   <td></td>
                </tr>
             </tfoot>
           </table>
        </div>
      </div>

      <SaveReportModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveReport}
      />
      <FilterModal 
        isOpen={showFilters} 
        onClose={() => setShowFilters(false)} 
        filters={{}} 
        setFilters={() => {}} 
        groupBy={groupBy} 
        setGroupBy={setGroupBy}
        metrics={selectedMetrics}
        setMetrics={setSelectedMetrics}
      />
    </div>
  );
}
