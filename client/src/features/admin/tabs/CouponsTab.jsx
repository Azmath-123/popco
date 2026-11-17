import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export function CouponsTab({ coupons, setIsCouponModalOpen, deleteCoupon }) {
  return (
<div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border)]/15 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-[var(--border)]/10 pb-4">
              <div>
                <h2 className="text-lg font-black uppercase text-[var(--foreground)]">Coupons & Promotions</h2>
                <p className="text-xs text-[var(--foreground)]/60 font-sans">
                  Manage fixed and percentage discount vouchers for marketing campaigns.
                </p>
              </div>

              <button onClick={() => setIsCouponModalOpen(true)} className="px-6 py-2.5 bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-md">
                <Plus size={15}/>
                <span>Create Voucher</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((c) => (<div key={c.code} className="p-5 rounded-2xl border border-[var(--border)]/15 bg-[var(--background)] space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black font-mono tracking-wider text-[var(--foreground)] bg-white px-3 py-1 rounded-lg border border-[var(--border)]/20">
                      {c.code}
                    </span>
                    <button onClick={() => deleteCoupon(c.code)} className="text-red-600 hover:text-red-800 p-1">
                      <Trash2 size={16}/>
                    </button>
                  </div>

                  <p className="text-xs text-[var(--foreground)]/80 font-sans">{c.description}</p>

                  <div className="flex justify-between items-center text-[11px] font-bold text-[var(--secondary-foreground)] border-t border-[var(--border)]/10 pt-2">
                    <span>
                      Discount:{' '}
                      {c.discountType === 'percentage'
                    ? `${c.discountValue}% OFF`
                    : `₹${c.discountValue} FLAT`}
                    </span>
                    <span>Min Order: ₹{c.minOrder}</span>
                    <span>Used: {c.usageCount} times</span>
                  </div>
                </div>))}
            </div>
          </div>
  );
}
