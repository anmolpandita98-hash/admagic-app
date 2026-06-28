import React, { useState, useEffect } from "react";
import { Layout as LayoutIcon, ShoppingBag, ShoppingCart, RefreshCcw, Plus, Package, Database, CheckCircle2, AlertCircle } from "lucide-react";

import axios from "axios";

export default function Ecommerce() {
  const [storeType, setStoreType] = useState("Shopify");
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data } = await axios.get("/api/automation/ecommerce");
      setStores(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axios.post("/api/automation/ecommerce", { type: storeType, domain: `${storeType.toLowerCase()}-store.myshopify.com` });
      fetchStores();
      alert(`${storeType} synced successfully!`);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">E-Commerce Automation</h2>
          <p className="text-gray-500 mt-1">Connect your store product feeds and automate SKU-level tracking.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-orange-100 disabled:opacity-50"
        >
          {syncing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {syncing ? "Syncing Feed..." : "Sync New Store"}
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-8">
           {["Shopify", "WooCommerce", "Magento", "BigCommerce"].map(store => (
              <button 
                key={store}
                onClick={() => setStoreType(store)}
                className={`px-6 py-3 rounded-2xl font-bold border-2 transition-all ${
                  storeType === store 
                    ? "border-orange-500 bg-orange-50 text-orange-600 shadow-md" 
                    : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200"
                }`}
              >
                {store}
              </button>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
           <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                 <ShoppingBag className="w-6 h-6 text-orange-500" />
                 {storeType} Integration Node
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                Our {storeType} connector allows you to automatically import product variants, track abandoned carts, and sync fulfillment status in real-time.
              </p>
              
              <div className="space-y-3">
                 {[
                   "Automatic SKU-to-Campaign mapping",
                   "Dynamic Add-to-Cart events",
                   "Refund & Chargeback auto-reversal",
                   "Multi-currency payout conversion",
                 ].map(feat => (
                   <div key={feat} className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                      </div>
                      {feat}
                   </div>
                 ))}
              </div>

              <div className="pt-6">
                 <button 
                  onClick={handleSync}
                  className="w-full lg:w-auto px-8 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
                 >
                    <Database className="w-5 h-5" />
                    AUTHORIZE {storeType.toUpperCase()} FEED
                 </button>
              </div>
           </div>

           <div className="bg-gray-50 rounded-3xl p-8 space-y-6 border border-gray-100">
              <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Active Store Nodes</h4>
              
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {stores.map((s: any) => (
                   <div key={s.id} className="p-4 bg-white rounded-2xl border border-gray-200 flex justify-between items-center group cursor-pointer hover:border-orange-300 transition-all">
                      <div className="flex items-center gap-4">
                         <ShoppingCart className="w-5 h-5 text-orange-400" />
                         <span className="font-bold text-gray-700 truncate max-w-[150px]">{s.domain}</span>
                      </div>
                      <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded tracking-widest uppercase">SYNCED</span>
                   </div>
                ))}
                {stores.length === 0 && (
                   <div className="text-center py-4 text-gray-400 text-xs font-bold italic">No stores authorized yet.</div>
                )}
              </div>
           </div>
           <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 mt-6 md:col-span-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-amber-800 leading-relaxed italic">
                 Note: E-commerce automation requires the AdMagic Storefront SDK to be installed in your theme's footer.
              </p>
           </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
         <h3 className="font-extrabold text-gray-900 mb-6 uppercase tracking-wider text-sm">Product Catalog Nodes</h3>
         <div className="flex items-center justify-center p-20 border-2 border-dashed border-gray-100 rounded-3xl">
            <div className="text-center space-y-4">
               <Package className="w-12 h-12 text-gray-200 mx-auto" />
               <p className="text-sm font-bold text-gray-400">Fetch catalog products to see individual performance metrics.</p>
               <button className="text-xs font-black text-blue-600 hover:underline tracking-widest uppercase">Scan Store Inventory</button>
            </div>
         </div>
      </div>
    </div>
  );
}
