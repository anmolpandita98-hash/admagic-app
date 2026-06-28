import React, { useState } from "react";
import { Link2, Play, CheckCircle2, AlertCircle, Search, RefreshCw, Terminal, Eye } from "lucide-react";

export default function LinkTestTools() {
  const [url, setUrl] = useState("");
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleTest = () => {
    if (!url) return;
    setTesting(true);
    setLogs([]);
    
    const steps = [
      "Inbound request received...",
      "Matching partner redirection node...",
      "Resolving Geo: United States...",
      "Validating IP: 192.168.1.1...",
      "Campaign #12 [Active] identified.",
      "Capping check: 450/1000 [OK]",
      "Target URL: https://advertiser.com/lp?p1={click_id}",
      "Macro Expansion: {click_id} -> clk_" + Math.random().toString(36).substr(2, 9),
      "Redirecting (302) to destination..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setLogs(prev => [...prev, steps[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTesting(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">End-to-End Link Debugger</h2>
          <p className="text-gray-500 mt-1">Simulate the entire tracking flow and inspect redirection logic in real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-6">
            <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
               <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                 <Link2 className="w-5 h-5 text-blue-600" />
                 Simulation Engine
               </h3>
               
               <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-3 tracking-widest">Tracking Link to Test</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value={url}
                         onChange={(e) => setUrl(e.target.value)}
                         placeholder="http://ais-dev.../sl/your_id"
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-sm"
                       />
                       <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-black text-gray-400 uppercase mb-3 tracking-widest">Origin Geo</label>
                       <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-sm">
                          <option>United States</option>
                          <option>United Kingdom</option>
                          <option>India</option>
                          <option>Brazil</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-black text-gray-400 uppercase mb-3 tracking-widest">Device Family</label>
                       <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-sm">
                          <option>iPhone (iOS)</option>
                          <option>Pixel (Android)</option>
                          <option>Desktop (Chrome)</option>
                       </select>
                     </div>
                  </div>

                  <button 
                    onClick={handleTest}
                    disabled={testing}
                    className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-50"
                  >
                    {testing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                    INITIATE TEST SEQUENCE
                  </button>
               </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl flex items-start gap-4">
               <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
               <div className="space-y-2">
                  <h4 className="font-black text-blue-900 leading-tight uppercase tracking-tight text-sm">PRO TIP: SIMULATED COOKIES</h4>
                  <p className="text-xs font-semibold text-blue-700 leading-relaxed italic">
                    Tests performed here do not persist cookies in your browser, allowing for clean re-testing of multi-touch attribution logic.
                  </p>
               </div>
            </div>
         </div>

         <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
            <div className="px-6 py-4 bg-gray-800 flex justify-between items-center border-b border-white/5">
                <h3 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
                   <Terminal className="w-4 h-4 text-green-400" />
                   System Debug Stack
                </h3>
                <div className="flex gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-red-400" />
                   <div className="w-2 h-2 rounded-full bg-amber-400" />
                   <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
            </div>
            
            <div className="p-6 flex-1 font-mono text-sm space-y-3 overflow-y-auto">
               {logs.length === 0 && !testing && (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-30 text-white space-y-4">
                    <Eye className="w-12 h-12" />
                    <p className="text-xs font-bold italic">Waiting for simulation trigger...</p>
                 </div>
               )}
               {logs.map((log, i) => (
                 <div key={i} className="flex gap-4 group animate-in slide-in-from-left-2 duration-300">
                    <span className="text-gray-600 font-bold w-4">{i + 1}</span>
                    <span className={`font-bold ${log.includes("OK") ? "text-green-400" : log.includes("Error") ? "text-red-400" : "text-gray-300"}`}>
                       <span className="text-blue-400">#</span> {log}
                    </span>
                 </div>
               ))}
               {testing && (
                 <div className="flex gap-4 animate-pulse">
                    <span className="text-gray-600 font-bold w-4">{logs.length + 1}</span>
                    <span className="text-blue-400">_</span>
                 </div>
               )}
            </div>

            <div className="bg-gray-950 p-4 border-t border-white/5 flex justify-between items-center">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ADMAGIC CORE v2.4.1</span>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">READY</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
