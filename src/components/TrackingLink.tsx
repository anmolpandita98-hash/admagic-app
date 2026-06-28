import React, { useState, useEffect } from "react";
import { 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  Settings, 
  ChevronRight, 
  Tag, 
  User, 
  Target,
  RefreshCw,
  Code2,
  CheckCircle2
} from "lucide-react";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export default function TrackingLink() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [publishers, setPublishers] = useState<any[]>([]);
  
  const [config, setConfig] = useState({
    campaignId: "",
    publisherId: "",
    clickId: "{click_id}",
    p1: "{p1}",
    p2: "{p2}",
    couponCode: "",
  });

  const [generatedLink, setGeneratedLink] = useState("");

  useEffect(() => {
    if (!user) return;
    const qCount = query(collection(db, "campaigns"), where("createdBy", "==", user.uid));
    getDocs(qCount).then(snapshot => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qPub = query(collection(db, "advertisers"), where("createdBy", "==", user.uid)); // Using advertisers as mock for publishers
    getDocs(qPub).then(snapshot => {
      setPublishers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  useEffect(() => {
    if (config.campaignId) {
      const baseUrl = `https://admagic.track/v1/click`;
      const params = new URLSearchParams();
      params.append("cmp", config.campaignId);
      if (config.publisherId) params.append("aff", config.publisherId);
      params.append("clk", config.clickId);
      if (config.p1) params.append("p1", config.p1);
      if (config.p2) params.append("p2", config.p2);
      if (config.couponCode) params.append("coupon", config.couponCode);
      
      setGeneratedLink(`${baseUrl}?${params.toString()}`);
    } else {
      setGeneratedLink("");
    }
  }, [config]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert("Tracking link copied to regional clipboard.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Tracking Link Generator</h2>
          <p className="text-sm text-[#64748b]">Configure and emit campaign attribution strings for external distribution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel space-y-8">
            <h3 className="panel-label border-b border-[#f1f5f9] pb-4 flex items-center">
              <Settings className="w-4 h-4 mr-2 text-[#1ea4d9]" /> Parameter Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="panel-label block mb-2">Campaign Directive</label>
                  <select 
                    className="w-full border border-[#e2e8f0] rounded px-4 py-3 text-sm focus:border-[#1ea4d9] outline-none bg-white font-bold text-[#1e293b]"
                    value={config.campaignId}
                    onChange={e => setConfig({...config, campaignId: e.target.value})}
                  >
                    <option value="">Select Target Campaign</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="panel-label block mb-2">Publisher / Affiliate</label>
                  <select 
                    className="w-full border border-[#e2e8f0] rounded px-4 py-3 text-sm focus:border-[#1ea4d9] outline-none bg-white"
                    value={config.publisherId}
                    onChange={e => setConfig({...config, publisherId: e.target.value})}
                  >
                    <option value="">Agnostic / Master Link</option>
                    {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Macros & Parameters</p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#64748b] w-16">clk:</span>
                    <input 
                      type="text" 
                      className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded px-3 py-1.5 text-xs font-mono"
                      value={config.clickId}
                      onChange={e => setConfig({...config, clickId: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#64748b] w-16">p1:</span>
                    <input 
                      type="text" 
                      className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded px-3 py-1.5 text-xs font-mono"
                      value={config.p1}
                      onChange={e => setConfig({...config, p1: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#64748b] w-16">coupon:</span>
                    <input 
                      type="text" 
                      className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded px-3 py-1.5 text-xs font-mono"
                      value={config.couponCode}
                      onChange={e => setConfig({...config, couponCode: e.target.value})}
                      placeholder="SPRINGFREE"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#f1f5f9]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[11px] font-bold text-[#1e293b] uppercase tracking-widest">Generated Direct Link</h4>
                <div className="flex space-x-2">
                  <button onClick={() => setConfig({...config, campaignId: "", publisherId: "", clickId: "{click_id}", p1: "{p1}", p2: "{p2}", couponCode: ""})} className="p-1 px-2 text-[10px] font-bold text-[#64748b] hover:text-[#1ea4d9] flex items-center">
                    <RefreshCw className="w-3 h-3 mr-1" /> RESET
                  </button>
                </div>
              </div>
              <div className="p-6 bg-[#0c0c0c] rounded-xl relative group overflow-hidden border border-[#bfff00]/20">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#bfff00]" />
                <p className="text-[13px] font-mono text-[#bfff00] break-all leading-relaxed pr-10">
                  {generatedLink || "// Select a campaign to generate link directives..."}
                </p>
                {generatedLink && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-3 bg-[#bfff00] text-[#0c0c0c] rounded-lg shadow-lg hover:scale-105 transition-all"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all">
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="panel bg-[#f8fafc] border-dashed">
            <h3 className="panel-label mb-4">Implementation Notes</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded bg-[#1ea4d9]/10 flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-bold text-[#1ea4d9]">01</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#1e293b]">Dynamic Attribution</p>
                  <p className="text-[10px] text-[#64748b] leading-relaxed">The <code className="font-mono text-[#1ea4d9]">{config.clickId}</code> macro must be replaced by your affiliate partner's system during the click event.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded bg-[#1ea4d9]/10 flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-bold text-[#1ea4d9]">02</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#1e293b]">Coupon Binding</p>
                  <p className="text-[10px] text-[#64748b] leading-relaxed">Coupons passed via tracking links are automatically evaluated at the conversion point against global goal rules.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h3 className="panel-label">Postback Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                <span className="text-[10px] font-bold text-[#64748b] uppercase">Global S2S</span>
                <span className="text-[10px] font-bold text-green-600">OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded border border-[#f1f5f9]">
                <span className="text-[10px] font-bold text-[#64748b] uppercase">Pixel Firing</span>
                <span className="text-[10px] font-bold text-green-600">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
