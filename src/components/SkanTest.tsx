import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Terminal, 
  Settings, 
  Zap, 
  Code2, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight,
  Database,
  Cpu
} from "lucide-react";
import { useAuth } from "../AuthContext";

export default function SkanTest() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulating real-time postback feed
    const MOCK_LOGS = [
      { id: '1', timestamp: '2 mins ago', appId: 'com.admagic.app', cv: 12, adNetworkId: 'skan123', status: 'Decoded' },
      { id: '2', timestamp: '5 mins ago', appId: 'com.client.game', cv: 45, adNetworkId: 'google-ads', status: 'Simulated' },
      { id: '3', timestamp: '12 mins ago', appId: 'com.retail.shop', cv: null, adNetworkId: 'meta-ads', status: 'Invalid Signature' }
    ];
    setLogs(MOCK_LOGS);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">SKAdNetwork Test Suite</h2>
          <p className="text-sm text-[#64748b]">Validate and decode iOS 14+ conversion value postbacks locally.</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Settings className="w-4 h-4 mr-2" /> Global SKAN Config
          </button>
          <button className="btn-primary flex items-center bg-[#1e293b] text-white">
            <Zap className="w-4 h-4 mr-2" /> Simulate Postback
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#1ea4d9]" />
                <h3 className="text-[11px] font-bold text-[#1e293b] uppercase tracking-widest">Postback Activity Log</h3>
              </div>
              <button className="text-[#1ea4d9] p-1.5 hover:bg-[#f1f5f9] rounded transition-all">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="trackier-table">
                <thead>
                  <tr>
                    <th className="text-left font-mono text-[10px] text-[#94a3b8]">SOURCE_ID</th>
                    <th className="text-left font-mono text-[10px] text-[#94a3b8]">BUNDLE_ID</th>
                    <th className="text-center font-mono text-[10px] text-[#94a3b8]">CV</th>
                    <th className="text-left font-mono text-[10px] text-[#94a3b8]">TIMESTAMP</th>
                    <th className="text-right font-mono text-[10px] text-[#94a3b8]">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f8fafc] group">
                      <td className="font-bold text-[#1e293b]">{log.adNetworkId}</td>
                      <td className="text-xs text-[#64748b] font-medium">{log.appId}</td>
                      <td className="text-center">
                        <span className="bg-[#f0f9ff] text-[#1ea4d9] px-2 py-0.5 rounded text-[10px] font-bold border border-[#1ea4d9]/20">
                          {log.cv ?? '??'}
                        </span>
                      </td>
                      <td className="text-[10px] text-[#94a3b8]">{log.timestamp}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end">
                          {log.status === 'Decoded' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-1.5" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-orange-500 mr-1.5" />
                          )}
                          <span className={`text-[10px] font-bold uppercase ${log.status === 'Decoded' ? 'text-green-700' : 'text-orange-700'}`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel bg-[#0c0c0c] text-[#bfff00] font-mono p-6">
            <div className="flex items-center space-x-2 mb-4 border-b border-[#bfff00]/20 pb-2">
              <Code2 className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">Postback Decoder Engine v1.0</span>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-[#888888]">// Decoded SKAN Response Payload</p>
              <p>{"{"}</p>
              <p className="pl-4">"version": <span className="text-white">"3.0"</span>,</p>
              <p className="pl-4">"ad-network-id": <span className="text-white">"skan123"</span>,</p>
              <p className="pl-4">"transaction-id": <span className="text-white">"aff98-23j-920"</span>,</p>
              <p className="pl-4">"app-id": <span className="text-white">920384210</span>,</p>
              <p className="pl-4">"attribution-signature": <span className="text-white">"MEUCIQD..."</span>,</p>
              <p className="pl-4">"conversion-value": <span className="text-white">12</span>,</p>
              <p className="pl-4">"fidelity-type": <span className="text-white">1</span></p>
              <p>{"}"}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="panel space-y-4">
            <h3 className="panel-label">Postback URL Configuration</h3>
            <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
              <p className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-widest mb-2">Production Endpoint</p>
              <code className="text-[10px] break-all text-[#1ea4d9]">https://admagic.track/api/v1/skan/postback</code>
              <button className="mt-2 text-[10px] font-bold text-[#1ea4d9] hover:underline flex items-center">
                Copy Endpoint <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

          <div className="panel space-y-4">
            <h3 className="panel-label">Live Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-[#f1f5f9] rounded flex flex-col items-center">
                <Database className="w-4 h-4 text-[#94a3b8] mb-2" />
                <span className="text-lg font-bold text-[#1e293b]">1,284</span>
                <span className="text-[9px] font-bold text-[#94a3b8] uppercase">Processed</span>
              </div>
              <div className="p-4 bg-white border border-[#f1f5f9] rounded flex flex-col items-center">
                <Cpu className="w-4 h-4 text-[#94a3b8] mb-2" />
                <span className="text-lg font-bold text-[#1e293b]">98.2%</span>
                <span className="text-[9px] font-bold text-[#94a3b8] uppercase">Decoded</span>
              </div>
            </div>
          </div>

          <div className="panel bg-[#f0f9ff] border-[#1ea4d9]/30">
            <h4 className="text-xs font-bold text-[#1e293b] mb-2 flex items-center">
              <Smartphone className="w-3.5 h-3.5 mr-2 text-[#1ea4d9]" /> iOS Testing Guide
            </h4>
            <ul className="text-[11px] text-[#64748b] space-y-2 list-disc pl-4">
              <li>Ensure the app is running in <span className="text-[#1e293b] font-bold">Sandbox</span> mode.</li>
              <li>Conversion values must be set via <span className="text-mono">updatePostbackConversionValue</span>.</li>
              <li>Wait 24-48h for regional rolling nodes to emit postback signals.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
