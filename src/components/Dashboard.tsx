import React, { useState, useEffect } from "react";
import { 
  Users, 
  Zap, 
  BarChart3,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../AuthContext";

const usd = (n: number) =>
  `$${(Number.isFinite(n) ? n : 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const StatCard = ({ label, icon: Icon, today, yesterday, mtd, isCurrency }: any) => {
  const fmt = (n: number) => (isCurrency ? usd(n) : String(Number.isFinite(n) ? n : 0));
  return (
    <div className="panel flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4 border-b border-[#f1f5f9] pb-4">
        <div className="p-2 bg-[#f8fafc] rounded text-[#1ea4d9]">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-[#64748b] tracking-wider uppercase">{label}</span>
        <span className="text-[9px] font-bold text-[#94a3b8] uppercase">(UTC)</span>
      </div>
      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8] mb-1 text-center">Today</span>
          <span className="text-sm font-bold text-[#1e293b]">{fmt(today)}</span>
        </div>
        <div className="flex flex-col items-center border-x border-[#f1f5f9]">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8] mb-1 text-center">Yesterday</span>
          <span className="text-sm font-bold text-[#1e293b]">{fmt(yesterday)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8] mb-1 text-center">MTD</span>
          <span className="text-sm font-bold text-[#1e293b]">{fmt(mtd)}</span>
        </div>
      </div>
    </div>
  );
};

const EMPTY_SUMMARY = {
  today: { clicks: 0, conversions: 0, revenue: 0, payout: 0, profit: 0 },
  yesterday: { clicks: 0, conversions: 0, revenue: 0, payout: 0, profit: 0 },
  mtd: { clicks: 0, conversions: 0, revenue: 0, payout: 0, profit: 0 }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [daily, setDaily] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [s, b] = await Promise.all([
          api.get("/api/reports/summary"),
          api.get("/api/reports/breakdown", { params: { groupBy: "date" } })
        ]);
        if (!active) return;
        setSummary(s.data || EMPTY_SUMMARY);
        setDaily((b.data && b.data.rows) || []);
      } catch (e) {
        console.error("Failed to load dashboard reports:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const allZero =
    !loading &&
    summary.mtd.clicks === 0 &&
    summary.mtd.conversions === 0 &&
    summary.mtd.revenue === 0;

  return (
    <div className="space-y-8">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Dashboard</h2>
          <p className="text-sm text-[#64748b]">Performance overview across all channels (times in UTC).</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-primary">
            Actions <ChevronDown className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel flex items-center justify-center py-20 text-[#94a3b8] text-sm">
          <Zap className="w-4 h-4 mr-2 animate-pulse" /> Loading performance data...
        </div>
      ) : allZero ? (
        <div className="panel flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 className="w-10 h-10 text-[#cbd5e1] mb-4" />
          <p className="text-sm font-bold text-[#1e293b] mb-1">No traffic yet</p>
          <p className="text-xs text-[#64748b]">Create a campaign and send a test click to see live numbers here.</p>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="REVENUE" icon={DollarSign} isCurrency
              today={summary.today.revenue} yesterday={summary.yesterday.revenue} mtd={summary.mtd.revenue} />
            <StatCard label="CONVERSIONS" icon={CheckCircle2}
              today={summary.today.conversions} yesterday={summary.yesterday.conversions} mtd={summary.mtd.conversions} />
            <StatCard label="PAYOUT" icon={Users} isCurrency
              today={summary.today.payout} yesterday={summary.yesterday.payout} mtd={summary.mtd.payout} />
            <StatCard label="PROFIT" icon={TrendingUp} isCurrency
              today={summary.today.profit} yesterday={summary.yesterday.profit} mtd={summary.mtd.profit} />
          </div>

          {/* Daily Data Table (last 7 days, UTC) */}
          <div className="panel !p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8fafc]">
              <h3 className="text-sm font-bold text-[#1e293b] uppercase tracking-wider">DAILY DATA (last 7 days, UTC)</h3>
              <Link to="/reports" className="text-[#1ea4d9] text-xs font-bold hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="trackier-table">
                <thead>
                  <tr>
                    <th className="text-left">DATE</th>
                    <th className="text-center">CLICKS</th>
                    <th className="text-center">CONVERSIONS</th>
                    <th className="text-center">CR %</th>
                    <th className="text-center">PAYOUT</th>
                    <th className="text-center">REVENUE</th>
                    <th className="text-center">PROFIT</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-[#94a3b8] text-sm italic">No daily activity in this window.</td>
                    </tr>
                  ) : daily.map((row, i) => (
                    <tr key={i}>
                      <td className="font-medium">{row.date}</td>
                      <td className="text-center">
                        <span className="bg-[#e0f2fe] text-[#0369a1] px-2 py-0.5 rounded text-[11px] font-bold">
                          {row.clicks}
                        </span>
                      </td>
                      <td className="text-center font-medium">{row.approved_conversions}</td>
                      <td className="text-center text-[#64748b]">{(row.cr || 0).toFixed(2)}</td>
                      <td className="text-center text-[#f97316] font-medium">{usd(row.payout)}</td>
                      <td className="text-center text-[#16a34a] font-medium">{usd(row.revenue)}</td>
                      <td className="text-center font-bold text-[#1e293b]">{usd(row.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* AI Labs Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 panel flex items-center justify-between bg-gradient-to-r from-white to-[#f0f9ff] border-l-4 border-l-[#1ea4d9]">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#1ea4d9]/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#1ea4d9]" />
            </div>
            <div>
              <h4 className="font-bold text-[#1e293b]">Neural Intelligence Lab</h4>
              <p className="text-sm text-[#64748b]">AI-driven bid adjustments are currently optimizing your active campaigns.</p>
            </div>
          </div>
          <Link to="/ai-insights" className="btn-primary whitespace-nowrap">
            Launch AI Lab
          </Link>
        </div>
      </div>
    </div>
  );
}
