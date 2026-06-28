import React, { useState, useEffect } from "react";
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Settings,
  Tag
} from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export default function CouponCodes() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: "",
    campaignId: "",
    type: "GENERIC",
    status: "Active",
    payoutOverride: 0,
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    if (!user) return;
    
    // Fetch Coupons
    const q = query(collection(db, "coupons"), where("createdBy", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Fetch Campaigns for dropdown
    const qCamp = query(collection(db, "campaigns"), where("createdBy", "==", user.uid));
    getDocs(qCamp).then(snapshot => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "coupons"), {
        ...formData,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setFormData({
        code: "",
        campaignId: "",
        type: "GENERIC",
        status: "Active",
        payoutOverride: 0,
        startDate: "",
        endDate: ""
      });
    } catch (e) {
      console.error("Error adding coupon:", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Coupon Codes + Deals</h2>
          <p className="text-sm text-[#64748b]">Manage promotional codes and exclusive merchant deals.</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Upload className="w-4 h-4 mr-2" /> Import CSV
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Coupon
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="panel border-[#1ea4d9] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#f1f5f9]">
            <h3 className="font-bold text-[#1e293b]">Create New Coupon Directive</h3>
            <button onClick={() => setShowAdd(false)} className="text-[#64748b] hover:text-[#1e293b]">✕</button>
          </div>
          <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="panel-label block mb-1">Coupon Code</label>
              <input 
                required
                type="text" 
                className="w-full border border-[#e2e8f0] rounded px-4 py-2 text-sm focus:border-[#1ea4d9] outline-none font-mono"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="PROMO2024"
              />
            </div>
            <div>
              <label className="panel-label block mb-1">Campaign</label>
              <select 
                required
                className="w-full border border-[#e2e8f0] rounded px-4 py-2 text-sm focus:border-[#1ea4d9] outline-none bg-white"
                value={formData.campaignId}
                onChange={e => setFormData({...formData, campaignId: e.target.value})}
              >
                <option value="">Select Campaign</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="panel-label block mb-1">Type</label>
              <select 
                className="w-full border border-[#e2e8f0] rounded px-4 py-2 text-sm focus:border-[#1ea4d9] outline-none bg-white font-medium"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="GENERIC">Generic (Global)</option>
                <option value="EXCLUSIVE">Exclusive (Restricted)</option>
                <option value="UNIQUE">Unique (One-time)</option>
              </select>
            </div>
            <div>
              <label className="panel-label block mb-1">Payout Override ($)</label>
              <input 
                type="number" step="0.01"
                className="w-full border border-[#e2e8f0] rounded px-4 py-2 text-sm focus:border-[#1ea4d9] outline-none"
                value={formData.payoutOverride}
                onChange={e => setFormData({...formData, payoutOverride: Number(e.target.value)})}
              />
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <button type="submit" className="btn-primary">Initialize Coupon</button>
            </div>
          </form>
        </div>
      )}

      <div className="panel !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input 
              type="text" 
              placeholder="Search coupons..." 
              className="w-full bg-white border border-[#e2e8f0] rounded pl-10 pr-4 py-2 text-sm focus:border-[#1ea4d9] outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary !py-2 !px-4 flex items-center text-xs">
              <Filter className="w-3.5 h-3.5 mr-2" /> All Types
            </button>
            <button className="btn-secondary !py-2 !px-4 flex items-center text-xs">
              <Download className="w-3.5 h-3.5 mr-2" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="trackier-table">
            <thead>
              <tr>
                <th className="text-left">COUPON CODE</th>
                <th className="text-left">CAMPAIGN</th>
                <th className="text-center">TYPE</th>
                <th className="text-center">PAYOUT OVERRIDE</th>
                <th className="text-center">STATUS</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon, i) => (
                <tr key={coupon.id} className="group hover:bg-[#f8fafc]">
                  <td>
                    <div className="flex items-center space-x-2">
                      <Tag className="w-3.5 h-3.5 text-[#1ea4d9]" />
                      <span className="font-mono font-bold text-[#1e293b]">{coupon.code}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-[#64748b]">
                      {campaigns.find(c => c.id === coupon.campaignId)?.title || "Unknown Campaign"}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 border border-[#e2e8f0] rounded bg-[#f8fafc] text-[#64748b]">
                      {coupon.type}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="font-bold text-[#16a34a]">
                      {coupon.payoutOverride > 0 ? `+$${coupon.payoutOverride}` : "--"}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="ml-1 text-[10px] font-bold text-green-700 uppercase">{coupon.status}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="p-2 hover:bg-white border hover:border-[#e2e8f0] rounded-md text-[#64748b] transition-all opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-[#94a3b8] text-sm italic">
                    <div className="flex flex-col items-center">
                      <Ticket className="w-10 h-10 mb-4 opacity-20" />
                      No promotional codes archived. Regional nodes are ready for entry.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
