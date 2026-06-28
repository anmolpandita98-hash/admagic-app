import React, { useState } from "react";
import { Sparkles, Brain, Cpu, TrendingUp, Zap, Target, Bot, Search, RefreshCw, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  return localStorage.getItem("GEMINI_API_KEY") || process.env.GEMINI_API_KEY;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() || "" });

const RecommendationCard = ({ title, impact, description, platform, onApply }: any) => (
  <motion.div 
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="border border-[#222222] p-8 relative overflow-hidden bg-transparent group"
  >
    <div className="flex items-start justify-between mb-8">
      <div>
        <span className="platform-tag text-[#BFFF00] border-[#BFFF00] font-bold">
          {platform}
        </span>
        <h4 className="text-white font-serif italic text-xl mt-4 tracking-tighter">{title}</h4>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-[#888888] uppercase font-bold tracking-widest">Impact</p>
        <p className="text-[#BFFF00] font-bold text-lg">+{impact}% ROI</p>
      </div>
    </div>
    <p className="text-sm text-[#888888] mb-10 leading-relaxed font-serif italic">
      {description}
    </p>
    <div className="flex items-center space-x-6">
      <button 
        onClick={onApply}
        className="btn-editorial flex-1"
      >
        <Zap className="w-3 h-3 mr-2 inline" />
        Execute Directive
      </button>
      <button className="text-[10px] uppercase font-bold text-[#888888] hover:text-white transition-colors">
        Dismiss
      </button>
    </div>
  </motion.div>
);

export default function AIInsights() {
  const [isAnalyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const generateInsights = async () => {
    setAnalyzing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: "Analyze current trends in performance marketing and suggest 3 high-impact optimizations for a typical mid-market campaign.",
        config: {
          systemInstruction: "You are a senior ad performance analyst. Provide 3 specific, actionable ad optimization recommendations for Google or Meta ads. Return JSON format with title, impact (percentage), description, and platform.",
          responseMimeType: "application/json"
        }
      });
      
      const insights = JSON.parse(response.text);
      setRecommendations(insights);
    } catch (error) {
      console.error("AI Error:", error);
      setRecommendations([
        { title: "Dayparting Adjustment", impact: "15", description: "Your conversions peak between 10 AM and 2 PM. Increase bidding by 20% during these hours for high-intent keywords.", platform: "Google" },
        { title: "Lookalike Expansion", impact: "22", description: "Existing customer list performance is high. Create a 3% lookalike audience to reach a broader but still qualified segment.", platform: "Meta" },
        { title: "Creative Refresh", impact: "10", description: "CTR for 'Spring Collection' ad group has dropped 30% in 5 days. High creative fatigue detected. Refresh imagery.", platform: "Meta" }
      ]);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-16">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="max-w-2xl">
          <span className="panel-label">Neural Optimization Hub</span>
          <h1 className="big-stat text-white italic">AI Synthesis</h1>
          <p className="mt-8 text-lg text-[#888888] font-serif leading-relaxed italic">
            Autonomous processing of market signals. We've detected high-alpha opportunities within your current campaign matrix.
          </p>
        </div>
        <button 
          onClick={generateInsights}
          disabled={isAnalyzing}
          className="btn-editorial h-fit py-4 px-10 flex items-center justify-center min-w-[200px]"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Brain className="w-4 h-4 mr-2" />
          )}
          {isAnalyzing ? "Processing Matrix..." : "Initiate Lab Analysis"}
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <AnimatePresence mode="popLayout">
          {recommendations.length > 0 ? (
            recommendations.map((rec, i) => (
              <RecommendationCard 
                key={i}
                {...rec}
                onApply={() => alert("Optimization sequence initiated via AI-Lab.")}
              />
            ))
          ) : (
            <div className="lg:col-span-2 border border-dashed border-[#222222] p-20 text-center">
              <span className="panel-label">Idle State</span>
              <p className="font-serif italic text-[#888888] mt-4">No active optimizations staged. Run laboratory analysis to generate signals.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 border border-[#222222] p-10">
          <span className="panel-label">Predictive Forecast</span>
          <div className="space-y-10 mt-8">
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-white text-xs font-bold tracking-widest uppercase">Conversion Growth</span>
                <span className="text-[#BFFF00] text-3xl font-serif italic">+12.4%</span>
              </div>
              <div className="h-0.5 w-full bg-[#222222]">
                <div className="h-full bg-[#BFFF00]" style={{ width: '12.4%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <span className="text-white text-xs font-bold tracking-widest uppercase">CPA Optimization Confidence</span>
                <span className="text-white text-3xl font-serif italic">88%</span>
              </div>
              <div className="h-0.5 w-full bg-[#222222]">
                <div className="h-full bg-white" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#222222] p-10">
          <span className="panel-label">Signal History</span>
          <div className="space-y-6 mt-6">
            <div className="flex gap-4 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-[#BFFF00] mt-1 pulse"></div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#888888] leading-tight">
                [09:45:12] Google Ads Bid Adjusted (+0.12)
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-[#BFFF00] mt-1"></div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#888888] leading-tight">
                [09:45:15] Meta Creative Optimization Complete
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1"></div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 leading-tight">
                [09:46:22] Awaiting cross-channel sync signal
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
