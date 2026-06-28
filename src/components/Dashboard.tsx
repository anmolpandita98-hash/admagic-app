import React, { useState, useEffect } from "react";
import { 
  Users, 
  Target as TargetIcon, 
  Zap, 
  BarChart3,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

const MOCK_STATS = [
  {
    label: "REVENUE",
    icon: DollarSign,
    data: {
      today: { val: "₹ 14.38K", sub: "$ 63" },
      yesterday: { val: "₹ 21.68K", sub: "$ 83" },
      mtd: { val: "₹ 238.83K", sub: "$ 420" }
    }
  },
  {
    label: "CONVERSIONS",
    icon: CheckCircle2,
    data: {
      today: { val: "3", sub: "" },
      yesterday: { val: "14", sub: "" },
      mtd: { val: "46", sub: "" }
    }
  },
  {
    label: "PAYOUT",
    icon: Users,
    data: {
      today: { val: "₹ 895.5", sub: "$ 18" },
      yesterday: { val: "₹ 1.48K", sub: "$ 38" },
      mtd: { val: "₹ 15.82K", sub: "$ 195" }
    }
  },
  {
    label: "PROFIT",
    icon: TrendingUp,
    data: {
      today: { val: "₹ 13.48K", sub: "$ 45" },
      yesterday: { val: "₹ 20.64K", sub: "$ 45" },
      mtd: { val: "₹ 222.7K", sub: "$ 300" }
    }
  }
];

const HOURLY_DATA = [
  { hour: "12 am - 1 am", clicks: 20, conversions: 0, cr: "0", epc: "€ 0.315", payout: "€ 1.68", revenue: "€ 5.88", profit: "€ 4.2" },
  { hour: "1 am - 2 am", clicks: 442, conversions: 0, cr: "0", epc: "€ 0.141", payout: "€ 6.36", revenue: "€ 58.04", profit: "€ 51.68" },
  { hour: "2 am - 3 am", clicks: 689, conversions: 0, cr: "0", epc: "€ 0.102", payout: "€ 9.55", revenue: "€ 65.84", profit: "€ 56.29" },
  { hour: "3 am - 4 am", clicks: 95, conversions: 0, cr: "0", epc: "€ 0.006", payout: "€ 0.3", revenue: "€ 0.56", profit: "€ 0.26" },
  { hour: "4 am - 5 am", clicks: 183, conversions: 0, cr: "0", epc: "€ 0.001", payout: "€ 0.08", revenue: "€ 0.14", profit: "€ 0.06" },
  { hour: "5 am - 6 am", clicks: 315, conversions: 0, cr: "0", epc: "€ 0.047", payout: "€ 0.6", revenue: "€ 13.87", profit: "€ 13.27" }
];

const StatCard = ({ stat }: { stat: any }) => (
  <div className="panel flex flex-col h-full">
    <div className="flex items-center space-x-2 mb-4 border-b border-[#f1f5f9] pb-4">
      <div className="p-2 bg-[#f8fafc] rounded text-[#1ea4d9]">
        <stat.icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-bold text-[#64748b] tracking-wider uppercase">{stat.label}</span>
    </div>

    <div className="grid grid-cols-3 gap-4 flex-1">
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase font-bold text-[#94a3b8] mb-1 text-center">Today</span>
        <span className="text-sm font-bold text-[#1e293b]">{stat.data.today.val}</span>
        {stat.data.today.sub && <span className="text-[10px] text-[#64748b]">{stat.data.today.sub}</span>}
      </div>
      <div className="flex flex-col items-center border-x border-[#f1f5f9]">
        <span className="text-[10px] uppercase font-bold text-[#94a3b8] mb-1 text-center">Yesterday</span>
        <span className="text-sm font-bold text-[#1e293b]">{stat.data.yesterday.val}</span>
        {stat.data.yesterday.sub && <span className="text-[10px] text-[#64748b]">{stat.data.yesterday.sub}</span>}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] uppercase font-bold text-[#94a3b8] mb-1 text-center">MTD</span>
        <span className="text-sm font-bold text-[#1e293b]">{stat.data.mtd.val}</span>
        {stat.data.mtd.sub && <span className="text-[10px] text-[#64748b]">{stat.data.mtd.sub}</span>}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Dashboard</h2>
          <p className="text-sm text-[#64748b]">Performance overview across all channels.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-primary">
            Actions <ChevronDown className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard stat={MOCK_STATS[0]} />
        <StatCard stat={MOCK_STATS[1]} />
        <StatCard stat={MOCK_STATS[2]} />
        <StatCard stat={MOCK_STATS[3]} />
      </div>

      {/* Hourly Data Table */}
      <div className="panel !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex justify-between items-center bg-[#f8fafc]">
          <h3 className="text-sm font-bold text-[#1e293b] uppercase tracking-wider">HOURLY DATA</h3>
          <button className="text-[#1ea4d9] text-xs font-bold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="trackier-table">
            <thead>
              <tr>
                <th className="text-left">HOUR</th>
                <th className="text-center">CLICKS</th>
                <th className="text-center">CONVERSIONS</th>
                <th className="text-center">CR %</th>
                <th className="text-center">EPC</th>
                <th className="text-center">PAYOUT</th>
                <th className="text-center">REVENUE</th>
                <th className="text-center">PROFIT</th>
              </tr>
            </thead>
            <tbody>
              {HOURLY_DATA.map((row, i) => (
                <tr key={i}>
                  <td className="font-medium">{row.hour}</td>
                  <td className="text-center">
                    <span className="bg-[#e0f2fe] text-[#0369a1] px-2 py-0.5 rounded text-[11px] font-bold">
                      {row.clicks}
                    </span>
                  </td>
                  <td className="text-center font-medium">{row.conversions}</td>
                  <td className="text-center text-[#64748b]">{row.cr}</td>
                  <td className="text-center text-[#64748b]">{row.epc}</td>
                  <td className="text-center text-[#f97316] font-medium">{row.payout}</td>
                  <td className="text-center text-[#16a34a] font-medium">{row.revenue}</td>
                  <td className="text-center font-bold text-[#1e293b]">{row.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
