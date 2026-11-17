import React from 'react';

export function InventoryTab({ products, updateProduct }) {
  return (
<div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border)]/15 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-[var(--border)]/10 pb-4">
              <div>
                <h2 className="text-lg font-black uppercase text-[var(--foreground)]">
                  Real-Time Inventory & Stock Matrix
                </h2>
                <p className="text-xs text-[var(--foreground)]/60 font-sans">
                  Automatic deduction on verified orders with instant restock triggers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (<div key={p.id} className="p-4 rounded-2xl border border-[var(--border)]/15 bg-[var(--background)] space-y-3 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-[var(--border)]/10"/>
                    <div>
                      <h4 className="text-xs font-black uppercase text-[var(--foreground)]">{p.name}</h4>
                      <p className="text-[10px] text-[var(--secondary-foreground)] font-bold">{p.weight}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border)]/10 pt-2 text-xs">
                    <span className="font-bold text-[var(--foreground)]/70">Units in Pouch:</span>
                    <span className={`font-black text-sm ${p.stockCount < 20 ? 'text-amber-700' : 'text-[var(--foreground)]'}`}>
                      {p.stockCount} Bags
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => updateProduct(p.id, { stockCount: p.stockCount + 50, inStock: true })} className="flex-1 py-1.5 bg-[var(--primary)] text-white text-[10px] font-black uppercase rounded-lg hover:bg-[var(--primary)]/90">
                      +50 Restock
                    </button>
                    <button onClick={() => updateProduct(p.id, { stockCount: Math.max(0, p.stockCount - 10) })} className="px-3 py-1.5 bg-white border border-[var(--border)]/20 text-[var(--foreground)] text-[10px] font-black uppercase rounded-lg hover:bg-gray-50">
                      -10
                    </button>
                  </div>
                </div>))}
            </div>
          </div>
  );
}
