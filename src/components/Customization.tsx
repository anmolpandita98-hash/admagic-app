import React, { useState } from "react";
import { 
  Palette, 
  Image as ImageIcon, 
  Type, 
  Save, 
  Layout, 
  Box,
  CheckCircle2
} from "lucide-react";

export default function Customization() {
  const [formData, setFormData] = useState({
    platformName: "AdMagic",
    primaryColor: "#1ea4d9",
    accentColor: "#f97316",
    logoUrl: "",
    faviconUrl: "",
    supportEmail: "support@admagic.io"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setMessage("White-label settings updated.");
      setTimeout(() => setMessage(""), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1e293b]">Customize Platform</h2>
        <p className="text-sm text-[#64748b]">Configure your white-label branding and UI preferences.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel space-y-6">
            <h3 className="text-sm font-bold text-[#1e293b] flex items-center uppercase tracking-wider">
              <palette className="w-4 h-4 mr-2 text-[#1ea4d9]" /> Visual Branding
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase mb-2 block tracking-wider">Platform Name</label>
                <div className="relative">
                  <Type className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                  <input 
                    type="text" 
                    className="w-full border border-[#e2e8f0] rounded pl-10 pr-4 py-2 text-sm focus:border-[#1ea4d9] outline-none"
                    value={formData.platformName}
                    onChange={e => setFormData({...formData, platformName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase mb-2 block tracking-wider">Primary Theme Color</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    className="w-10 h-10 rounded border border-[#e2e8f0] cursor-pointer"
                    value={formData.primaryColor}
                    onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                  />
                  <input 
                    type="text" 
                    className="flex-1 border border-[#e2e8f0] rounded px-4 py-2 text-sm focus:border-[#1ea4d9] outline-none font-mono"
                    value={formData.primaryColor}
                    onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase mb-2 block tracking-wider">Logo URL (Dark)</label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                  <input 
                    type="text" 
                    className="w-full border border-[#e2e8f0] rounded pl-10 pr-4 py-2 text-sm focus:border-[#1ea4d9] outline-none"
                    placeholder="https://example.com/logo.png"
                    value={formData.logoUrl}
                    onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase mb-2 block tracking-wider">Favicon URL</label>
                <div className="relative">
                  <Box className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                  <input 
                    type="text" 
                    className="w-full border border-[#e2e8f0] rounded pl-10 pr-4 py-2 text-sm focus:border-[#1ea4d9] outline-none"
                    placeholder="https://example.com/icon.ico"
                    value={formData.faviconUrl}
                    onChange={e => setFormData({...formData, faviconUrl: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="panel space-y-6">
            <h3 className="text-sm font-bold text-[#1e293b] flex items-center uppercase tracking-wider">
              <Layout className="w-4 h-4 mr-2 text-[#1ea4d9]" /> Dashboard Preferences
            </h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-4 border border-[#e2e8f0] rounded hover:bg-[#f8fafc] transition-all cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-[#1ea4d9] border-[#e2e8f0]" defaultChecked />
                <div>
                  <p className="text-sm font-bold text-[#1e293b]">Enable Dark Mode Toggle</p>
                  <p className="text-xs text-[#64748b]">Allow sub-users to switch between light and dark themes.</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-4 border border-[#e2e8f0] rounded hover:bg-[#f8fafc] transition-all cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-[#1ea4d9] border-[#e2e8f0]" defaultChecked />
                <div>
                  <p className="text-sm font-bold text-[#1e293b]">AI Insights Feed</p>
                  <p className="text-xs text-[#64748b]">Display the right column intelligence panel on dashboard.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel bg-[#f8fafc] border-dashed">
            <div className="text-center py-6">
              <div 
                className="w-16 h-16 rounded-lg mx-auto mb-4 border border-[#e2e8f0] bg-white flex items-center justify-center p-2 overflow-hidden shadow-sm"
              >
                {formData.logoUrl ? <img src={formData.logoUrl} alt="Logo Preview" referrerPolicy="no-referrer" /> : <Palette className="w-8 h-8 text-[#94a3b8]" />}
              </div>
              <h4 className="font-bold text-[#1e293b]">{formData.platformName}</h4>
              <p className="text-[10px] text-[#64748b] uppercase tracking-widest mt-1">Preview</p>
            </div>
            <div className="pt-6 border-t border-[#e2e8f0] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#64748b]">Primary</span>
                <div className="w-12 h-4 rounded" style={{ backgroundColor: formData.primaryColor }} />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#64748b]">Contrast</span>
                <span className="font-mono text-[#1e293b]">#FFFFFF</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center">
              <Save className="w-4 h-4 mr-2" /> Save Branding
            </button>
            {message && (
              <div className="flex items-center justify-center text-xs font-bold text-[#16a34a] animate-in fade-in zoom-in">
                <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> {message}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
import { Palette as palette } from "lucide-react";
