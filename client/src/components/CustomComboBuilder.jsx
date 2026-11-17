import React, { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const COMBO_SIZE = 10;
const COMBO_PRICE = 1799;

export const CustomComboBuilder = () => {
  const { 
    products, 
    addToCart, 
    showToast, 
    setIsCartOpen, 
    isBulkOrderOpen, 
    setIsBulkOrderOpen 
  } = useStore();
  
  const [slots, setSlots] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const bulkProducts = useMemo(() => products.filter((product) => (
    product.inStock !== false && product.isActive !== false
  )), [products]);

  const selectedPrice = slots.reduce((sum, product) => {
    const packPrice = product.packs?.find((pack) => Number(pack.count) === 1)?.price || product.numericPrice;
    return sum + Number(packPrice);
  }, 0);

  const isComplete = slots.length === COMBO_SIZE;

  const addFlavor = (product) => {
    if (slots.length < COMBO_SIZE) {
      setSlots((current) => [...current, product]);
    }
  };

  const removeSlot = (slotIndex) => {
    setSlots((current) => current.filter((_, index) => index !== slotIndex));
  };

  const addComboToCart = async () => {
    if (!isComplete || isAdding) return;
    setIsAdding(true);
    
    const quantities = new Map();
    for (const product of slots) {
      quantities.set(product.id, (quantities.get(product.id) || 0) + 1);
    }
    
    for (const [productId, quantity] of quantities) {
      const product = bulkProducts.find((item) => item.id === productId);
      const pack = product?.packs?.find((item) => Number(item.count) === 1) || product?.packs?.[0] || { count: 1, label: 'Single Pack', price: product?.numericPrice || 299 };
      if (!await addToCart(product, pack, quantity)) {
        setIsAdding(false);
        return;
      }
    }
    
    showToast('Your 10-pack bulk combo was added to the cart!', 'success');
    setSlots([]);
    setIsBulkOrderOpen(false);
    setIsCartOpen(true);
    setIsAdding(false);
  };

  if (!isBulkOrderOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop with dark blur */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsBulkOrderOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over panel container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-2xl lg:max-w-3xl bg-[var(--background)] shadow-2xl flex flex-col border-l border-[var(--border)]/20 animate-in slide-in-from-right duration-300">
          
          {/* 1. Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border)]/15 flex items-center justify-between bg-white sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-sm">
                <Sparkles size={20} className="text-[var(--secondary-foreground)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-[var(--foreground)]">
                    Bulk Order • Custom Combo
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--primary)] text-white px-2 py-0.5 rounded-full shadow-xs">
                    ₹1,799
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[var(--secondary-foreground)] uppercase tracking-wider">
                  Fill 10 slots with your choice of Raw Makhana (200gm) & Roasted Edamame (150gm)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                isComplete 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]/20'
              }`}>
                {slots.length}/{COMBO_SIZE} Filled
              </span>
              <button 
                type="button"
                onClick={() => setIsBulkOrderOpen(false)} 
                className="p-2 rounded-full hover:bg-[var(--primary)]/10 text-[var(--foreground)] transition-colors cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* 2. Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
            
            {/* 10-Slot Visual Grid Box */}
            <div className="rounded-3xl border border-[var(--border)]/15 bg-white p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)]/10 pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase text-[var(--foreground)] tracking-wide">
                    Your 10-Slot Combo
                  </h3>
                  <p className="text-[11px] uppercase tracking-wide text-[var(--foreground)]/60 font-medium">
                    10 Slots (Mix & Match 200gm Makhana & 150gm Edamame)
                  </p>
                </div>
                <span className="text-xs font-black text-[var(--foreground)]">
                  {slots.length} of {COMBO_SIZE} Slots Selected
                </span>
              </div>

              {/* 5 x 2 Slots Grid */}
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {Array.from({ length: COMBO_SIZE }, (_, index) => {
                  const product = slots[index];
                  return (
                    <div 
                      key={index} 
                      className={`relative aspect-square rounded-2xl border-2 transition-all ${
                        product 
                          ? 'border-[var(--primary)]/30 bg-[var(--background)] shadow-xs' 
                          : 'border-dashed border-[var(--border)]/30 bg-[var(--background)]/40 hover:border-[var(--border)]'
                      } flex items-center justify-center p-1.5`}
                    >
                      {product ? (
                        <>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            title={product.name} 
                            className="h-full w-full object-contain" 
                          />
                          <button 
                            type="button" 
                            onClick={() => removeSlot(index)} 
                            aria-label={`Remove ${product.name} from slot ${index + 1}`} 
                            className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-1 text-[var(--foreground)] shadow-md border border-[var(--border)]/20 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center text-[10px] sm:text-xs text-[var(--foreground)]/40 font-bold">
                          <Plus size={16} className="mx-auto text-[var(--foreground)]/30 mb-0.5" />
                          #{index + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Alert Banner */}
              <div className={`p-3 rounded-xl border text-center text-xs font-bold uppercase tracking-wider ${
                isComplete
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center justify-center gap-1.5'
                  : 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border-[var(--border)]/20'
              }`}>
                {isComplete ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>All 10 slots filled! Combo price ₹1,799 applied (Save ₹{Math.max(0, selectedPrice - COMBO_PRICE)})</span>
                  </>
                ) : (
                  <span>
                    Fill {COMBO_SIZE - slots.length} more {COMBO_SIZE - slots.length === 1 ? 'slot' : 'slots'} to unlock the ₹1,799 combo offer!
                  </span>
                )}
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-[var(--foreground)] tracking-wide">
                    Choose Your Products
                  </h3>
                  <p className="text-[11px] text-[var(--foreground)]/70 font-sans">
                    Tap Add to place items into your combo slots. You can pick any mix of Raw Makhana and Roasted Edamame!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bulkProducts.map((product) => {
                  const countInCombo = slots.filter((s) => s.id === product.id).length;
                  const packPrice = product.packs?.find((pack) => Number(pack.count) === 1)?.price || product.numericPrice;
                  return (
                    <article 
                      key={product.id} 
                      className={`rounded-2xl bg-white border p-4 flex flex-col text-center justify-between shadow-xs hover:shadow-md transition-all ${
                        countInCombo > 0 ? 'border-[var(--primary)]/40 ring-1 ring-[var(--primary)]/20' : 'border-[var(--border)]/15'
                      }`}
                    >
                      <div>
                        <div className="relative h-36 sm:h-40 rounded-xl bg-[var(--background)] flex items-center justify-center p-3 mb-3">
                          <span className="absolute top-2 right-2 rounded-full bg-[var(--secondary-foreground)] px-2.5 py-0.5 text-[10px] font-black text-white uppercase shadow-xs">
                            {product.weight || (product.category === 'raw' ? '200gm' : '150gm')}
                          </span>
                          {countInCombo > 0 && (
                            <span className="absolute top-2 left-2 rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                              {countInCombo} in combo
                            </span>
                          )}
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-full w-full object-contain" 
                            loading="lazy" 
                          />
                        </div>
                        <h4 className="text-sm font-black uppercase text-[var(--foreground)] leading-tight">
                          {product.name}
                        </h4>
                        <p className="mt-1 text-xs text-[var(--secondary-foreground)] font-bold uppercase tracking-wider">
                          ₹{packPrice} / pack
                        </p>
                        <p className="mt-1 text-[11px] text-[var(--foreground)]/65 font-sans line-clamp-2 leading-snug">
                          {product.description}
                        </p>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => addFlavor(product)} 
                        disabled={isComplete} 
                        className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--primary)] py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-[var(--secondary-foreground)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xs cursor-pointer"
                      >
                        <Plus size={15} /> Add to Combo
                      </button>
                    </article>
                  );
                })}

                {bulkProducts.length === 0 && (
                  <p className="col-span-full rounded-2xl bg-white p-8 text-center text-xs text-[var(--foreground)]/70">
                    Loading bulk combo options...
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* 3. Footer Summary & Action */}
          <div className="p-4 sm:p-5 bg-white border-t border-[var(--border)]/15 space-y-3 sticky bottom-0 z-20">
            <div className="rounded-2xl bg-[var(--background)] p-3.5 border border-[var(--border)]/15 space-y-1.5">
              <div className="flex justify-between text-xs font-bold uppercase text-[var(--foreground)]/70">
                <span>Selected Items ({slots.length} Packs)</span>
                <span>₹{selectedPrice}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-[var(--border)]/10 pt-1.5">
                <span className="text-xs font-black uppercase text-[var(--foreground)]">
                  Combo Total
                </span>
                <div className="flex items-baseline gap-2">
                  {isComplete && selectedPrice > COMBO_PRICE && (
                    <span className="text-xs text-[var(--foreground)]/40 line-through font-semibold">
                      ₹{selectedPrice}
                    </span>
                  )}
                  <span className="text-2xl font-black text-[var(--foreground)]">
                    ₹{isComplete ? COMBO_PRICE : selectedPrice}
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={addComboToCart} 
              disabled={!isComplete || isAdding} 
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-[var(--secondary-foreground)] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={17} /> 
              {isAdding 
                ? 'Adding to Cart…' 
                : isComplete 
                  ? `Add 10 Snacks to Cart • ₹${COMBO_PRICE}`
                  : `Add 10 Snacks to Cart (Pick ${COMBO_SIZE - slots.length} More)`
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
