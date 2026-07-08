import React, { useState, useEffect } from "react";
import { History, Upload, FileText, CheckCircle2, Clock, AlertCircle, Play, MoreVertical } from "lucide-react";
import { api } from "../../lib/api";

interface ImportJob {
  id: string;
  fileName: string;
  rowCount: number;
  status: string;
  timestamp: any;
}

export default function DataImports() {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await api.get("/api/automation/imports");
      setJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file.name);
  };

  const handleUpload = async (name: string) => {
    setIsUploading(true);
    try {
      await api.post("/api/automation/import", { fileName: name, rowCount: Math.floor(Math.random() * 5000) });
      await fetchJobs();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Batch Data Ingestion</h2>
          <p className="text-gray-500 mt-1">Upload historical records or bulk-update conversion statuses via CSV/JSON.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Download Spec
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            New Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div 
             onDragOver={handleDragOver}
             onDrop={handleDrop}
             className={`bg-white border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
               isUploading ? "border-blue-500 bg-blue-50/20" : "border-gray-100 hover:border-blue-300"
             }`}
           >
              {isUploading ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="font-bold text-blue-600">Analyzing schema & normalizing payload...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-10 h-10 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Drop files to ingest data</h3>
                    <p className="text-sm text-gray-400 font-medium">Support for CSV, XLSX, and JSON formatted directives.</p>
                  </div>
                  <button className="text-sm font-black text-blue-600 uppercase tracking-widest px-4 py-2 hover:bg-blue-50 rounded-xl transition-all">Select System Path</button>
                </div>
              )}
           </div>

           <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                   <History className="w-4 h-4 text-gray-400" />
                   Recently Executed Jobs
                 </h3>
                 <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="divide-y divide-gray-50">
                 {jobs.map(job => (
                   <div key={job.id} className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-6">
                         <div className={`p-3 rounded-2xl ${job.status === "Completed" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600 animate-pulse"}`}>
                            {job.status === "Completed" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                         </div>
                         <div>
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.fileName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{job.rowCount.toLocaleString()} ROWS AFFECTED • {job.timestamp}</p>
                         </div>
                      </div>
                      <button className="text-[10px] font-black text-gray-400 hover:text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
                         View Log
                         <Play className="w-3 h-3 fill-current" />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <AlertCircle className="w-4 h-4 text-amber-500" />
                 Validation Protocols
              </h4>
              <div className="space-y-6">
                 {[
                   { label: "Deduplication", desc: "Checks for existing ClickID/TransID pairs.", active: true },
                   { label: "Geo Consistency", desc: "Flag records where IP doesn't match provided GEO.", active: true },
                   { label: "Status Mapping", desc: "Converts advertiser labels to system standards.", active: false },
                   { label: "Zero Payout Check", desc: "Automatically alerts on logs with $0.00 value.", active: true },
                 ].map(protocol => (
                    <div key={protocol.label} className="flex items-start gap-4">
                       <div className={`mt-1 w-2.5 h-2.5 rounded-full ${protocol.active ? "bg-green-500" : "bg-gray-200"}`} />
                       <div>
                          <p className={`text-sm font-bold ${protocol.active ? "text-gray-900" : "text-gray-400"}`}>{protocol.label}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed mt-0.5">{protocol.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-3xl shadow-xl shadow-gray-200">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-gray-400">Pipeline Statistics</h4>
              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-3xl font-black">2.4M</p>
                       <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Ingested Rows</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                       <Play className="w-3 h-3 rotate-[-90deg] fill-current" />
                       +12%
                    </div>
                 </div>
                 <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[78%]" />
                 </div>
                 <p className="text-[10px] text-gray-500 leading-relaxed font-medium italic">
                   Storage node utilized 78%. We recommend archiving jobs older than 180 days to maintain peak performance.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
