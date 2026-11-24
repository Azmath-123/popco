import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const CartDrawer = ({ onProceedToCheckout }) => {
    const { cart, isCartOpen, setIsCartOpen, cartCount, cartSubtotal, cartGrossSubtotal, comboDiscount, shippingFee, cartTotal, removeFromCart, updateQuantity, currentUser, settings, } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isCartOpen) return;
        const prevBody = document.body.style.overflow;
        const prevHtml = document.documentElement.style.overflow;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevBody;
            document.documentElement.style.overflow = prevHtml;
        };
    }, [isCartOpen]);

    if (!isCartOpen)
        return null;
    const freeShippingThreshold = settings.freeShippingThreshold;
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
    const shippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
    return (<div className="fixed inset-0 z-50 overflow-hidden overscroll-contain">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)}/>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--background)] shadow-2xl flex flex-col border-l border-[var(--border)]/20">
          {/* Header */}
          <div className="p-5 border-b border-[var(--border)]/15 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag size={22} className="text-[var(--foreground)]"/>
              <h2 className="text-lg font-extrabold uppercase tracking-wider text-[var(--foreground)]">
                Your Cart ({cartCount})
              </h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-[var(--primary)]/10 text-[var(--foreground)] transition-colors cursor-pointer">
              <X size={20}/>
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-[var(--primary)]/5 px-5 py-3 border-b border-[var(--border)]/10">
            {remainingForFreeShipping > 0 ? (<p className="text-xs font-bold text-[var(--foreground)] tracking-wide mb-1.5">
                Add <span className="text-[var(--secondary-foreground)]">₹{remainingForFreeShipping}</span> more to unlock{' '}
                <span className="underline decoration-[var(--secondary-foreground)]">FREE DELIVERY</span>!
              </p>) : (<p className="text-xs font-bold text-emerald-800 tracking-wide mb-1.5 flex items-center gap-1">
                <span>🎉</span> You have unlocked FREE Nationwide Delivery!
              </p>)}
            <div className="w-full bg-[var(--primary)]/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[var(--primary)] h-full transition-all duration-500 rounded-full" style={{ width: `${shippingProgress}%` }}/>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {cart.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--foreground)]">
                  <ShoppingBag size={36}/>
                </div>
                <h3 className="text-base font-extrabold uppercase text-[var(--foreground)]">Your cart is empty</h3>
                <p className="text-xs text-[var(--foreground)]/70 max-w-xs font-sans">
                  Discover crunchy, wholesome 6+ Suta fox nuts sourced directly from Meerut.
                </p>
                <button onClick={() => {
                setIsCartOpen(false);
                navigate('/#shop');
            }} className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--primary)]/90 shadow-md transition-all active:scale-95">
                  Explore Products
                </button>
              </div>) : (cart.map((item) => (<div key={item.id} className="flex gap-4 p-3 bg-white rounded-xl border border-[var(--border)]/10 shadow-xs">
                  <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-contain bg-[var(--background)] rounded-lg p-1 border border-[var(--border)]/5 shrink-0"/>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-tight">
                          {item.product.name}
                        </h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-[var(--foreground)]/40 hover:text-red-600 transition-colors p-1" title="Remove item">
                          <Trash2 size={15}/>
                        </button>
                      </div>
                      <p className="text-[11px] font-semibold text-[var(--secondary-foreground)] mt-0.5">
                        {item.selectedPack.label} • {item.product.weight}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[var(--border)]/20 rounded-lg overflow-hidden bg-[var(--background)]">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-[var(--primary)]/10 text-[var(--foreground)] transition-colors">
                          <Minus size={13}/>
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-[var(--foreground)]">
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-[var(--primary)]/10 text-[var(--foreground)] transition-colors">
                          <Plus size={13}/>
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-[var(--foreground)]">
                          ₹{(item.selectedPack.price || item.product.numericPrice) * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>)))}
          </div>

          {/* Footer & Checkout Breakdown (if items exist) */}
          {cart.length > 0 && (<div className="p-5 border-t border-[var(--border)]/15 bg-white space-y-4">
              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs text-[var(--foreground)]/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[var(--foreground)]">₹{cartGrossSubtotal}</span>
                </div>
                {comboDiscount > 0 && (<div className="flex justify-between text-emerald-700 font-bold"><span>10-pack combo offer</span><span>-₹{comboDiscount}</span></div>)}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-[var(--foreground)]">
                    {shippingFee === 0 ? <span className="text-emerald-700 uppercase">FREE</span> : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-[var(--foreground)] pt-2 border-t border-[var(--border)]/15">
                  <span>Total Amount</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
            }} className="w-full py-3.5 px-6 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-extrabold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/25 transition-all active:scale-98 cursor-pointer">
                <span>Proceed to Checkout</span>
                <ArrowRight size={16}/>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--foreground)]/60 font-semibold uppercase tracking-wider">
                <ShieldCheck size={14} className="text-emerald-700"/>
                <span>100% Secure Checkout via Razorpay & UPI</span>
              </div>
            </div>)}
        </div>
      </div>
    </div>);
};
