import React from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';

export function ProductsTab({ products, handleOpenNewProduct, handleOpenEditProduct, deleteProduct }) {
  return (
<div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border)]/15 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)]/10 pb-4">
              <div>
                <h2 className="text-lg font-black uppercase text-[var(--foreground)]">Product Catalog</h2>
                <p className="text-xs text-[var(--foreground)]/60 font-sans">
                  Manage pricing, weights, categories, stock, and photography.
                </p>
              </div>

              <button onClick={handleOpenNewProduct} className="px-6 py-2.5 bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-md hover:bg-[var(--primary)]/90">
                <Plus size={15}/>
                <span>Add New Makhana</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)]/10 text-[var(--foreground)]/60 font-black uppercase tracking-wider">
                    <th className="py-2.5">Product</th>
                    <th>Category</th>
                    <th>Weight</th>
                    <th>Price</th>
                    <th>Stock Level</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--primary)]/10 font-semibold text-[var(--foreground)]">
                  {products.map((p) => (<tr key={p.id} className="hover:bg-[var(--background)] transition-colors">
                      <td className="py-3 flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-[var(--background)] p-1 border border-[var(--border)]/10"/>
                        <div>
                          <span className="font-black text-[var(--foreground)] block">{p.name}</span>
                          <span className="text-[10px] text-[var(--secondary-foreground)] font-mono">{p.sku}</span>
                        </div>
                      </td>
                      <td>
                        <span className="uppercase text-[10px] font-bold bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--border)]/10">
                          {p.category}
                        </span>
                      </td>
                      <td>{p.weight}</td>
                      <td className="font-black">₹{p.numericPrice}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${p.stockCount < 20
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'}`}>
                          {p.stockCount} in stock
                        </span>
                      </td>
                      <td className="text-right space-x-2">
                        <button onClick={() => handleOpenEditProduct(p)} className="p-1.5 text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--primary)]/10 rounded" title="Edit Product">
                          <Edit3 size={15}/>
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded" title="Delete Product">
                          <Trash2 size={15}/>
                        </button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>
  );
}
