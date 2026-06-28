import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Phone, 
  Mail,
  Users,
  ChevronDown
} from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

export default function Publishers() {
  const { user } = useAuth();
  const [publishers, setPublishers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    sendEmail: true
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "publishers"), where("createdBy", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPublishers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "publishers"), {
        ...formData,
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        sendEmail: true
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1e293b]">Publishers</h2>
          <p className="text-sm text-[#64748b]">Onboard and manage your traffic partners.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add New Publisher</>}
        </button>
      </div>

      {isAdding && (
        <div className="panel animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-[#1e293b] mb-6">Publisher Onboarding</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1 block">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full border border-[#e2e8f0] rounded px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1 block">Email Address</label>
                <input 
                  required
                  type="email" 
                  className="w-full border border-[#e2e8f0] rounded px-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                  <input 
                    required
                    type="text" 
                    className="w-full border border-[#e2e8f0] rounded pl-10 pr-4 py-2.5 text-sm focus:border-[#1ea4d9] outline-none"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-8">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[#1ea4d9] rounded border-[#e2e8f0]"
                    checked={formData.sendEmail}
                    onChange={e => setFormData({...formData, sendEmail: e.target.checked})}
                  />
                  <span className="text-sm text-[#475569]">Send registration confirmation email on creation</span>
                </label>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4 border-t border-[#f1f5f9] pt-6 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary px-8">Save Publisher</button>
            </div>
          </form>
        </div>
      )}

      <div className="panel !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input 
              type="text" 
              placeholder="Search publishers..." 
              className="w-full bg-white border border-[#e2e8f0] rounded pl-10 pr-4 py-1.5 text-sm focus:border-[#1ea4d9] outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="btn-secondary !py-1 !px-3 text-xs font-bold text-[#1ea4d9]">
              Export <ChevronDown className="ml-1 w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="trackier-table">
            <thead>
              <tr>
                <th className="text-left w-12">ID</th>
                <th className="text-left">Name</th>
                <th className="text-left">Email Address</th>
                <th className="text-left">Phone Number</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {publishers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((pub, i) => (
                <tr key={pub.id}>
                  <td className="text-[#64748b] text-xs">#{pub.id.slice(-4)}</td>
                  <td className="font-bold">{pub.name}</td>
                  <td className="text-[#64748b]">{pub.email}</td>
                  <td className="text-[#64748b]">{pub.phone}</td>
                  <td className="text-right">
                    <button className="text-[#94a3b8] hover:text-[#1ea4d9]">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {publishers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[#94a3b8] text-sm italic">
                    No publishers onboarded yet.
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
