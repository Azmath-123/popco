import React, { useState, useMemo } from 'react';
import { Sparkles, Plus, X, ShoppingBag, CheckCircle2, RotateCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const COMBO_SIZE = 10;
const COMBO_PRICE = 1799;

export const HomepageComboSection = () => {
  const { products, addToCart, showToast, setIsCartOpen } = useStore();
  const [slots, setSlots] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Available products for the combo (Raw Makhana 200g & Roasted Edamame 150g)
  const comboProducts = useMemo(() => {
    return products.filter((p) => p.inStock !== false && p.isActive !== false);
  }, [products]);

  const slotsRemaining = COMBO_SIZE - slots.length;
  const isComplete = slots.length === COMBO_SIZE;

  // Add a product into the next available slot
  const handleAddProduct = (product) => {
    if (slots.length < COMBO_SIZE) {
      setSlots((prev) => [...prev, product]);
    }
  };

  // Remove a product from a specific slot index
  const handleRemoveSlot = (index) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all slots
  const handleClearSlots = () => {
    setSlots([]);
  };

  // Add the 10-pack combo to cart
  const handleAddToCart = async () => {
    if (!isComplete || isAdding) return;
    setIsAdding(true);

    try {
      const counts = new Map();
      for (const item of slots) {
        counts.set(item.id, (counts.get(item.id) || 0) + 1);
      }

      for (const [productId, qty] of counts.entries()) {
        const prod = comboProducts.find((p) => p.id === productId);
        if (!prod) continue;
        const singlePack = prod.packs?.find((p) => Number(p.count) === 1) || prod.packs?.[0] || {
          count: 1,
          label: 'Single Pack',
          price: prod.numericPrice || 399
        };
        const ok = await addToCart(prod, singlePack, qty);
        if (!ok) {
          setIsAdding(false);
          return;
        }
      }

      showToast('🎉 10-Pack Custom Combo added to your cart for ₹1,799!', 'success');
      setSlots([]);
      setIsCartOpen(true);
    } catch (err) {
      console.error('Combo add to cart error:', err);
      showToast('Failed to add combo to cart. Please try again.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section id="custom-combo-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="bg-white rounded-3xl border border-[var(--border)]/30 shadow-xl overflow-hidden">
        
        {/* 1. Header Bar */}
        <div className="bg-gradient-to-r from-[var(--primary)] via-[var(--primary)] to-[var(--primary)]/90 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-[var(--secondary-foreground)] shadow-inner">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                     CUSTOM COMBO
                </h2>
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest bg-white text-[var(--primary)] px-3 py-1 rounded-full shadow-sm">
                  ₹{COMBO_PRICE.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white/80 uppercase tracking-wider mt-1">
                Fill 10 slots with your choice of Raw Makhana (200gm) & Roasted Edamame (150gm)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {slots.length > 0 && (
              <button
                type="button"
                onClick={handleClearSlots}
                className="text-[11px] font-bold text-white/70 hover:text-white flex items-center gap-1 uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
            <div className="px-4 py-1.5 rounded-full bg-amber-100 text-stone-900 font-black text-xs uppercase tracking-widest shadow-sm">
              {slots.length}/{COMBO_SIZE} FILLED
            </div>
          </div>
        </div>

        {/* 2. Interactive 10 Slots Grid */}
        <div className="p-6 sm:p-8 bg-[#faf7f2]/60 border-b border-[var(--border)]/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]">
              YOUR 10-SLOT COMBO SELECTION
            </h3>
            <span className="text-xs font-bold text-[var(--secondary-foreground)]">
              {slotsRemaining > 0 ? `${slotsRemaining} more slots remaining` : 'All 10 slots filled!'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: COMBO_SIZE }).map((_, index) => {
              const item = slots[index];
              return (
                <div
                  key={index}
                  className={`relative rounded-2xl h-28 sm:h-32 p-2 flex flex-col items-center justify-center transition-all ${
                    item
                      ? 'bg-white border-2 border-[var(--primary)] shadow-sm'
                      : 'bg-white/70 border-2 border-dashed border-stone-300 hover:border-stone-400'
                  }`}
                >
                  {item ? (
                    <>
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer z-10"
                        title="Remove this item"
                        aria-label="Remove item"
                      >
                        <X size={12} />
                      </button>

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain mb-1"
                      />
                      <span className="text-[10px] font-black text-stone-800 text-center line-clamp-1 px-1">
                        {item.name.replace('PopCo ', '').replace(' (200g Pack)', '').replace(' (150g Jar)', '')}
                      </span>
                      <span className="text-[9px] font-extrabold text-[var(--secondary-foreground)] uppercase">
                        Slot #{index + 1}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-400">
                      <Plus size={20} className="mb-1" />
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        #{index + 1}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Banner notification for unlocked offer */}
          <div className={`mt-5 p-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-wider transition-all ${
            isComplete
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}>
            {isComplete ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                CONGRATULATIONS! 10/10 SLOTS FILLED • SPECIAL ₹{COMBO_PRICE.toLocaleString('en-IN')} COMBO PRICE UNLOCKED!
              </span>
            ) : (
              <span>
                FILL {slotsRemaining} MORE {slotsRemaining === 1 ? 'SLOT' : 'SLOTS'} TO UNLOCK THE ₹{COMBO_PRICE.toLocaleString('en-IN')} COMBO OFFER!
              </span>
            )}
          </div>
        </div>

        {/* 3. Product Selection Cards */}
        <div className="p-6 sm:p-8">
          <div className="mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-900">
              CHOOSE YOUR FLAVOURS & SNACKS
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Tap + Add to place any snack into your combo slots. You can pick multiple of the same flavour!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {comboProducts.map((prod) => {
              const currentInCombo = slots.filter((s) => s.id === prod.id).length;
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs hover:border-[var(--primary)] transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-50 p-1 border border-stone-100 shrink-0 flex items-center justify-center">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary-foreground)] block">
                        {prod.weight || (prod.slug.includes('edamame') ? '150g' : '200g')}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-medium line-clamp-1 mt-0.5">
                        {prod.subtitle || prod.tagline || '100% Premium Healthy Snack'}
                      </p>
                      {currentInCombo > 0 && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-md">
                          {currentInCombo} in combo
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddProduct(prod)}
                    disabled={isComplete}
                    className="px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Add</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Action & Checkout Footer */}
        <div className="bg-stone-50 p-6 sm:p-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Selected Items: {slots.length} of {COMBO_SIZE} Packs
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xs font-bold text-stone-400 uppercase">Combo Total:</span>
              <span className="text-2xl sm:text-3xl font-black text-stone-900">
                ₹{isComplete ? COMBO_PRICE.toLocaleString('en-IN') : '0'}
              </span>
              {isComplete && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md ml-1">
                  SAVE OVER ₹2,000
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isComplete || isAdding}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[var(--primary)] hover:bg-[var(--secondary-foreground)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <ShoppingBag size={18} />
            <span>
              {isAdding
                ? 'ADDING COMBO TO CART...'
                : isComplete
                ? `ADD 10 SNACKS TO CART (₹${COMBO_PRICE.toLocaleString('en-IN')})`
                : `ADD 10 SNACKS TO CART (PICK ${slotsRemaining} MORE)`}
            </span>
          </button>
        </div>

      </div>
    </section>
  );
};
