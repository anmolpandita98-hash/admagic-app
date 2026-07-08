import React, { useState, useEffect } from "react";
import { HelpCircle, Terminal, Server, Key, Plus, Trash2, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

import { api } from "../../lib/api";

export default function FTPUploads() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNode, setNewNode] = useState({ host: "", port: 21, user: "", password: "" });

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      // Re-using integrations endpoint or hypothetical ftp one
      const { data } = await api.get("/api/automation/integrations");
      setNodes(data.filter((i: any) => i.type === "FTP" || i.type === "SFTP"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = async () => {
    try {
      await api.post("/api/automation/integrations", { 
        name: newNode.host, 
        type: newNode.port === 22 ? "SFTP" : "FTP",
        config: newNode,
        status: "Connected" 
      });
      setShowAddModal(false);
      fetchNodes();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">FTP Distribution Nodes</h2>
          <p className="text-gray-500 mt-1">Configure secure data pipelines for automated conversion file exports.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-gray-200"
        >
          <Plus className="w-4 h-4" />
          Add Node
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
               <Server className="w-5 h-5 text-blue-600" />
               New Cluster Node
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Hostname</label>
                  <input 
                    type="text" 
                    value={newNode.host}
                    onChange={(e) => setNewNode({...newNode, host: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
                    placeholder="ftp.yourserver.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Port</label>
                  <input 
                    type="number" 
                    value={newNode.port}
                    onChange={(e) => setNewNode({...newNode, port: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Username</label>
                  <input 
                    type="text" 
                    value={newNode.user}
                    onChange={(e) => setNewNode({...newNode, user: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Key/Pass</label>
                  <input 
                    type="password" 
                    value={newNode.password}
                    onChange={(e) => setNewNode({...newNode, password: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors text-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddNode}
                className="flex-1 px-4 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-lg shadow-gray-200"
              >
                Provision Node
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
               <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                 <Server className="w-4 h-4 text-gray-400" />
                 Active Transfer Clusters
               </h3>
               <button className="text-xs font-bold text-blue-600 hover:underline">PROTOCOL LOGS</button>
            </div>
            
            <div className="divide-y divide-gray-50 uppercase tracking-tighter font-mono text-[11px]">
               {nodes.map(node => (
                 <div key={node.id} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-10">
                       <div className="space-y-0.5">
                          <p className="text-gray-900 font-black flex items-center gap-2">
                             {node.host}
                             <span className="text-gray-400 font-bold">:{node.port}</span>
                          </p>
                          <p className="text-gray-400 font-bold">USER: {node.user}</p>
                       </div>
                       <div className="hidden md:block">
                          <p className="text-gray-400 font-bold">LAST SYNC</p>
                          <p className="text-gray-900 font-black">{node.lastSync}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <span className={`px-2 py-1 rounded font-black ${
                         node.status === "Connected" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                       }`}>
                         {node.status}
                       </span>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-8">
            <h4 className="font-extrabold text-gray-900 flex items-center gap-2 uppercase tracking-widest text-[10px]">
               <Key className="w-4 h-4 text-amber-500" />
               Security Protocols
            </h4>

            <div className="space-y-6">
               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">ENFORCE SFTP (SSH)</span>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" /></div>
               </div>
               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">IP WHITELISTING</span>
                  <div className="w-10 h-5 bg-blue-600 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" /></div>
               </div>
               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">64-BIT ENCRYPTION</span>
                  <div className="w-10 h-5 bg-gray-200 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5" /></div>
               </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-start gap-4">
               <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
               <p className="text-[10px] font-bold text-amber-800 leading-relaxed italic uppercase">
                  Important: Ensure port 22 is open in your network firewall to allow AdMagic export nodes to connect.
               </p>
            </div>
         </div>
      </div>

      <div className="bg-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-gray-200">
          <Terminal className="w-12 h-12 text-gray-300" />
          <h4 className="font-black text-gray-900 uppercase tracking-widest text-sm">Transfer Manifest</h4>
          <p className="text-center text-xs font-bold text-gray-400 max-w-md leading-relaxed">
            Configure how data is formatted during transfer. You can customize CSV headers, date formats, and file naming conventions.
          </p>
          <button className="text-xs font-black text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-xl transition-all uppercase border border-blue-100">Configure Manifest Template</button>
      </div>
    </div>
  );
}
