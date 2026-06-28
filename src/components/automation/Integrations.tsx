import React, { useState, useEffect } from "react";
import { Link2, Plus, CheckCircle, Globe, Settings2, Trash2, ExternalLink } from "lucide-react";
import axios from "axios";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  config: any;
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newIntegration, setNewIntegration] = useState({ name: "", type: "S2S", status: "Active", config: {} });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data } = await axios.get("/api/automation/integrations");
      setIntegrations(data);
    } catch (e) {
      console.error("Failed to fetch integrations", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = async (configData: any = null) => {
    setIsSaving(true);
    try {
      const payload = configData ? {
        name: configData.name || selectedTemplate.name,
        type: selectedTemplate?.type || newIntegration.type,
        status: "Active",
        config: configData
      } : newIntegration;

      await axios.post("/api/automation/integrations", payload);
      setSaveSuccess(true);
      
      // Artificial delay for visual confirmation of success
      setTimeout(() => {
        setShowAddModal(false);
        setSelectedTemplate(null);
        setSaveSuccess(false);
        setIsSaving(false);
        fetchIntegrations();
      }, 1500);
    } catch (e: any) {
      console.error("Failed to add integration", e);
      setIsSaving(false);
      const errorMsg = e.response?.data?.details || e.message || "Unknown error";
      alert(`Failed to establish link: ${errorMsg}\nPlease check your credentials and try again.`);
    }
  };

  const TEMPLATES = [
    { name: "Google Ads", icon: "https://www.google.com/favicon.ico", type: "Native", description: "Native conversion upload & tracking." },
    { name: "Meta Ads", icon: "https://www.facebook.com/favicon.ico", type: "Native", description: "CAPI & Pixel event synchronization." },
    { name: "Shopify", icon: "https://www.shopify.com/favicon.ico", type: "Postback", description: "E-commerce order attribution." },
    { name: "Cake Network", icon: "https://getcake.com/favicon.ico", type: "S2S", description: "Enterprise S2S mapping." },
    { name: "Everflow", icon: "https://www.everflow.io/favicon.ico", type: "API", description: "Real-time API connector." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partner Integrations</h2>
          <p className="text-gray-500 mt-1 font-medium">Connect third-party platforms and API connectors for seamless data flow.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Popular Templates */}
        <div className="col-span-full mb-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Marketplace Templates</h3>
        </div>
        
        {TEMPLATES.map((tpl) => (
          <div 
            key={tpl.name} 
            onClick={() => setSelectedTemplate(tpl)}
            className="bg-white border border-gray-100 p-6 rounded-[28px] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex items-start justify-between cursor-pointer"
          >
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-50 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                <img src={tpl.icon} alt={tpl.name} className="w-7 h-7 grayscale group-hover:grayscale-0 transition-all duration-300" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{tpl.name}</h4>
                <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest mt-1">{tpl.type} Connector</p>
                <p className="text-xs text-gray-400 mt-2 font-medium line-clamp-1">{tpl.description}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden mt-8 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Configured Nodes
          </h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading pipelines...</div>
        ) : integrations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No active integrations found.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-sm text-blue-600 font-bold hover:underline"
            >
              Configure your first node
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Integration Name</th>
                  <th className="px-6 py-4">Protocol</th>
                  <th className="px-6 py-4">Reliability</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {integrations.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.type}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-xs font-bold text-gray-700">99.9%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-red-500 transition-colors p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6">New Integration Node</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Internal Label</label>
                <input 
                  type="text" 
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration({...newIntegration, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  placeholder="e.g. Acme Advertiser S2S"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Protocol Type</label>
                <select 
                  value={newIntegration.type}
                  onChange={(e) => setNewIntegration({...newIntegration, type: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                >
                  <option>S2S</option>
                  <option>Postback</option>
                  <option>API</option>
                  <option>Direct Pixel</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleAddIntegration()}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
              >
                Auth & Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTemplate && (
        <TemplateConfigModal 
          template={selectedTemplate} 
          onClose={() => setSelectedTemplate(null)} 
          onSave={handleAddIntegration}
          isSaving={isSaving}
          isSuccess={saveSuccess}
        />
      )}
    </div>
  );
}

function TemplateConfigModal({ template, onClose, onSave, isSaving, isSuccess }: any) {
  const [config, setConfig] = useState<any>({ name: `${template.name} Node` });
  
  const fields: any = {
    'Google Ads': [
      { key: 'customer_id', label: 'Customer ID', placeholder: '123-456-7890' },
      { key: 'developer_token', label: 'Developer Token', placeholder: 'xxxx-xxxx-xxxx' },
      { key: 'client_id', label: 'OAuth Client ID', placeholder: 'xxx.apps.googleusercontent.com' }
    ],
    'Meta Ads': [
      { key: 'pixel_id', label: 'Pixel ID', placeholder: 'Numeric ID' },
      { key: 'access_token', label: 'CAPI Access Token', placeholder: 'EAAG...' },
      { key: 'business_id', label: 'Business ID', placeholder: 'Optional' }
    ],
    'Shopify': [
      { key: 'shop_url', label: 'Shop URL', placeholder: 'your-store.myshopify.com' },
      { key: 'access_token', label: 'Admin API Access Token', placeholder: 'shpat_...' }
    ],
    'Cake Network': [
      { key: 'api_key', label: 'API Key', placeholder: 'CAKE API Key' },
      { key: 'domain', label: 'Network Domain', placeholder: 'network.cakemarketing.com' },
      { key: 'network_id', label: 'Network ID', placeholder: 'Numeric ID' }
    ],
    'Everflow': [
      { key: 'api_key', label: 'API Key', placeholder: 'Everflow API Key' },
      { key: 'network_id', label: 'Network ID', placeholder: 'Numeric ID' },
      { key: 'domain', label: 'API Domain', placeholder: 'api.eflow.team' }
    ]
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
               <img src={template.icon} className="w-6 h-6" alt={template.name} referrerPolicy="no-referrer" />
             </div>
             <div>
               <h3 className="text-xl font-black text-gray-900 tracking-tight">Configure {template.name}</h3>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Native Pipeline Architecture</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-full transition-colors">
            <Settings2 className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Integration Alias</label>
              <input 
                type="text" 
                value={config.name}
                onChange={(e) => setConfig({...config, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-gray-900"
              />
           </div>

           {(fields[template.name] || []).map((f: any) => (
             <div key={f.key}>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{f.label}</label>
                <input 
                  type="text" 
                  placeholder={f.placeholder}
                  value={config[f.key] || ""}
                  onChange={(e) => setConfig({...config, [f.key]: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-gray-900"
                />
             </div>
           ))}

           <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-50">
              <p className="text-xs text-blue-600 font-bold leading-relaxed">
                By connecting this node, you authorize AdMagic to programmatically synchronize conversion signals and campaign metadata with {template.name} via protected protocols.
              </p>
           </div>
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
           <button 
             onClick={onClose}
             disabled={isSaving}
             className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-colors disabled:opacity-50"
           >
             Decline
           </button>
           <button 
             onClick={() => onSave(config)}
             disabled={isSaving}
             className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 ${
               isSuccess 
               ? "bg-green-500 text-white shadow-green-200" 
               : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
             } disabled:opacity-80`}
           >
             {isSaving ? (
               <>
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Processing...
               </>
             ) : isSuccess ? (
               <>
                 <CheckCircle className="w-4 h-4" />
                 Link Established
               </>
             ) : (
               "Establish Link"
             )}
           </button>
        </div>
      </div>
    </div>
  );
}
