'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function DemoInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  
  // Form State
  const [newItem, setNewItem] = useState({ name: '', sku: '', stockLevel: 0, price: 0 });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem('demo_merchant_id');
    if (!id) {
      router.push('/demo-merchant/login');
      return;
    }
    setMerchantId(id);
    fetchInventory(id);
  }, [router]);

  const fetchInventory = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/demo/inventory?demoMerchantId=${id}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantId) return;
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      const res = await fetch('/api/demo/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, demoMerchantId: merchantId })
      });
      const data = await res.json();
      
      if (res.ok) {
        setItems([data.item, ...items]);
        setShowAddModal(false);
        setNewItem({ name: '', sku: '', stockLevel: 0, price: 0 });
      } else {
        setFormError(data.error || 'Failed to add item');
      }
    } catch (err) {
      setFormError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      const res = await fetch('/api/demo/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stockLevel: Math.max(0, newStock) })
      });
      if (res.ok) {
        setItems(items.map(item => item.id === id ? { ...item, stock_level: Math.max(0, newStock) } : item));
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const sku = result[0].rawValue;
      // In a real app, we'd search for this SKU and maybe highlight it or increment stock
      // For the demo, we'll auto-fill the Add Modal if it's open, OR find and highlight
      const existingProduct = items.find(item => item.sku === sku);
      if (existingProduct) {
        // Highlight logic or just alert
        alert(`Found Product: ${existingProduct.name} (Stock: ${existingProduct.stock_level})`);
        setShowScanModal(false);
      } else {
        // Not found, open add modal with SKU
        setNewItem({ ...newItem, sku });
        setShowScanModal(false);
        setShowAddModal(true);
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 font-sans pb-20 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] -mr-64 -mt-64 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] -ml-64 -mb-64 animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-6 py-6 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
             <Link href="/demo-merchant/dashboard" className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             </Link>
             <h1 className="text-xl font-black text-white tracking-tight">Inventory Management</h1>
          </div>
          <div className="flex gap-2">
              <button 
                onClick={() => setShowScanModal(true)}
                className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all shadow-sm border border-blue-500/10 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-8v4m8-4v4m-4-8v4m-4-4h4m6 0h1.062M4 17.182V17a4 4 0 014-4h0"></path></svg>
                Scan SKU
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="p-3 bg-white text-slate-950 rounded-xl hover:opacity-90 transition-all shadow-xl shadow-white/5 flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Add Stock
              </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {loading ? (
             <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
        ) : items.length === 0 ? (
             <div className="bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-20 border border-white/5 shadow-2xl text-center">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">No Items in Inventory</h2>
                <p className="text-slate-500 font-medium mb-8">Start by adding items manually or scanning their barcodes.</p>
                <button 
                   onClick={() => setShowAddModal(true)}
                   className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
                >
                    Add Your First Item
                </button>
             </div>
        ) : (
            <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Product Information</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">SKU / Barcode</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Current Stock</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-white">{item.name}</p>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">ID: {item.id.slice(0,8)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-slate-400 font-mono tracking-tighter">
                                            {item.sku || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleUpdateStock(item.id, item.stock_level - 1)}
                                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold hover:bg-red-500/20 transition-colors border border-red-500/10"
                                            >-</button>
                                            <span className={`font-black text-lg ${item.stock_level < 5 ? 'text-red-400' : 'text-white'}`}>
                                                {item.stock_level}
                                            </span>
                                            <button 
                                                onClick={() => handleUpdateStock(item.id, item.stock_level + 1)}
                                                className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center font-bold hover:bg-green-500/20 transition-colors border border-green-500/10"
                                            >+</button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-white">
                                        ${item.price.toFixed(2)}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-slate-700 hover:text-white transition-colors">
                                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 p-10 rounded-[3rem] w-full max-w-md relative z-10 shadow-2xl border border-white/10 animate-slide-up">
                <h3 className="text-2xl font-black text-white mb-2">Add New Product</h3>
                <p className="text-slate-500 font-medium mb-8">Enter your stock details manually.</p>
                
                <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Product Name</label>
                        <input
                            type="text"
                            required
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium text-white placeholder:text-slate-600 shadow-inner"
                            placeholder="e.g. 500ml Water"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">SKU / Barcode</label>
                            <input
                                type="text"
                                value={newItem.sku}
                                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium text-white placeholder:text-slate-600 shadow-inner"
                                placeholder="890123"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Stock Level</label>
                            <input
                                type="number"
                                required
                                value={newItem.stockLevel}
                                onChange={(e) => setNewItem({ ...newItem, stockLevel: parseInt(e.target.value) || 0 })}
                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium text-white shadow-inner"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Price (USD)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                            className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium text-white shadow-inner"
                        />
                    </div>

                    {formError && <p className="text-red-400 text-xs font-bold text-center">{formError}</p>}

                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="flex-1 py-4 text-slate-500 font-bold text-sm hover:text-slate-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-white/10 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Adding...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 p-10 rounded-[3rem] w-full max-w-md relative z-10 shadow-2xl border border-white/10 animate-slide-up">
                <h3 className="text-2xl font-black text-white mb-2">Scan Barcode</h3>
                <p className="text-slate-500 font-medium mb-8">Scan a product SKU to update stock instantly.</p>
                
                <div className="aspect-square bg-slate-950 rounded-[2.5rem] mb-8 overflow-hidden relative border-4 border-blue-500/20">
                    <Scanner
                        onScan={handleScan}
                        onError={(err) => console.error(err)}
                    />
                    <div className="absolute inset-0 border-2 border-blue-500/40 m-12 pointer-events-none rounded-3xl animate-pulse"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-scanner-line pointer-events-none"></div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowScanModal(false)}
                        className="w-full py-4 bg-white/5 text-slate-400 border border-white/5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                        Close Scanner
                    </button>
                </div>
            </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        @keyframes scanner-line {
            from { top: 20%; }
            to { top: 80%; }
        }
        .animate-scanner-line { animation: scanner-line 2s ease-in-out infinite alternate; }
      `}</style>
    </main>
  );
}
