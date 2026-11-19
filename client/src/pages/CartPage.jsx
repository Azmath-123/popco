import React from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
export const CartPage = ({ onOpenCheckout }) => {
    const { cart, cartCount, cartSubtotal, cartGrossSubtotal, comboDiscount, shippingFee, cartTotal, removeFromCart, updateQuantity, currentUser, settings, } = useStore();
    const navigate = useNavigate();
    const freeShippingThreshold = settings.freeShippingThreshold;
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
    const shippingProgress = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));
    if (cart.length === 0) {
        return (<div className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-24 h-24 bg-[var(--background)] border border-[var(--border)]/20 rounded-full flex items-center justify-center mx-auto text-[var(--foreground)]">
          <ShoppingBag size={44}/>
        </div>
        <h2 className="text-2xl font-black uppercase text-[var(--foreground)]">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-[var(--foreground)]/70 font-sans max-w-md mx-auto">
          Explore our authentic Mithilanchal 6+ Suta fox nuts, fresh trial packs, and flavoured roasted makhana.
        </p>
        <div className="pt-2">
          <Link to="/#shop" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest shadow-lg hover:bg-[var(--primary)]/90 transition-all">
            <ArrowLeft size={16}/>
            <span>Start Shopping</span>
          </Link>
        </div>
      </div>);
    }
    return (<div className="flex-1 bg-[var(--background)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-[var(--foreground)] tracking-tight">
              Shopping Cart ({cartCount} Items)
            </h1>
            <p className="text-xs text-[var(--foreground)]/70 font-sans mt-0.5">
              Review your items and proceed to fast express checkout.
            </p>
          </div>
          <Link to="/#shop" className="text-xs font-bold text-[var(--secondary-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 uppercase">
            <ArrowLeft size={14}/>
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Alert Banner */}
            <div className="bg-white p-4 rounded-2xl border border-[var(--border)]/15 shadow-xs space-y-2">
              {remainingForFreeShipping > 0 ? (<p className="text-xs font-bold text-[var(--foreground)]">
                  Add <span className="text-[var(--secondary-foreground)]">₹{remainingForFreeShipping}</span> more to unlock <span className="underline decoration-[var(--secondary-foreground)]">FREE NATIONWIDE DELIVERY</span>!
                </p>) : (<p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <span>🎉</span> You qualify for FREE Nationwide Delivery!
                </p>)}
              <div className="w-full bg-[var(--primary)]/15 h-2 rounded-full overflow-hidden">
                <div className="bg-[var(--primary)] h-full transition-all duration-500 rounded-full" style={{ width: `${shippingProgress}%` }}/>
              </div>
            </div>

            {/* Items Cards */}
            <div className="bg-white rounded-3xl border border-[var(--border)]/15 p-6 shadow-sm space-y-6">
              {cart.map((item) => (<div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between pb-6 border-b border-[var(--border)]/10 last:border-0 last:pb-0">
                  <div className="flex gap-4 items-center">
                    <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-contain bg-[var(--background)] rounded-xl p-1.5 border border-[var(--border)]/10 shrink-0"/>
                    <div>
                      <h3 className="text-sm font-black text-[var(--foreground)] uppercase leading-tight">
                        {item.product.name}
                      </h3>
                      <p className="text-xs font-bold text-[var(--secondary-foreground)] mt-0.5">
                        {item.selectedPack.label} • {item.product.weight}
                      </p>
                      <span className="text-xs text-[var(--foreground)]/70 font-semibold block mt-1">
                        Unit Price: ₹{item.selectedPack.price || item.product.numericPrice}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0">
                    {/* Stepper */}
                    <div className="flex items-center border border-[var(--border)]/20 rounded-xl overflow-hidden bg-[var(--background)]">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--primary)]/10 text-[var(--foreground)]">
                        <Minus size={13}/>
                      </button>
                      <span className="w-8 text-center text-xs font-black text-[var(--foreground)]">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--primary)]/10 text-[var(--foreground)]">
                        <Plus size={13}/>
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-base font-black text-[var(--foreground)]">
                        ₹{(item.selectedPack.price || item.product.numericPrice) * item.quantity}
                      </span>
                    </div>

                    {/* Remove */}
                    <button onClick={() => removeFromCart(item.id)} className="text-[var(--foreground)]/40 hover:text-red-600 transition-colors p-1" title="Remove product">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>))}
            </div>
          </div>

          {/* Right: Summary & Checkout */}
          <div className="space-y-4">
            {/* Price Breakdown Card */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--border)]/15 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider border-b border-[var(--border)]/10 pb-2">
                Order Summary
              </h4>

              <div className="space-y-2 text-xs text-[var(--foreground)]/80">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-[var(--foreground)]">₹{cartGrossSubtotal}</span>
                </div>
                {comboDiscount > 0 && (<div className="flex justify-between text-emerald-700 font-bold"><span>10-pack combo offer</span><span>-₹{comboDiscount}</span></div>)}
                <div className="flex justify-between">
                  <span>Standard Delivery</span>
                  <span className="font-bold text-[var(--foreground)]">
                    {shippingFee === 0 ? <span className="text-emerald-700 uppercase">FREE</span> : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-[var(--foreground)] border-t border-[var(--border)]/15 pt-3">
                  <span>Total Payable</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>

              <button onClick={onOpenCheckout} className="w-full py-4 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--primary)]/25 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer">
                <span>Proceed to Checkout</span>
                <ArrowRight size={16}/>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--foreground)]/60 font-bold uppercase tracking-wider text-center">
                <ShieldCheck size={14} className="text-emerald-700"/>
                <span>Verified Razorpay Gateway & Instant Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
