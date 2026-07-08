import React, { useState } from "react";
import { Globe, Search, ArrowRight, Zap, ShieldCheck, Activity, MapPin, ExternalLink, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";

export default function GlobalChecker() {
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleCheck = async () => {
    if (!url) return;
    setChecking(true);
    try {
      const { data } = await api.post("/api/automation/check-url", { url });
      setResults(data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Global Accessibility Checker</h2>
          <p className="text-gray-500 mt-1">Simulate requests from 50+ global nodes to verify landing page health and SSL integrity.</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">ACTIVE NODES: 62</span>
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm text-center">
        <div className="max-w-2xl mx-auto space-y-8">
           <div className="relative group">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-landing-page.com/offer?p1=test"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-12 py-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-bold text-gray-700"
              />
              <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${checking ? "text-blue-500 animate-spin" : "text-gray-300"}`} />
              <button 
                onClick={handleCheck}
                disabled={checking}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white px-8 rounded-xl font-black flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
              >
                {checking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                SCRIBE NODES
              </button>
           </div>

           <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                 <ShieldCheck className="w-4 h-4 text-green-500" />
                 SSL PROTOCOL CHECK
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                 <Zap className="w-4 h-4 text-amber-500" />
                 LATENCY BENCHMARKING
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                 <Activity className="w-4 h-4 text-blue-500" />
                 HTTP STATUS MAPPING
              </div>
           </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {results.map((res, i) => (
              <div key={i} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                       <MapPin className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                       <h4 className="font-extrabold text-gray-900 leading-tight">{res.region}</h4>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SERVER NODE ID: {1000 + i}</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className={`text-sm font-black italic ${res.status === "200 OK" ? "text-green-600" : "text-red-500"}`}>{res.status}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{res.latency}</p>
                 </div>
              </div>
           ))}
        </div>
      )}

      <div className="bg-gray-900 rounded-3xl p-10 text-white overflow-hidden relative shadow-2xl">
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
               <h3 className="text-3xl font-black italic tracking-tighter leading-none text-blue-400">WHY GLOBAL CHECKER?</h3>
               <p className="text-gray-400 leading-relaxed font-medium">
                 Ad networks and publishers frequently use localized redirects or cloaking. The Global Checker allows you to bypass user-level targeting and see the raw response your traffic nodes encounter in diverse regions.
               </p>
               <div className="flex items-center gap-4 pt-4">
                  <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-blue-600 px-6 py-3 rounded-xl hover:bg-blue-700 transition-all">
                    SCHEDULE PERIODIC SCAN
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">API INTEGRATION</button>
               </div>
            </div>
            <div className="flex justify-center lg:justify-end">
               <div className="w-64 h-64 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 relative">
                  <Globe className="w-32 h-32 text-blue-500/40 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Activity className="w-48 h-48 text-blue-500/5 rotate-in" />
                  </div>
               </div>
            </div>
         </div>
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  );
}
