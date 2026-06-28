import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Plus, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Settings as SettingsIcon,
  Filter,
  Info,
  ArrowRight,
  MoreVertical,
  Link as LinkIcon,
  RefreshCw,
  Layout,
  Tag,
  Users,
  Briefcase,
  Target
} from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";

export default function SmartLink() {
  const { user } = useAuth();
  const [smartLinks, setSmartLinks] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);

  // States for dropdowns
  const [publishers, setPublishers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    publisherPostback: "Enable",
    smartLinkEvent: "Click",
    type: "Tags", // Category, Manual, Tags
    selectedTags: [] as string[],
    
    // Filters step
    publisherFilter: "Allowed", // Allowed, Blocked
    selectedPublishers: [] as string[],
    selectedAdvertisers: [] as string[],
    excludedCampaigns: [] as string[],
    minPayout: "",
    maxPayout: "",
    objectiveFilter: "",

    // Settings step
    status: "Active",
    kickOutLogic: true,
    kickOutClicks: "1 Million",
    kickOutDays: "1 Day",
    revertToZeroEpc: false
  });

  useEffect(() => {
    if (!user) return;
    const qLabel = query(collection(db, "smartlinks"), where("createdBy", "==", user.uid));
    const unsubscribe = onSnapshot(qLabel, (snapshot) => {
      setSmartLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Load deps
    getDocs(query(collection(db, "campaigns"), where("createdBy", "==", user.uid))).then(s => {
      setCampaigns(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, "smartlinks"), {
        ...formData,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setStep(1);
      setFormData({
        title: "",
        publisherPostback: "Enable",
        smartLinkEvent: "Click",
        type: "Tags",
        selectedTags: [],
        publisherFilter: "Allowed",
        selectedPublishers: [],
        selectedAdvertisers: [],
        excludedCampaigns: [],
        minPayout: "",
        maxPayout: "",
        objectiveFilter: "",
        status: "Active",
        kickOutLogic: true,
        kickOutClicks: "1 Million",
        kickOutDays: "1 Day",
        revertToZeroEpc: false
      });
    } catch (e) {
      console.error(e);
    }
  };

  const steps = [
    { id: 1, label: "Details", sub: "Setup Details" },
    { id: 2, label: "Filters", sub: "Setup Filters" },
    { id: 3, label: "Settings", sub: "Setup Settings" }
  ];

  if (showAdd) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center space-x-2 text-sm text-[#64748b] mb-2">
          <button onClick={() => setShowAdd(false)} className="hover:text-[#1ea4d9]">Smart Link Manage</button>
          <ChevronRight className="w-3 h-3" />
          <span className="font-bold text-[#1e293b]">Smart Link | Create</span>
        </div>

        <div className="flex">
          {/* Left Steps Panel */}
          <div className="w-64 flex flex-col space-y-2 pr-8 mt-12 border-r border-[#e2e8f0]">
            {steps.map((s) => (
              <div 
                key={s.id}
                className={`p-4 rounded-lg flex items-start space-x-4 transition-all ${
                  step === s.id ? "bg-[#f0f9ff] border-l-4 border-[#1ea4d9]" : "bg-transparent opacity-60"
                }`}
              >
                <span className={`text-lg font-bold mt-1 ${step === s.id ? "text-[#1ea4d9]" : "text-[#94a3b8]"}`}>
                  {s.id}.
                </span>
                <div>
                  <h4 className={`font-bold ${step === s.id ? "text-[#1ea4d9]" : "text-[#475569]"}`}>{s.label}</h4>
                  <p className="text-[10px] text-[#64748b] whitespace-nowrap">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 pl-12">
            <div className="panel animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-[#1e293b] mb-8">Setup {steps[step - 1].label}</h2>

              {step === 1 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">Publisher Postback</label>
                      <div className="flex space-x-4">
                        {["Enable", "Disabled"].map(opt => (
                          <label key={opt} className="flex items-center space-x-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="postback" 
                              checked={formData.publisherPostback === opt}
                              onChange={() => setFormData({...formData, publisherPostback: opt})}
                              className="w-4 h-4 text-[#1ea4d9] border-[#e2e8f0] focus:ring-[#1ea4d9]"
                            />
                            <span className="text-sm font-medium text-[#475569] group-hover:text-[#1e293b]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">Smart link event</label>
                      <div className="flex space-x-4">
                        {["Click", "Impression"].map(opt => (
                          <label key={opt} className="flex items-center space-x-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="event" 
                              checked={formData.smartLinkEvent === opt}
                              onChange={() => setFormData({...formData, smartLinkEvent: opt})}
                              className="w-4 h-4 text-[#1ea4d9] border-[#e2e8f0] focus:ring-[#1ea4d9]"
                            />
                            <span className="text-sm font-medium text-[#475569] group-hover:text-[#1e293b]">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-[#64748b] uppercase tracking-wide">Type</label>
                    <div className="flex space-x-4">
                      {["Category", "Manual", "Tags"].map(opt => (
                        <label key={opt} className="flex items-center space-x-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="type" 
                            checked={formData.type === opt}
                            onChange={() => setFormData({...formData, type: opt})}
                            className="w-4 h-4 text-[#1ea4d9] focus:ring-[#1ea4d9]"
                          />
                          <span className="text-sm font-medium text-[#475569] group-hover:text-[#1e293b]">{opt}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-[11px] italic text-[#94a3b8]">In {formData.type.toLowerCase()} type smart link Country and Device targeting are always applied</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-[#1e293b]">Select Tags <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="w-full border border-[#e2e8f0] rounded focus-within:border-[#1ea4d9] min-h-[44px] p-2 flex flex-wrap gap-2">
                        {formData.selectedTags.map(tag => (
                          <span key={tag} className="bg-[#1ea4d9] text-white px-2 py-1 rounded text-xs flex items-center">
                            {tag} <button onClick={() => setFormData({...formData, selectedTags: formData.selectedTags.filter(t => t !== tag)})} className="ml-2 hover:text-black">×</button>
                          </span>
                        ))}
                        <input 
                          type="text" 
                          placeholder="Search tags..." 
                          className="flex-1 outline-none text-sm min-w-[120px]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val && !formData.selectedTags.includes(val)) {
                                setFormData({...formData, selectedTags: [...formData.selectedTags, val]});
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="absolute top-full left-0 w-full bg-white border border-[#e2e8f0] shadow-lg rounded-b-md mt-1 z-10 max-h-48 overflow-y-auto">
                        {["Tech1", "Global business", "Ecommerce", "Testesttst", "Test camp"].filter(t => !formData.selectedTags.includes(t)).map(tag => (
                          <button 
                            key={tag}
                            onClick={() => setFormData({...formData, selectedTags: [...formData.selectedTags, tag]})}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-[#f8fafc] flex items-center justify-between"
                          >
                            {tag}
                            {formData.selectedTags.includes(tag) && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex space-x-6">
                      {["Allowed Publishers", "Blocked Publishers"].map(opt => (
                        <label key={opt} className="flex items-center space-x-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="pubfilter" 
                            checked={formData.publisherFilter === opt.split(' ')[0]}
                            onChange={() => setFormData({...formData, publisherFilter: opt.split(' ')[0]})}
                            className="w-4 h-4 text-[#1ea4d9]"
                          />
                          <span className="text-sm font-medium text-[#475569]">{opt}</span>
                          <Info className="w-3.5 h-3.5 text-[#94a3b8]" />
                        </label>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      placeholder="Choose any Publisher" 
                      className="w-full border border-[#e2e8f0] rounded px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="panel-label">Allowed Advertisers</label>
                    <input 
                      type="text" 
                      placeholder="Select advertisers..." 
                      className="w-full border border-[#e2e8f0] rounded px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="panel-label">Exclude Campaigns</label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded text-[#1ea4d9]" />
                        <span className="text-xs text-[#64748b]">Add By IDs</span>
                      </label>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Start Typing to search campaign" 
                      className="w-full border border-[#e2e8f0] rounded px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none"
                    />
                    <p className="text-[10px] text-[#94a3b8] italic">Use this option to exclude any sensitive campaigns from the smart link</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="panel-label block mb-1">Min Payout (USD)</label>
                      <input 
                        type="number" 
                        className="w-full border border-[#e2e8f0] rounded px-4 py-2 text-sm outline-none"
                        value={formData.minPayout}
                        onChange={e => setFormData({...formData, minPayout: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="panel-label block mb-1">Max Payout (USD)</label>
                      <input 
                        type="number" 
                        className="w-full border border-[#e2e8f0] rounded px-4 py-2 text-sm outline-none"
                        value={formData.maxPayout}
                        onChange={e => setFormData({...formData, maxPayout: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="panel-label">Status</label>
                    <select 
                      className="w-full border border-[#e2e8f0] rounded px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none bg-white font-bold"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                    </select>
                  </div>

                  <div className="space-y-6 bg-[#f8fafc] p-6 rounded-xl border border-[#e2e8f0]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <label className="font-bold text-[#1e293b] text-sm italic">Campaign Kick Out Logic</label>
                        <Info className="w-3.5 h-3.5 text-[#1ea4d9]" />
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.kickOutLogic}
                        onChange={e => setFormData({...formData, kickOutLogic: e.target.checked})}
                        className="w-5 h-5 rounded text-[#1ea4d9]"
                      />
                    </div>

                    {formData.kickOutLogic && (
                      <div className="space-y-4 pt-4 border-t border-[#e2e8f0] animate-in slide-in-from-top-2 duration-200">
                        <p className="text-sm font-medium text-[#475569]">Campaign will be kicked out after having more than</p>
                        <div className="flex items-center space-x-3">
                          <select 
                            className="bg-white border border-[#e2e8f0] rounded px-3 py-2 text-sm min-w-[120px] font-bold outline-none"
                            value={formData.kickOutClicks}
                            onChange={e => setFormData({...formData, kickOutClicks: e.target.value})}
                          >
                            <option value="1 Million">1 Million</option>
                            <option value="500k">500k</option>
                            <option value="250k">250k</option>
                            <option value="100k">100k</option>
                          </select>
                          <span className="text-sm text-[#64748b]">Number of clicks in past</span>
                          <select 
                            className="bg-white border border-[#e2e8f0] rounded px-3 py-2 text-sm min-w-[100px] outline-none"
                            value={formData.kickOutDays}
                            onChange={e => setFormData({...formData, kickOutDays: e.target.value})}
                          >
                            <option value="1 Day">1 Day</option>
                            <option value="2 Days">2 Days</option>
                            <option value="7 Days">7 Days</option>
                          </select>
                          <span className="text-sm text-[#64748b]">with 0 Rev</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between panel bg-white">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-[#1e293b]">Revert to 0 EPC on Newly Added Campaign</h4>
                        <Info className="w-3.5 h-3.5 text-[#94a3b8]" />
                      </div>
                      <p className="text-xs text-[#94a3b8]">Automatically reset EPC score for fresh additives in the rotation</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.revertToZeroEpc}
                        onChange={e => setFormData({...formData, revertToZeroEpc: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ea4d9]"></div>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-12 mt-8 border-t border-[#f1f5f9] space-x-4">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="btn-secondary">Back</button>
                )}
                <button 
                  onClick={() => step < 3 ? setStep(step + 1) : handleCreate()}
                  className="btn-primary min-w-[120px]"
                >
                  {step === 3 ? "Complete" : "Next"}
                </button>
              </div>
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
          <h2 className="text-2xl font-bold text-[#1e293b]">Smart Link Architecture</h2>
          <p className="text-sm text-[#64748b]">Real-time redirection logic using AI-optimized rotational algorithms.</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <SettingsIcon className="w-4 h-4 mr-2" /> Global Logic
          </button>
          <div className="relative group">
            <button className="btn-primary flex items-center">
              Actions <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#e2e8f0] shadow-xl rounded-lg py-2 z-10 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={() => setShowAdd(true)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#f8fafc] flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" /> Add New
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[#f8fafc] flex items-center">
                <LinkIcon className="w-4 h-4 mr-2" /> Generate Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="panel bg-gradient-to-br from-[#1ea4d9] to-[#0ea5e9] text-white overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Rotation Nodes</p>
            <p className="text-3xl font-bold">12 Active</p>
          </div>
          <Target className="w-16 h-16 absolute -bottom-4 -right-4 text-white/10 rotate-12" />
        </div>
        <div className="panel flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Smart Hops</p>
          <p className="text-2xl font-bold text-[#1e293b]">48,102</p>
        </div>
        <div className="panel flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Avg EPC Score</p>
          <p className="text-2xl font-bold text-[#16a34a]">$1.42</p>
        </div>
        <div className="panel flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-1">Decentralized Sync</p>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-bold text-[#1e293b]">OPERATIONAL</p>
          </div>
        </div>
      </div>

      <div className="panel !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input 
              type="text" 
              placeholder="Search rotation strings..." 
              className="w-full bg-white border border-[#e2e8f0] rounded pl-10 pr-4 py-2 text-sm focus:border-[#1ea4d9] outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary !p-2">
              <RefreshCw className="w-4 h-4 text-[#64748b]" />
            </button>
            <button className="btn-secondary !py-2 !px-4 text-[11px] font-bold flex items-center">
              <Filter className="w-3.5 h-3.5 mr-2" /> ALL CLUSTERS
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="trackier-table">
            <thead>
              <tr>
                <th className="text-left font-mono text-[10px]">INTERNAL_ID</th>
                <th className="text-left font-mono text-[10px]">TAGS_MAPPING</th>
                <th className="text-left font-mono text-[10px]">ROTATION_URL</th>
                <th className="text-center font-mono text-[10px]">TRAFFIC_TYPE</th>
                <th className="text-center font-mono text-[10px]">STATUS</th>
                <th className="text-center font-mono text-[10px]">AVG_EPC</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {smartLinks.map((sl) => (
                <tr key={sl.id} className="group hover:bg-[#f8fafc]">
                  <td>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3.5 h-3.5 text-[#1ea4d9]" />
                      <span className="font-bold text-[#1e293b]">{sl.title || `SMART_${sl.id.slice(0,5).toUpperCase()}`}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {sl.selectedTags?.map((t: string) => (
                        <span key={t} className="text-[9px] font-bold px-1.5 py-0.5 bg-[#f1f5f9] text-[#64748b] rounded border border-[#e2e8f0]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <code className="text-[10px] bg-[#f8fafc] px-2 py-1 rounded border border-[#e2e8f0] text-[#1ea4d9]">
                      {window.location.origin}/sl/{sl.id}
                    </code>
                  </td>
                  <td className="text-center">
                    <span className="text-xs text-[#64748b] font-medium">{sl.smartLinkEvent}</span>
                  </td>
                  <td className="text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sl.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-[#f1f5f9] text-[#64748b]'
                    }`}>
                      {sl.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="font-bold text-[#16a34a]">$0.00</span>
                  </td>
                  <td className="text-right">
                    <button className="p-1.5 hover:bg-white border hover:border-[#e2e8f0] rounded-md opacity-0 group-hover:opacity-100 transition-all">
                      <MoreVertical className="w-4 h-4 text-[#64748b]" />
                    </button>
                  </td>
                </tr>
              ))}
              {smartLinks.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-20">
                    <Layout className="w-12 h-12 text-[#e2e8f0] mx-auto mb-4" />
                    <p className="text-sm italic text-[#94a3b8]">Global rotation repository is currently empty.</p>
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

function ChevronDown(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
