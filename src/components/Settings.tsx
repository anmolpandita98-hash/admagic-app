import React, { useState, useEffect } from "react";
import { 
  Save, 
  Shield, 
  Key, 
  Link as LinkIcon, 
  RefreshCw, 
  Facebook, 
  Globe, 
  Zap,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function Settings() {
  const [config, setConfig] = useState({
    GEMINI_API_KEY: "",
    META_ADS_CLIENT_ID: "",
    GOOGLE_ADS_CLIENT_ID: ""
  });
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedConfig = {
      GEMINI_API_KEY: localStorage.getItem("GEMINI_API_KEY") || "",
      META_ADS_CLIENT_ID: localStorage.getItem("META_ADS_CLIENT_ID") || "",
      GOOGLE_ADS_CLIENT_ID: localStorage.getItem("GOOGLE_ADS_CLIENT_ID") || ""
    };
    setConfig(savedConfig);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setMessage("Channel successfully linked.");
        setTimeout(() => setMessage(""), 3000);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const initiateOAuth = async (channel: string) => {
    try {
      const resp = await fetch(`/api/auth/${channel.toLowerCase()}/url`);
      const { url } = await resp.json();
      window.open(url, 'oauth_popup', 'width=600,height=700');
    } catch (e) {
      console.error(e);
      alert(`Failed to initiate ${channel} handshake.`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    localStorage.setItem("GEMINI_API_KEY", config.GEMINI_API_KEY);
    localStorage.setItem("META_ADS_CLIENT_ID", config.META_ADS_CLIENT_ID);
    localStorage.setItem("GOOGLE_ADS_CLIENT_ID", config.GOOGLE_ADS_CLIENT_ID);
    
    setTimeout(() => {
      setSaving(false);
      setMessage("Configuration updated successfully.");
      setTimeout(() => setMessage(""), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1e293b]">Automation & Integrations</h2>
        <p className="text-sm text-[#64748b]">Configure AI agents and external advertising accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="panel space-y-8">
            <h3 className="font-bold text-[#1e293b] flex items-center mb-6">
              <Zap className="w-4 h-4 mr-2 text-[#1ea4d9]" /> Primary API Credentials
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2 block">
                  Gemini AI Optimization Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                  <input 
                    type="password"
                    value={config.GEMINI_API_KEY}
                    onChange={e => setConfig({...config, GEMINI_API_KEY: e.target.value})}
                    placeholder="Enter API Key"
                    className="w-full border border-[#e2e8f0] rounded pl-10 pr-4 py-3 text-sm focus:border-[#1ea4d9] outline-none"
                  />
                </div>
                <p className="text-[10px] text-[#94a3b8] mt-2 italic">Required for automated campaign optimization and predictive insights.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#f1f5f9]">
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2 block">Meta Ads App ID</label>
                  <input 
                    type="text"
                    value={config.META_ADS_CLIENT_ID}
                    onChange={e => setConfig({...config, META_ADS_CLIENT_ID: e.target.value})}
                    placeholder="Enter Client ID"
                    className="w-full border border-[#e2e8f0] rounded px-4 py-3 text-sm focus:border-[#1ea4d9] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2 block">Google Ads Customer ID</label>
                  <input 
                    type="text"
                    value={config.GOOGLE_ADS_CLIENT_ID}
                    onChange={e => setConfig({...config, GOOGLE_ADS_CLIENT_ID: e.target.value})}
                    placeholder="Enter ID"
                    className="w-full border border-[#e2e8f0] rounded px-4 py-3 text-sm focus:border-[#1ea4d9] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#f1f5f9] flex items-center justify-between">
              {message && (
                <div className="flex items-center text-xs font-bold text-[#16a34a]">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> {message}
                </div>
              )}
              <div className="flex-1" />
              <button 
                type="submit" 
                disabled={isSaving}
                className="btn-primary flex items-center min-w-[160px] justify-center"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>

          <div className="panel bg-[#f8fafc] border-dashed">
            <h3 className="text-sm font-bold text-[#1e293b] mb-4 uppercase tracking-wider">How Integrations Work</h3>
            <ul className="space-y-3">
              {[
                "Connect your ad accounts to allow AdMagic to fetch real-time data.",
                "AI agents use Gemini keys to analyze performance and suggest bid changes.",
                "All keys are kept in your local browser storage for security.",
                "Active tokens auto-refresh using the provided Client IDs."
              ].map((text, i) => (
                <li key={i} className="flex items-start text-xs text-[#64748b]">
                  <div className="w-1 h-1 rounded-full bg-[#1ea4d9] mt-1.5 mr-3 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel">
            <h3 className="text-sm font-bold text-[#1e293b] mb-6 uppercase tracking-wider">OAuth Handshake</h3>
            <div className="space-y-3">
              <button 
                onClick={() => initiateOAuth('meta')}
                className="w-full flex items-center justify-between p-4 bg-[#1877f2] hover:bg-[#166fe5] border border-blue-600 rounded text-white transition-all group"
              >
                <div className="flex items-center">
                  <Facebook className="w-5 h-5 mr-3" />
                  <span className="text-xs font-bold uppercase tracking-wider">Connect Meta</span>
                </div>
                <LinkIcon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              </button>
              
              <button 
                onClick={() => initiateOAuth('google')}
                className="w-full flex items-center justify-between p-4 bg-white border border-[#e2e8f0] hover:border-[#1ea4d9] rounded text-[#1e293b] transition-all group shadow-sm"
              >
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-[#db4437]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Connect Google</span>
                </div>
                <LinkIcon className="w-4 h-4 text-[#94a3b8] group-hover:text-[#1ea4d9]" />
              </button>
            </div>
            <p className="text-[10px] text-[#94a3b8] mt-4 text-center italic">Initiates a secure popup for authorization.</p>
          </div>

          <div className="panel space-y-4">
            <h3 className="text-sm font-bold text-[#1e293b] uppercase tracking-wider">Health Checks</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded bg-green-50 text-green-700">
                <div className="flex items-center text-xs font-medium">
                  <Shield className="w-4 h-4 mr-2" /> Database Link
                </div>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className={`flex items-center justify-between p-3 rounded text-xs font-medium ${config.GEMINI_API_KEY ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" /> Neural Engine
                </div>
                {config.GEMINI_API_KEY ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
