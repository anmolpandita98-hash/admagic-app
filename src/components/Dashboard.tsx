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
        <div>
          <span className="text-xs font-bold text-[#64748b] tracking-wider uppercase">{label}</span>
          <span className="text-[9px] font-bold text-[#94a3b8] uppercase"> (UTC)</span>
        </div>
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

const EMPTY_WINDOW = { clicks: 0, conversions: 0, revenue: 0, payout: 0, profit: 0 };
const EMPTY_SUMMARY = {
  today: { ...EMPTY_WINDOW },
  yesterday: { ...EMPTY_WINDOW },
  mtd: { ...EMPTY_WINDOW },
};

// Deep-merge an API summary response against EMPTY_SUMMARY so that any
// null / undefined window from the server never reaches the render layer.
const mergeSummary = (raw: any) => ({
  today: { ...EMPTY_WINDOW, ...(raw?.today ?? {}) },
  yesterday: { ...EMPTY_WINDOW, ...(raw?.yesterday ?? {}) },
  mtd: { ...EMPTY_WINDOW, ...(raw?.mtd ?? {}) },
});

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [daily, setDaily] = useState([]);
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
        setSummary(mergeSummary(s.data));
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
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Dashboard</h2>
          <p className="text-sm text-[#64748b]">Performance overview across all channels (times in UTC).</p>
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <span>Actions</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="panel text-center py-12">
          <div className="text-[#94a3b8] text-sm">Loading performance data...</div>
        </div>
      ) : allZero ? (
        <div className="panel text-center py-12">
          <BarChart3 className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#1e293b] mb-2">No traffic yet</h3>
          <p className="text-sm text-[#64748b]">Create a campaign and send a test click to see live numbers here.</p>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
          <div className="panel">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#64748b] tracking-wider uppercase">DAILY DATA (last 7 days, UTC)</h3>
              <Link to="/reports" className="text-xs font-bold text-[#1ea4d9] hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#f1f5f9]">
                    <th className="text-left py-2 px-3 font-bold text-[#94a3b8] uppercase tracking-wider">DATE</th>
                    <th className="text-center py-2 px-3 font-bold text-[#94a3b8] uppercase tracking-wider">CLICKS</th>
                    <th className="text-center py-2 px-3 font-bold text-[#94a3b8] uppercase tracking-wider">CONVERSIONS</th>
                    <th className="text-center py-2 px-3 font-bold text-[#94a3b8] uppercase tracking-wider">CR %</th>
                    <th className="text-center py-2 px-3 font-bold text-[#94a3b8] uppercase tracking-wider">PAYOUT</th>
                    <th className="text-center py-2 px-3 font-bold text-[#94a3b8] uppercase tracking-wider">REVENUE</th>
                    <th className="text-center py-2 px-3 font-bold text-[#94a3b8] uppercase tracking-wider">PROFIT</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-[#94a3b8]">No data</td></tr>
                  ) : daily.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-[#f8fafc] hover:bg-[#f8fafc]">
                      <td className="py-2 px-3 font-medium text-[#1e293b]">{row.date}</td>
                      <td className="text-center py-2 px-3">
                        <span className="bg-[#e0f2fe] text-[#0369a1] px-2 py-0.5 rounded text-[11px] font-bold">{row.clicks}</span>
                      </td>
                      <td className="text-center py-2 px-3">{row.approved_conversions}</td>
                      <td className="text-center py-2 px-3">{(row.cr || 0).toFixed(2)}</td>
                      <td className="text-center py-2 px-3">{usd(row.payout)}</td>
                      <td className="text-center py-2 px-3">{usd(row.revenue)}</td>
                      <td className="text-center py-2 px-3">{usd(row.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* AI Labs Link */}
      <div className="panel bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#1ea4d9]" />
              <h4 className="font-bold">Neural Intelligence Lab</h4>
            </div>
            <p className="text-sm text-[#94a3b8]">AI-driven bid adjustments are currently optimizing your active campaigns.</p>
          </div>
          <Link to="/ai-insights" className="btn-primary flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Launch AI Lab</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
