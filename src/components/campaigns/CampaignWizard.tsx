import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Zap, 
  Settings, 
  Target as TargetIcon, 
  Globe, 
  Lock, 
  Eye, 
  ArrowLeft, 
  Save, 
  Calendar, 
  Clock, 
  ChevronDown, 
  Monitor, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
  PlusCircle,
  X,
  ChevronRight,
  Upload,
  Link as LinkIcon,
  ShoppingBag,
  ListFilter
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface WizardProps {
  onClose: () => void;
}

export default function CampaignWizard({ onClose }: WizardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    advertiser_id: "",
    title: "",
    description: "",
    kpi_notes: "",
    campaign_url: "",
    advertiser_click_id_param: "p1",
    objective: "CONVERSIONS",
    preview_url: "",
    allowed_traffic_channels: [] as string[],
    primary_tracking_domain: "",
    require_terms: false,
    category_id: "",
    status: "ACTIVE",
    app_id: "",
    app_name: "",
    package_name: "",
    external_offer_id: "",
    thumbnail_url: "",

    // Step 2: Revenue, Payout & Goals
    revenue_method: "DEFAULT",
    currency: "USD",
    revenue: 0,
    payout: 0,
    geo_coverage: [] as string[],
    default_goal: { name: "Sale", is_public: true },
    additional_goals: [] as any[],

    // Step 3: Tracking & Settings
    redirect_type: "STANDARD_302",
    conversion_status_after_hold: "APPROVED",
    allowed_devices: ["MOBILE", "DESKTOP", "TABLET"],
    allowed_operating_systems: ["Android", "iOS", "Windows", "macOS"],
    deep_link_enabled: false,
    unsubscribe_url: "",

    // Step 4: Targeting Rules
    targeting_rules: [] as any[],

    // Step 5: Caps
    caps: [] as any[],

    // Step 6: Scheduling
    start_datetime: "",
    end_datetime: "",
    scheduled_status_changes: [] as any[],
    time_targeting: {
      timezone: "UTC",
      active_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      active_hours: [] as any[]
    },

    // Step 7: Creatives
    creatives: [] as any[]
  });

  useEffect(() => {
    if (!user) return;
    const qAdv = query(collection(db, "advertisers"), where("createdBy", "==", user.uid));
    getDocs(qAdv).then(snapshot => {
      setAdvertisers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, [user]);

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.uid
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create campaign');
      
      onClose();
      navigate('/campaigns/manage');
    } catch (e) {
      console.error(e);
      alert("Error creating campaign. Please check required fields.");
    }
  };

  const stepTitles = [
    "Basic Information",
    "Revenue, Payout & Goals",
    "Tracking & Campaign Settings",
    "Targeting Rules",
    "Caps (Limits)",
    "Scheduling & Time Targeting",
    "Creatives"
  ];

  return (
    <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#f1f5f9] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-[#1ea4d9] uppercase tracking-[0.2em]">Step {step} of {totalSteps}</span>
              <div className="h-1 w-32 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#1ea4d9] transition-all duration-500 ease-out" 
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
            <h2 className="text-2xl font-black text-[#1e293b] tracking-tight">{stepTitles[step-1]}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f8fafc] rounded-full transition-all">
            <X className="w-6 h-6 text-[#64748b]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#f8fafc]/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <BasicInfoStep formData={formData} setFormData={setFormData} advertisers={advertisers} />}
              {step === 2 && <RevenueGoalsStep formData={formData} setFormData={setFormData} />}
              {step === 3 && <TrackingSettingsStep formData={formData} setFormData={setFormData} />}
              {step === 4 && <TargetingRulesStep formData={formData} setFormData={setFormData} />}
              {step === 5 && <CapsStep formData={formData} setFormData={setFormData} />}
              {step === 6 && <SchedulingStep formData={formData} setFormData={setFormData} />}
              {step === 7 && <CreativesStep formData={formData} setFormData={setFormData} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-[#f1f5f9] flex items-center justify-between shrink-0 bg-white">
          <button 
            disabled={step === 1}
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[#64748b] hover:bg-[#f1f5f9] transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronDown className="w-5 h-5 rotate-90" />
            Previous
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-[#64748b] hover:bg-[#f1f5f9] transition-all"
            >
              Cancel
            </button>
            {step < totalSteps ? (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#1e293b] text-white font-black hover:bg-black transition-all shadow-lg shadow-slate-200"
              >
                Next Step
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#1ea4d9] text-white font-black hover:bg-[#158bb9] transition-all shadow-lg shadow-blue-200"
              >
                Deploy Campaign
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Basic Information
function BasicInfoStep({ formData, setFormData, advertisers }: any) {
  const navigate = useNavigate();
  const categories = ["E-commerce", "Finance", "Gaming", "Dating", "Health", "Software", "Crypto", "Entertainment"];
  const channels = ["Search", "Social", "Email", "In-App", "Native", "Incent", "Display", "Push"];

  const toggleChannel = (channel: string) => {
    const current = [...formData.allowed_traffic_channels];
    if (current.includes(channel)) {
      setFormData({ ...formData, allowed_traffic_channels: current.filter(c => c !== channel) });
    } else {
      setFormData({ ...formData, allowed_traffic_channels: [...current, channel] });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="input-group">
          <label className="label">Advertiser <span className="text-red-500">*</span></label>
          <select 
            required
            className="input"
            value={formData.advertiser_id}
            onChange={e => setFormData({ ...formData, advertiser_id: e.target.value })}
          >
            <option value="">Select Advertiser</option>
            {advertisers.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label className="label">Campaign Title <span className="text-red-500">*</span></label>
          <input 
            required type="text" className="input" placeholder="e.g. Summer Sale 2024"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label className="label">Default Landing URL <span className="text-red-500">*</span></label>
          <div className="flex">
            <span className="bg-[#f1f5f9] border border-[#e2e8f0] border-r-0 px-3 py-2.5 text-xs text-[#64748b] rounded-l flex items-center">https://</span>
            <input 
              required type="text" className="input rounded-l-none" placeholder="landing-page.com/offer"
              value={formData.campaign_url}
              onChange={e => setFormData({ ...formData, campaign_url: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">Click ID Param</label>
            <input 
              type="text" className="input" placeholder="p1"
              value={formData.advertiser_click_id_param}
              onChange={e => setFormData({ ...formData, advertiser_click_id_param: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label className="label">Objective</label>
            <select 
              className="input"
              value={formData.objective}
              onChange={e => setFormData({ ...formData, objective: e.target.value })}
            >
              <option value="CONVERSIONS">CPA (Conversions)</option>
              <option value="SALE">CPS (Sale / RevShare)</option>
              <option value="LEADS">CPL (Leads)</option>
              <option value="IMPRESSIONS">CPM (Impressions)</option>
              <option value="CLICKS">CPC (Clicks)</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="label">Description / Publisher Brief</label>
          <textarea 
            rows={3} className="input resize-none" placeholder="Provide details about the offer..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="input-group">
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Allowed Traffic Channels</label>
            <button 
              type="button"
              onClick={() => navigate('/campaigns/traffic-channels')}
              className="text-[10px] font-bold text-[#1ea4d9] hover:underline flex items-center"
            >
              <Settings className="w-3 h-3 mr-1" />
              DIRECTIVES
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {channels.map(c => (
              <button 
                key={c}
                type="button"
                onClick={() => toggleChannel(c)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                  formData.allowed_traffic_channels.includes(c) 
                    ? "bg-[#1ea4d9]/10 border-[#1ea4d9] text-[#1ea4d9]" 
                    : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="input-group">
            <label className="label">Category</label>
            <select 
              className="input"
              value={formData.category_id}
              onChange={e => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="label">Initial Status</label>
            <select 
              className="input font-bold"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="DELETED">Archive</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" className="w-4 h-4 rounded border-[#e2e8f0] text-[#1ea4d9] focus:ring-[#1ea4d9]"
              checked={formData.require_terms}
              onChange={e => setFormData({ ...formData, require_terms: e.target.checked })}
            />
            <span className="text-xs font-bold text-[#64748b] group-hover:text-[#1e293b] transition-colors">Require T&Cs acceptance before running</span>
          </label>
        </div>

        <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0] space-y-4">
          <h4 className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">Metadata / App Info</h4>
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" className="input text-xs" placeholder="App ID" 
              value={formData.app_id}
              onChange={e => setFormData({ ...formData, app_id: e.target.value })}
            />
            <input 
              type="text" className="input text-xs" placeholder="Package Name" 
              value={formData.package_name}
              onChange={e => setFormData({ ...formData, package_name: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Revenue, Payout & Goals
function RevenueGoalsStep({ formData, setFormData }: any) {
  const navigate = useNavigate();
  const addGoal = () => {
    setFormData({
      ...formData,
      additional_goals: [...formData.additional_goals, { title: "", type: "private", payout: 0, revenue: 0 }]
    });
  };

  const removeGoal = (index: number) => {
    const goals = [...formData.additional_goals];
    goals.splice(index, 1);
    setFormData({ ...formData, additional_goals: goals });
  };

  const updateGoal = (index: number, field: string, value: any) => {
    const goals = [...formData.additional_goals];
    goals[index] = { ...goals[index], [field]: value };
    setFormData({ ...formData, additional_goals: goals });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="input-group">
          <label className="label">Revenue Method</label>
          <select 
            className="input"
            value={formData.revenue_method}
            onChange={e => setFormData({ ...formData, revenue_method: e.target.value })}
          >
            <option value="DEFAULT">Standard (Flat/RevShare)</option>
            <option value="TIER_BASED">Tier Based</option>
          </select>
        </div>
        <div className="input-group">
          <label className="label">Currency</label>
          <select 
            className="input"
            value={formData.currency}
            onChange={e => setFormData({ ...formData, currency: e.target.value })}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>
        <div className="input-group">
          <label className="label">Geo Coverage (Whitelist)</label>
          <input 
            type="text" className="input" placeholder="IN, US, UK, DE"
            value={formData.geo_coverage.join(", ")}
            onChange={e => setFormData({ ...formData, geo_coverage: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-[#1e293b]">Payout & Goals Configuration</h3>
            <button 
              type="button"
              onClick={() => navigate('/campaigns/global-goals')}
              className="text-[10px] font-bold text-[#1ea4d9] hover:underline flex items-center"
            >
              <TargetIcon className="w-3 h-3 mr-1" />
              GLOBAL GOALS
            </button>
          </div>
          <button 
            type="button" onClick={addGoal}
            className="flex items-center gap-2 text-xs font-bold text-[#1ea4d9] hover:bg-[#1ea4d9]/10 px-3 py-1.5 rounded-lg transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Goal
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Default Goal */}
          <div className="grid grid-cols-4 gap-4 items-end bg-[#f1f5f9]/40 p-4 rounded-2xl border border-dashed border-[#cbd5e1]">
            <div className="col-span-1">
              <label className="label opacity-50 text-[9px]">DEFAULT GOAL</label>
              <input 
                type="text" className="input bg-white" placeholder="e.g. Install"
                value={formData.default_goal.name}
                onChange={e => setFormData({...formData, default_goal: {...formData.default_goal, name: e.target.value}})}
              />
            </div>
            <div>
              <label className="label opacity-50 text-[9px]">REV (FROM ADV)</label>
              <input 
                type="number" className="input bg-white" 
                value={formData.revenue}
                onChange={e => setFormData({...formData, revenue: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="label opacity-50 text-[9px]">PAYOUT (TO PUB)</label>
              <input 
                type="number" className="input bg-white border-[#1ea4d9]" 
                value={formData.payout}
                onChange={e => setFormData({...formData, payout: parseFloat(e.target.value)})}
              />
            </div>
            <div className="flex items-center gap-2 p-2">
               <input type="checkbox" checked={formData.default_goal.is_public} onChange={e => setFormData({...formData, default_goal: {...formData.default_goal, is_public: e.target.checked}})} />
               <span className="text-[10px] font-bold text-[#64748b]">Public</span>
            </div>
          </div>

          {/* Additional Goals */}
          {formData.additional_goals.map((goal: any, index: number) => (
            <div key={index} className="grid grid-cols-5 gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="col-span-1">
                <input 
                  type="text" className="input" placeholder="e.g. Registration"
                  value={goal.title}
                  onChange={e => updateGoal(index, 'title', e.target.value)}
                />
              </div>
              <div>
                <input 
                  type="number" className="input" placeholder="Revenue"
                  value={goal.revenue}
                  onChange={e => updateGoal(index, 'revenue', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <input 
                  type="number" className="input" placeholder="Payout"
                  value={goal.payout}
                  onChange={e => updateGoal(index, 'payout', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <select 
                  className="input text-xs"
                  value={goal.type}
                  onChange={e => updateGoal(index, 'type', e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <button 
                onClick={() => removeGoal(index)}
                className="p-2.5 text-[#f87171] hover:bg-[#fef2f2] rounded-xl transition-all w-fit"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 3: Tracking & Settings
function TrackingSettingsStep({ formData, setFormData }: any) {
  const devices = ["MOBILE", "DESKTOP", "TABLET"];
  const osList = ["Android", "iOS", "Windows", "macOS", "Linux", "Chrome OS"];

  const toggleItem = (list: string[], item: string, field: string) => {
    const current = [...list];
    if (current.includes(item)) {
      setFormData({ ...formData, [field]: current.filter(i => i !== item) });
    } else {
      setFormData({ ...formData, [field]: [...current, item] });
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="input-group">
            <label className="label">Redirect Mode</label>
            <select 
              className="input"
              value={formData.redirect_type}
              onChange={e => setFormData({ ...formData, redirect_type: e.target.value })}
            >
              <option value="STANDARD_302">Standard (HTTP 302)</option>
              <option value="REDIRECT_200">Meta/FB Compatible (HTTP 200)</option>
              <option value="REDIRECT_200_HIDE_REFERRER">Privacy Focused (Hide Referrer)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="label">Allowed Devices</label>
            <div className="flex gap-2">
              {devices.map(d => (
                <button 
                  key={d}
                  onClick={() => toggleItem(formData.allowed_devices, d, 'allowed_devices')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                    formData.allowed_devices.includes(d)
                      ? "bg-[#1ea4d9]/10 border-[#1ea4d9] text-[#1ea4d9]"
                      : "bg-white border-[#e2e8e0] text-[#64748b] hover:border-[#cbd5e1]"
                  }`}
                >
                  {d === "MOBILE" && <Smartphone className="w-5 h-5" />}
                  {d === "DESKTOP" && <Monitor className="w-5 h-5" />}
                  {d === "TABLET" && <Smartphone className="w-6 h-6 rotate-90" />}
                  <span className="text-[10px] font-black">{d}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="label">Deep Linking</label>
            <div className="flex items-center justify-between p-4 bg-white border border-[#e2e8f0] rounded-2xl">
              <div>
                <p className="text-sm font-bold text-[#1e293b]">Enable In-App Routing</p>
                <p className="text-[10px] text-[#64748b] font-medium">Allow publishers to append deep link paths.</p>
              </div>
              <div 
                onClick={() => setFormData({ ...formData, deep_link_enabled: !formData.deep_link_enabled })}
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${formData.deep_link_enabled ? "bg-[#1ea4d9]" : "bg-[#e2e8f0]"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-all ${formData.deep_link_enabled ? "translate-x-6" : ""}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="input-group">
            <label className="label">Operating Systems</label>
            <div className="grid grid-cols-2 gap-2">
              {osList.map(os => (
                <button 
                  key={os}
                  onClick={() => toggleItem(formData.allowed_operating_systems, os, 'allowed_operating_systems')}
                  className={`text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                    formData.allowed_operating_systems.includes(os) 
                      ? "bg-[#1ea4d9]/10 border-[#1ea4d9] text-[#1ea4d9]" 
                      : "bg-white border-[#e2e8f0] text-[#64748b]"
                  }`}
                >
                  {os}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="label">Unsubscribe URL (Email Ops)</label>
            <input 
              type="text" className="input" placeholder="your-app.com/opt-out"
              value={formData.unsubscribe_url}
              onChange={e => setFormData({ ...formData, unsubscribe_url: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Targeting Rules
function TargetingRulesStep({ formData, setFormData }: any) {
  const variables = [
    "COUNTRY", "REGION", "CITY", "DEVICE", "OS", "BROWSER", "SOURCE", "CREATIVE_NAME", "SALE_AMOUNT", 
    "P1", "P2", "P3", "P4", "P5", "P10"
  ];

  const addBlock = () => {
    setFormData({
      ...formData,
      targeting_rules: [
        ...formData.targeting_rules, 
        { id: Math.random().toString(36).substr(2, 9), name: `Block ${formData.targeting_rules.length + 1}`, condition: "AND", rules: [] }
      ]
    });
  };

  const addRuleToBlock = (blockId: string) => {
    const updated = formData.targeting_rules.map((b: any) => {
      if (b.id === blockId) {
        return { ...b, rules: [...b.rules, { variable: "COUNTRY", logic: "ALLOW", value: "" }] };
      }
      return b;
    });
    setFormData({ ...formData, targeting_rules: updated });
  };

  const removeBlock = (blockId: string) => {
    setFormData({ ...formData, targeting_rules: formData.targeting_rules.filter((b: any) => b.id !== blockId) });
  };

  const updateRule = (blockId: string, ruleIndex: number, field: string, value: any) => {
    const updated = formData.targeting_rules.map((b: any) => {
      if (b.id === blockId) {
        const rules = [...b.rules];
        rules[ruleIndex] = { ...rules[ruleIndex], [field]: value };
        return { ...b, rules };
      }
      return b;
    });
    setFormData({ ...formData, targeting_rules: updated });
  };

  const removeRule = (blockId: string, ruleIndex: number) => {
    const updated = formData.targeting_rules.map((b: any) => {
      if (b.id === blockId) {
        const rules = [...b.rules];
        rules.splice(ruleIndex, 1);
        return { ...b, rules };
      }
      return b;
    });
    setFormData({ ...formData, targeting_rules: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-[#e2e8f0] shadow-sm">
        <div>
          <h4 className="font-bold text-[#1e293b]">Advanced Logic Builder</h4>
          <p className="text-xs text-[#64748b] font-medium">Create complex targeting layers with nested conditions.</p>
        </div>
        <button 
          onClick={addBlock}
          className="bg-[#1e293b] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Rule Block
        </button>
      </div>

      <div className="space-y-8">
        {formData.targeting_rules.map((block: any) => (
          <div key={block.id} className="bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden shadow-sm animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <input 
                  type="text" className="bg-transparent font-black text-[#1e293b] text-sm focus:outline-none w-32" 
                  value={block.name}
                  onChange={e => {
                    const updated = formData.targeting_rules.map((b: any) => b.id === block.id ? {...b, name: e.target.value} : b);
                    setFormData({...formData, targeting_rules: updated});
                  }}
                />
                <select 
                  className="bg-[#1ea4d9]/10 text-[#1ea4d9] font-black text-[10px] px-2 py-1 rounded focus:outline-none uppercase tracking-widest"
                  value={block.condition}
                  onChange={e => {
                    const updated = formData.targeting_rules.map((b: any) => b.id === block.id ? {...b, condition: e.target.value} : b);
                    setFormData({...formData, targeting_rules: updated});
                  }}
                >
                  <option>AND</option>
                  <option>OR</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => addRuleToBlock(block.id)} className="p-1.5 hover:bg-[#1ea4d9]/10 rounded-lg transition-all text-[#1ea4d9]"><Plus className="w-4 h-4" /></button>
                <button onClick={() => removeBlock(block.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-all text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {block.rules.length === 0 ? (
                <div className="text-center py-8 text-[#94a3b8] text-xs font-medium border-2 border-dashed border-[#f1f5f9] rounded-2xl italic">
                  No targeting rules in this block yet. Click (+) to add.
                </div>
              ) : (
                block.rules.map((rule: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-center animate-in slide-in-from-left-2 duration-300">
                    <select 
                      className="input flex-[1.5] py-2 text-xs"
                      value={rule.variable}
                      onChange={e => updateRule(block.id, idx, 'variable', e.target.value)}
                    >
                      {variables.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <select 
                      className="input flex-1 py-2 text-xs bg-gray-50 font-bold"
                      value={rule.logic}
                      onChange={e => updateRule(block.id, idx, 'logic', e.target.value)}
                    >
                      <option value="ALLOW">Allow</option>
                      <option value="DENY">Deny</option>
                    </select>
                    <input 
                      type="text" className="input flex-[2] py-2 text-xs" placeholder="e.g. IN, US"
                      value={rule.value}
                      onChange={e => updateRule(block.id, idx, 'value', e.target.value)}
                    />
                    <button onClick={() => removeRule(block.id, idx)} className="p-2 text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
        {formData.targeting_rules.length === 0 && (
           <div className="p-20 text-center space-y-4 opacity-40">
              <TargetIcon className="w-16 h-16 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-400">Targeting link to all traffic by default.</p>
           </div>
        )}
      </div>
    </div>
  );
}

// Step 5: Caps (Limits)
function CapsStep({ formData, setFormData }: any) {
  const capTypes = ["GROSS_CONVERSIONS", "APPROVED_CONVERSIONS", "PAYOUT", "GROSS_REVENUE", "GROSS_CLICKS", "PENDING_PAYOUT", "PENDING_REVENUE"];
  const scopes = ["CAMPAIGN", "PUBLISHER", "GROUP", "GEO"];
  const timeframes = ["DAILY", "MONTHLY", "LIFETIME"];

  const addCap = () => {
    setFormData({
      ...formData,
      caps: [...formData.caps, { type: "GROSS_CONVERSIONS", scope: "CAMPAIGN", timeframe: "DAILY", value: 100, timezone: "UTC", over_delivery: false }]
    });
  };

  const removeCap = (idx: number) => {
    const updated = [...formData.caps];
    updated.splice(idx, 1);
    setFormData({ ...formData, caps: updated });
  };

  const updateCap = (idx: number, field: string, value: any) => {
    const updated = [...formData.caps];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData({ ...formData, caps: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-sm font-black text-[#1e293b] uppercase tracking-widest">Enforcement Caps</h4>
        <button 
          onClick={addCap}
          className="flex items-center gap-2 bg-[#1ea4d9] text-white px-4 py-2 rounded-xl text-xs font-bold"
        >
          <PlusCircle className="w-4 h-4" />
          Add Limitation
        </button>
      </div>

      <div className="space-y-4">
        {formData.caps.map((cap: any, idx: number) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-[#e2e8f0] shadow-sm relative group overflow-hidden transition-all hover:border-[#1ea4d9]/50">
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => removeCap(idx)} className="text-red-400 hover:bg-red-50 p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
              <div className="input-group">
                <label className="label text-[9px] opacity-60">CAP CATEGORY</label>
                <select className="input text-xs" value={cap.type} onChange={e => updateCap(idx, 'type', e.target.value)}>
                   {capTypes.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="label text-[9px] opacity-60">TIME WINDOW</label>
                <select className="input text-xs" value={cap.timeframe} onChange={e => updateCap(idx, 'timeframe', e.target.value)}>
                   {timeframes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group col-span-1 md:col-span-2 lg:col-span-1">
                <label className="label text-[9px] opacity-60">LIMIT VALUE</label>
                <input type="number" className="input text-xs font-bold" value={cap.value} onChange={e => updateCap(idx, 'value', parseFloat(e.target.value))} />
              </div>
              <div className="input-group">
                <label className="label text-[9px] opacity-60">ENFORCEMENT SCOPE</label>
                <select className="input text-xs" value={cap.scope} onChange={e => updateCap(idx, 'scope', e.target.value)}>
                   {scopes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 pb-2">
                 <input type="checkbox" checked={cap.over_delivery} onChange={e => updateCap(idx, 'over_delivery', e.target.checked)} />
                 <span className="text-[10px] font-bold text-[#64748b]">Allow Over-delivery</span>
              </div>
            </div>
            
            <div className="mt-4 flex gap-4">
              <div className="flex-1">
                <input type="text" className="input text-[10px] py-2 bg-gray-50 border-dashed" placeholder="Redirect URL after cap reached (optional)" value={cap.redirect_url || ""} onChange={e => updateCap(idx, 'redirect_url', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        {formData.caps.length === 0 && (
           <div className="p-20 text-center bg-white rounded-3xl border border-[#e2e8f0] opacity-40">
              <ShieldCheck className="w-12 h-12 mx-auto text-[#94a3b8] mb-4" />
              <p className="text-sm font-bold text-gray-400 italic">No hard caps defined. Campaign will run indefinitely.</p>
           </div>
        )}
      </div>
    </div>
  );
}

// Step 6: Scheduling
function SchedulingStep({ formData, setFormData }: any) {
  const toggleHour = (hour: number) => {
    const current = [...formData.time_targeting.active_hours];
    if (current.includes(hour)) {
      setFormData({
        ...formData,
        time_targeting: {
          ...formData.time_targeting,
          active_hours: current.filter(h => h !== hour)
        }
      });
    } else {
      setFormData({
        ...formData,
        time_targeting: {
          ...formData.time_targeting,
          active_hours: [...current, hour]
        }
      });
    }
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h4 className="text-sm font-black text-[#1e293b] uppercase tracking-widest border-b border-[#f1f5f9] pb-4">Activity Window</h4>
          <div className="input-group">
            <label className="label">Start Date & Time</label>
            <input 
              type="datetime-local" className="input" 
              value={formData.start_datetime}
              onChange={e => setFormData({ ...formData, start_datetime: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label className="label">End Date & Time (Optional)</label>
            <input 
              type="datetime-local" className="input" 
              value={formData.end_datetime}
              onChange={e => setFormData({ ...formData, end_datetime: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-sm font-black text-[#1e293b] uppercase tracking-widest border-b border-[#f1f5f9] pb-4">Dayparting</h4>
          <div className="input-group">
            <label className="label">Operational Timezone</label>
            <select 
              className="input font-medium"
              value={formData.time_targeting.timezone}
              onChange={e => setFormData({ ...formData, time_targeting: { ...formData.time_targeting, timezone: e.target.value } })}
            >
              <option>UTC (Coordinated Universal Time)</option>
              <option>EST (Eastern Standard Time)</option>
              <option>GMT (Greenwich Mean Time)</option>
              <option>IST (India Standard Time)</option>
              <option>PST (Pacific Standard Time)</option>
            </select>
          </div>
          
          <div className="space-y-3">
             <label className="label">Active Days</label>
             <div className="flex flex-wrap gap-2">
                {days.map(d => (
                  <button 
                    key={d}
                    onClick={() => {
                      const current = [...formData.time_targeting.active_days];
                      const updated = current.includes(d) ? current.filter(day => day !== d) : [...current, d];
                      setFormData({...formData, time_targeting: {...formData.time_targeting, active_days: updated}});
                    }}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${
                      formData.time_targeting.active_days.includes(d)
                        ? "bg-[#1ea4d9] border-[#1ea4d9] text-white shadow-lg shadow-blue-100"
                        : "bg-white border-[#e2e8f0] text-[#94a3b8] hover:border-[#cbd5e1]"
                    }`}
                  >
                    {d[0]}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#f8fafc] p-8 rounded-3xl border border-[#e2e8f0]">
         <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-[#1ea4d9]" />
            <h4 className="font-bold text-[#1e293b]">Hour Targeting Matrix</h4>
         </div>
         <div className="grid grid-cols-12 gap-2">
            {Array.from({length: 24}).map((_, i) => {
              const isActive = formData.time_targeting.active_hours.includes(i);
              return (
                <div 
                  key={i}
                  onClick={() => toggleHour(i)}
                  className={`aspect-square border rounded-lg flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-[#1ea4d9] border-[#1ea4d9] text-white shadow-lg shadow-blue-100' 
                      : 'bg-white border-[#e2e8f0] text-[#cbd5e1] hover:border-[#1ea4d9] hover:bg-[#1ea4d9]/5'
                  }`}
                >
                  {i < 10 ? `0${i}` : i}
                </div>
              );
            })}
         </div>
         <p className="mt-6 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest text-center">Tip: Select hours to restrict traffic delivery to high-converting windows.</p>
      </div>
    </div>
  );
}

// Step 7: Creatives
function CreativesStep({ formData, setFormData }: any) {
  const addCreative = () => {
    setFormData({
      ...formData,
      creatives: [...formData.creatives, { title: "", type: "BANNER_IMAGE", url: "", status: "ACTIVE" }]
    });
  };

  const removeCreative = (idx: number) => {
    const updated = [...formData.creatives];
    updated.splice(idx, 1);
    setFormData({ ...formData, creatives: updated });
  };

  const updateCreative = (idx: number, field: string, value: any) => {
    const updated = [...formData.creatives];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData({ ...formData, creatives: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-[#e2e8f0] mb-8">
        <div>
          <h4 className="font-bold text-[#1e293b]">Creative Asset Manager</h4>
          <p className="text-xs text-[#64748b] font-medium">Add banners, videos, or raw link assets for your publishers.</p>
        </div>
        <button 
          onClick={addCreative}
          className="bg-[#1ea4d9] text-white px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-blue-100"
        >
          <Plus className="w-5 h-5" />
          Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formData.creatives.map((c: any, idx: number) => (
          <div key={idx} className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm group relative hover:border-[#1ea4d9] transition-all">
            <button 
              onClick={() => removeCreative(idx)}
              className="absolute top-4 right-4 text-red-400 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="flex gap-4 items-start mb-6">
               <div className="w-16 h-16 bg-[#f1f5f9] rounded-2xl flex items-center justify-center border border-[#e2e8f0] object-cover overflow-hidden">
                  {c.url ? <img src={c.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Upload className="w-6 h-6 text-[#cbd5e1]" />}
               </div>
               <div className="flex-1 space-y-3">
                  <input 
                    type="text" className="input text-sm font-bold border-none bg-transparent hover:bg-gray-50 focus:bg-white p-0 px-2" 
                    placeholder="Asset Title..." 
                    value={c.title}
                    onChange={e => updateCreative(idx, 'title', e.target.value)}
                  />
                  <select 
                    className="input text-[10px] py-1 h-auto font-black uppercase tracking-widest bg-[#f8fafc] w-fit border-none"
                    value={c.type}
                    onChange={e => updateCreative(idx, 'type', e.target.value)}
                  >
                    <option value="BANNER_IMAGE">Banner Image</option>
                    <option value="VIDEO">Video Asset</option>
                    <option value="HTML_AD">HTML / JS Ad</option>
                    <option value="LANDING_PAGE">Offer Landing Page</option>
                  </select>
               </div>
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="label text-[9px] uppercase tracking-widest opacity-60">Resource Endpoint (URL)</label>
                  <input 
                    type="text" className="input text-xs" placeholder="https://cdn.admagic.com/assets/..." 
                    value={c.url}
                    onChange={e => updateCreative(idx, 'url', e.target.value)}
                  />
               </div>
               <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Status:</span>
                     <select 
                       className="text-[10px] font-black uppercase text-[#1ea4d9] hover:underline focus:outline-none"
                       value={c.status}
                       onChange={e => updateCreative(idx, 'status', e.target.value)}
                     >
                       <option value="ACTIVE">Active</option>
                       <option value="INACTIVE">Draft</option>
                     </select>
                  </div>
                  <button className="text-[10px] font-black text-[#1e293b] hover:underline flex items-center gap-1">
                     PREVIEW
                     <ExternalLink className="w-3 h-3" />
                  </button>
               </div>
            </div>
          </div>
        ))}

        {formData.creatives.length === 0 && (
           <div className="col-span-full py-20 bg-[#f8fafc] rounded-3xl border-2 border-dashed border-[#e2e8f0] text-center space-y-4">
              <PlusCircle className="w-12 h-12 text-[#cbd5e1] mx-auto" />
              <p className="text-sm font-black text-[#94a3b8] uppercase tracking-widest">Innocent of Creatives</p>
              <button 
                onClick={addCreative}
                className="text-xs font-black text-[#1ea4d9] hover:underline"
              >
                Upload your first asset library
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
