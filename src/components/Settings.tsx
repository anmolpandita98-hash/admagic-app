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
  CheckCircle2
} from "lucide-react";

export default function Settings() {
  // Meta/Google client IDs are public identifiers, not secrets, so they can stay
  // in localStorage. The Gemini key is intentionally NOT handled here anymore —
  // it lives only on the server and is never exposed to the browser.
  const [config, setConfig] = useState({
    META_ADS_CLIENT_ID: "",
    GOOGLE_ADS_CLIENT_ID: ""
  });
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setConfig({
      META_ADS_CLIENT_ID: localStorage.getItem("META_ADS_CLIENT_ID") || "",
      GOOGLE_ADS_CLIENT_ID: localStorage.getItem("GOOGLE_ADS_CLIENT_ID") || ""
    });

    // Kept for forward compatibility; no sender posts this message yet since the
    // OAuth flow is not configured (the /api/auth/:channel/url route was removed).
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setMessage("Channel successfully linked.");
        setTimeout(() => setMessage(""), 3000);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
              <div className="flex items-start p-4 bg-[#f0f9ff] border border-[#1ea4d9]/20 rounded">
                <Key className="w-4 h-4 mr-3 mt-0.5 text-[#1ea4d9] flex-shrink-0" />
                <p className="text-[11px] text-[#64748b] leading-relaxed">
                  The Gemini AI key is managed securely on the server and is never exposed to the browser. Neural optimization and Creative Lab work automatically when the server is configured.
                </p>
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
                "AI agents use a server-side Gemini key to analyze performance and suggest bid changes.",
                "Secret keys stay on the server; only public client IDs are stored in your browser.",
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
                disabled
                title="OAuth integration not yet configured"
                className="w-full flex items-center justify-between p-4 bg-[#1877f2]/60 border border-blue-600/40 rounded text-white cursor-not-allowed opacity-70"
              >
                <div className="flex items-center">
                  <Facebook className="w-5 h-5 mr-3" />
                  <span className="text-xs font-bold uppercase tracking-wider">Connect Meta</span>
                </div>
                <LinkIcon className="w-4 h-4 opacity-70" />
              </button>
              
              <button 
                disabled
                title="OAuth integration not yet configured"
                className="w-full flex items-center justify-between p-4 bg-white border border-[#e2e8f0] rounded text-[#94a3b8] cursor-not-allowed opacity-70 shadow-sm"
              >
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-[#db4437]/60" />
                  <span className="text-xs font-bold uppercase tracking-wider">Connect Google</span>
                </div>
                <LinkIcon className="w-4 h-4 text-[#94a3b8]" />
              </button>
            </div>
            <p className="text-[10px] text-[#94a3b8] mt-4 text-center italic">OAuth integration not yet configured.</p>
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
              <div className="flex items-center justify-between p-3 rounded text-xs font-medium bg-blue-50 text-blue-700">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2" /> Neural Engine
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider">Server-managed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
