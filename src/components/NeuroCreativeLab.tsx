import React, { useState, useRef } from "react";
import { 
  Brain, 
  Upload, 
  Play, 
  BarChart3, 
  Activity, 
  Zap, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Glasses,
  Cpu,
  MonitorPlay
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";

export default function NeuroCreativeLab() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResults(null);
    }
  };

  const runAnalysis = async () => {
    if (!file) return;
    setAnalyzing(true);
    
    try {
      const fileData = await fileToBase64(file);
      const mimeType = file.type;

      const response = await axios.post("/api/creative-lab/neuro-analysis", {
        fileData,
        mimeType
      });

      setResults(response.data);
    } catch (error: any) {
      console.error("Neuro-analysis failed:", error);
      const errorMsg = error.response?.data?.error || error.message || "Unknown error";
      alert(`The neural bridge failed to stabilize: ${errorMsg}\nPlease try a different creative format.`);
    } finally {
      setAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-gray-200 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Neuro Lab <span className="text-blue-600">V2</span></h2>
          </div>
          <p className="text-gray-500 max-w-2xl font-medium">
            Proprietary creative intelligence powered by Meta's <span className="text-blue-600 font-bold">Tribe V2</span> research. 
            Analyze real-time brain activity and emotional stimulus for video and static assets.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
          <Activity className="w-3 h-3 text-green-500 animate-pulse" />
          Neural Link: Stable
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Pane */}
        <div className="lg:col-span-5 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
              previewUrl ? 'border-blue-200 bg-blue-50/20' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            {previewUrl ? (
              <>
                {file?.type.startsWith('video') ? (
                  <video src={previewUrl} className="w-full h-full object-cover" controls={false} autoPlay muted loop />
                ) : file?.type.startsWith('audio') ? (
                  <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8">
                    <Activity className="w-16 h-16 text-blue-500 animate-pulse mb-4" />
                    <p className="text-white font-black text-xs uppercase tracking-widest">Audio Stream Detected</p>
                  </div>
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-bold uppercase tracking-widest text-xs">Swap Creative</p>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Ingest Creative</p>
                <p className="text-xs text-gray-400 mt-2">MP4/WebM, Audio, or High-Res Static Assets</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="video/*,image/*,audio/*"
            />
          </div>

          <button
            onClick={runAnalysis}
            disabled={!file || analyzing}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
              analyzing 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:scale-[1.02]"
            }`}
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                Syncing Neurons...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-blue-300" />
                Initiate Neuro-Scan
              </>
            )}
          </button>

          <div className="bg-gray-900 rounded-3xl p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cpu className="w-24 h-24" />
            </div>
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MonitorPlay className="w-3 h-3" />
              Dataset: Tribe V2 v2.4.1
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Simulating fMRI and EEG response patterns based on large-scale multimodal transformers trained on creative-specific stimulus data.
            </p>
          </div>
        </div>

        {/* Results Pane */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!results && !analyzing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full border border-gray-100 rounded-3xl bg-white flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Glasses className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Awaiting Stimulus</h3>
                <p className="text-sm text-gray-400 mt-2 max-w-sm">
                  Upload a creative asset to see how the human brain processes your messaging in real-time.
                </p>
              </motion.div>
            )}

            {analyzing && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full border-2 border-blue-100 rounded-3xl bg-blue-50/30 flex flex-col items-center justify-center p-12 overflow-hidden relative"
              >
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                   {[...Array(5)].map((_, i) => (
                     <motion.div 
                        key={i}
                        className="h-px w-full bg-blue-400 absolute"
                        style={{ top: `${i * 25}%` }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: "linear" }}
                     />
                   ))}
                </div>
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 mx-auto relative overflow-hidden group">
                     <Brain className="w-10 h-10 text-blue-600 animate-pulse" />
                     <motion.div 
                        className="absolute bottom-0 left-0 h-1 bg-blue-600 w-full"
                        animate={{ scaleX: [0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                     />
                  </div>
                  <h3 className="text-xl font-black text-blue-900 uppercase tracking-tighter mb-2">Analyzing Sensory Input</h3>
                  <div className="space-y-2">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest animate-pulse">Mapping Attention Spikes...</p>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Cross-referencing Tribe V2 Databases</p>
                  </div>
                </div>
              </motion.div>
            )}

            {results && !analyzing && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Scoring Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Engagement Index</p>
                    <div className="flex items-end gap-3">
                      <span className="text-5xl font-black text-gray-900">{results.score}</span>
                      <span className="text-xs font-bold text-green-500 mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        88% Top Tier
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Emotional Valence</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${results.valence}%` }} 
                          className="h-full bg-blue-500" 
                        />
                      </div>
                      <span className="text-sm font-black text-gray-900">{results.valence}%</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-3 uppercase">Net Cognitive Satisfaction</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Primary Trigger</p>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-black text-gray-900 uppercase italic">Novelty Stimulus</span>
                    </div>
                  </div>
                </div>

                {/* Emotional Profile */}
                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Neural Emotional Profile</h4>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-bold text-blue-500 uppercase">Live Inference</span>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {Object.entries(results.emotionalProfile).map(([key, val]: [string, any]) => (
                      <div key={key} className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{key}</span>
                          <span className="text-[10px] font-black text-gray-900">{val}%</span>
                        </div>
                        <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: val / 100 }}
                            className="h-full bg-gray-900 origin-left"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specific Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm h-full">
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                         <Activity className="w-3.5 h-3.5 text-blue-600" />
                         Brain Wave Insights
                      </h4>
                      <ul className="space-y-4">
                        {results.neuroInsights.map((insight: string, i: number) => (
                          <li key={i} className="flex gap-4 items-start group">
                            <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                               <ChevronRight className="w-3 h-3 text-blue-600 group-hover:text-white" />
                            </div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{insight}</p>
                          </li>
                        ))}
                      </ul>
                   </div>

                   <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100 h-full">
                      <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                         <AlertCircle className="w-3.5 h-3.5" />
                         Neuro-Optimization
                      </h4>
                      <div className="space-y-4">
                        {results.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                             <p className="text-xs text-white/90 font-bold leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                {/* Timeline Spikes (Simulated if video) */}
                {results.attentionSpikes && results.attentionSpikes.length > 0 && (
                   <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Synchronized Attention Timeline</h4>
                      <div className="space-y-6">
                        {results.attentionSpikes.map((spike: any, i: number) => (
                          <div key={i} className="flex items-center gap-6 group">
                            <div className="text-[10px] font-black text-blue-500 font-mono w-10">{spike.time}</div>
                            <div className="flex-1 flex items-center gap-4">
                              <div className="flex-1 h-1 pr-12 relative overflow-hidden">
                                  <div className="h-full w-full bg-gray-800 rounded-full" />
                                  <div className="absolute inset-0 bg-blue-500/30 w-full transform -translate-x-[20%]" />
                              </div>
                              <div className="w-32 h-1 bg-yellow-500/20 rounded-full relative overflow-hidden">
                                 <motion.div 
                                    className="absolute inset-0 bg-yellow-500"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: `${spike.intensity - 100}%` }}
                                 />
                              </div>
                            </div>
                            <div className="text-[10px] font-bold text-gray-300 italic group-hover:text-blue-400 transition-colors">{spike.reason}</div>
                          </div>
                        ))}
                      </div>
                   </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
