import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, CheckCircle2, ShieldCheck, CreditCard, Banknote, ArrowRight, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const currentScript = document.querySelector('script[data-razorpay-checkout]');
    const script = currentScript || document.createElement('script');
    if (!currentScript) {
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.dataset.razorpayCheckout = 'true';
        document.body.appendChild(script);
    }
    script.addEventListener('load', () => window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay Checkout did not load.')), { once: true });
    script.addEventListener('error', () => reject(new Error('Razorpay Checkout did not load. Please try again.')), { once: true });
});

export const CheckoutModal = ({ isOpen, onClose }) => {
    const { cart, cartSubtotal, cartGrossSubtotal, comboDiscount, couponDiscount, shippingFee, cartTotal, appliedCoupon, currentUser, createOrder, completePayment, showToast } = useStore();
    const navigate = useNavigate();
    // Form State
    const defaultAddr = currentUser?.addresses.find((a) => a.isDefault) || currentUser?.addresses[0];
    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [address, setAddress] = useState(defaultAddr?.addressLine1 || '');
    const [city, setCity] = useState(defaultAddr?.city || 'Patna');
    const [state, setState] = useState(defaultAddr?.state || 'Bihar');
    const [pincode, setPincode] = useState(defaultAddr?.pincode || '800001');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [isProcessing, setIsProcessing] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);
    if (!isOpen)
        return null;
    const celebrate = () => {
        try {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['var(--primary)', 'var(--secondary-foreground)', 'var(--background)', '#22c55e'] });
        } catch { /* The order confirmation does not depend on confetti. */ }
    };
    const handleStartPayment = async (e) => {
        e.preventDefault();
        if (!name || !phone || !address || !pincode) {
            showToast('Please fill in all mandatory delivery fields.', 'error');
            return;
        }
        setIsProcessing(true);
        try {
            const result = await createOrder({
                customer: {
                    name,
                    email: email || 'customer@mukeja.com',
                    phone,
                    address,
                    city,
                    state,
                    pincode,
                },
                paymentMethod,
            });
            if (paymentMethod === 'cod') {
                setConfirmedOrder(result.order);
                celebrate();
                return;
            }
            const RazorpayCheckout = await loadRazorpay();
            const checkout = new RazorpayCheckout({
                key: result.paymentSession.keyId,
                amount: result.paymentSession.amount,
                currency: result.paymentSession.currency,
                name: 'PopCo Makhana',
                description: `Order ${result.order.orderNumber}`,
                order_id: result.paymentSession.razorpayOrderId,
                prefill: { name, email: email || undefined, contact: phone },
                notes: { orderNumber: result.order.orderNumber },
                theme: { color: 'var(--primary)' },
                handler: async (paymentResponse) => {
                    setIsProcessing(true);
                    try {
                        const verifiedOrder = await completePayment(result.order.id, paymentResponse);
                        setConfirmedOrder(verifiedOrder);
                        celebrate();
                    } catch (error) {
                        showToast(error.message || 'Payment verification failed. Please contact support.', 'error');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: { ondismiss: () => setIsProcessing(false) },
            });
            checkout.on('payment.failed', (event) => showToast(event.error?.description || 'Payment was not completed.', 'error'));
            setIsProcessing(false);
            checkout.open();
        } catch (error) {
            showToast(error.message || 'Could not start checkout.', 'error');
            setIsProcessing(false);
        }
    };
    const handlePrintInvoice = () => {
        window.print();
    };
    return (<div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--background)] rounded-2xl shadow-2xl max-w-2xl w-full border border-[var(--border)]/20 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-white border-b border-[var(--border)]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-[var(--foreground)]"/>
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-[var(--foreground)]">
              {confirmedOrder ? 'Order Confirmed 🎉' : 'Instant Secure Checkout'}
            </h2>
          </div>
          {!confirmedOrder && (<button onClick={onClose} className="p-1.5 rounded-full hover:bg-[var(--primary)]/10 text-[var(--foreground)] transition-colors">
              <X size={20}/>
            </button>)}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {confirmedOrder ? (
        /* Order Confirmation View */
        <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={44}/>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase text-[var(--foreground)] tracking-wide">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs font-bold text-[var(--secondary-foreground)] mt-1">
                  ORDER ID: <span className="text-[var(--foreground)] font-mono">{confirmedOrder.orderNumber}</span>
                </p>
                <p className="text-xs text-[var(--foreground)]/70 font-sans mt-2 max-w-md mx-auto">
                  Thank you, <span className="font-bold text-[var(--foreground)]">{confirmedOrder.customer.name}</span>. Your freshly harvested Meerut fox nuts are being carefully packed at our warehouse.
                </p>
              </div>

              {/* Order Details Card */}
              <div className="bg-white p-5 rounded-xl border border-[var(--border)]/15 text-left text-xs space-y-3 shadow-xs">
                <div className="flex justify-between items-center border-b border-[var(--border)]/10 pb-2">
                  <span className="font-bold text-[var(--foreground)]/70">Delivery Address:</span>
                  <span className="font-bold text-[var(--foreground)] text-right">
                    {confirmedOrder.customer.address}, {confirmedOrder.customer.city}, {confirmedOrder.customer.pincode}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--border)]/10 pb-2">
                  <span className="font-bold text-[var(--foreground)]/70">Payment Status:</span>
                  <span className="font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {confirmedOrder.paymentStatus} ({confirmedOrder.paymentMethod.toUpperCase()})
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--border)]/10 pb-2">
                  <span className="font-bold text-[var(--foreground)]/70">Estimated Delivery:</span>
                  <span className="font-bold text-[var(--foreground)]">3-5 Business Days (Delhivery Express)</span>
                </div>
                <div className="flex justify-between items-center pt-1 font-black text-sm text-[var(--foreground)]">
                  <span>Total Amount Paid:</span>
                  <span>₹{confirmedOrder.total}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a href={`https://wa.me/918080808447?text=Hi%20PopCo%2C%20I%20placed%20order%20${confirmedOrder.orderNumber}.%20Please%20send%20tracking%20updates!`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[var(--primary)]/90 shadow-md transition-all">
                  <MessageCircle size={15}/>
                  <span>Get WhatsApp Updates</span>
                </a>
                <button onClick={() => {
                onClose();
                navigate('/profile');
            }} className="px-6 py-3 rounded-full bg-white border border-[var(--border)]/30 text-[var(--foreground)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--primary)]/5 transition-all">
                  View Order in Profile
                </button>
              </div>
            </div>) : (
        /* Checkout Form */
        <form onSubmit={handleStartPayment} className="space-y-6">
              {/* Customer Contact */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] border-b border-[var(--border)]/15 pb-1">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                      Full Name *
                    </label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Binali Hussain" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                      Email Address (for Invoice & Tracking)
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. binali.hussain98@gmail.com" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] border-b border-[var(--border)]/15 pb-1">
                  2. Shipping Destination
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                      Street Address / House No / Apartment *
                    </label>
                    <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Flat 402, Lotus Residency, Near City Centre" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                        City *
                      </label>
                      <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Patna" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                        State *
                      </label>
                      <input type="text" required value={state} onChange={(e) => setState(e.target.value)} placeholder="Bihar" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                        PIN Code *
                      </label>
                      <input type="text" required value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="800001" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] border-b border-[var(--border)]/15 pb-1">
                  3. Select Payment Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label onClick={() => setPaymentMethod('razorpay')} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'razorpay'
                ? 'border-[var(--border)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]/20 shadow-xs'
                : 'border-[var(--border)]/20 bg-white hover:border-[var(--border)]/40'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="mt-0.5 accent-[var(--primary)]"/>
                    <div>
                      <div className="flex items-center gap-1.5 font-extrabold text-xs text-[var(--foreground)]">
                        <CreditCard size={15}/>
                        <span>Razorpay Online Payment</span>
                      </div>
                      <p className="text-[10px] text-[var(--foreground)]/70 font-semibold mt-0.5">
                        UPI (GPay, PhonePe, Paytm), Cards, Netbanking
                      </p>
                      <span className="inline-block mt-1 text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        FASTEST & ZERO CONVENIENCE FEE
                      </span>
                    </div>
                  </label>

                  <label onClick={() => setPaymentMethod('cod')} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cod'
                ? 'border-[var(--border)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]/20 shadow-xs'
                : 'border-[var(--border)]/20 bg-white hover:border-[var(--border)]/40'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-0.5 accent-[var(--primary)]"/>
                    <div>
                      <div className="flex items-center gap-1.5 font-extrabold text-xs text-[var(--foreground)]">
                        <Banknote size={15}/>
                        <span>Cash on Delivery (COD)</span>
                      </div>
                      <p className="text-[10px] text-[var(--foreground)]/70 font-semibold mt-0.5">
                        Pay with cash or UPI upon package delivery
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-white p-4 rounded-xl border border-[var(--border)]/15 space-y-2 text-xs">
                <div className="flex justify-between text-[var(--foreground)]/80">
                  <span>Cart Items ({cart.length})</span>
                  <span className="font-bold text-[var(--foreground)]">₹{cartGrossSubtotal}</span>
                </div>
                {comboDiscount > 0 && (<div className="flex justify-between text-emerald-700 font-bold"><span>10-pack combo offer</span><span>-₹{comboDiscount}</span></div>)}
                {couponDiscount > 0 && (<div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>)}
                <div className="flex justify-between text-[var(--foreground)]/80">
                  <span>Shipping</span>
                  <span className="font-bold text-[var(--foreground)]">
                    {shippingFee === 0 ? <span className="text-emerald-700 font-bold uppercase">FREE</span> : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-[var(--foreground)] border-t border-[var(--border)]/10 pt-2">
                  <span>Grand Total</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button type="submit" disabled={isProcessing} className="w-full py-4 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--primary)]/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50">
                <span>Pay ₹{cartTotal} & Place Order</span>
                <ArrowRight size={16}/>
              </button>
            </form>)}
        </div>
      </div>

    </div>);
};
