import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const BulkQuoteModal = ({ isOpen, onClose, selectedProduct, quantityKg, onQuantityChange }) => {
  const { currentUser, showToast } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [qty, setQty] = useState(quantityKg || 50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.name || '');
      setPhone(currentUser?.phone || '');
      setQty(quantityKg || 50);
      setIsSuccess(false);
      setErrorMsg('');
    }
  }, [isOpen, currentUser, quantityKg]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const finalQty = Number(qty) >= 50 ? Number(qty) : 50;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/bulk-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          email: currentUser?.email || '',
          productName: selectedProduct?.name || 'Bulk Raw Makhana',
          quantityKg: finalQty,
          message: `Direct Bulk Quote Request: ${finalQty} KG of ${selectedProduct?.name || 'Wholesale Products'}`
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to submit bulk quote enquiry.');
      }

      setIsSuccess(true);
      showToast('Enquiry received! Opening WhatsApp for instant quotation...', 'success');

      // WhatsApp pre-filled message
      const whatsappMsg = `Hi PopCo, I am requesting a bulk wholesale quotation for *${finalQty} KG* of *${selectedProduct?.name || 'Bulk Products'}*.\n\n👤 Name: ${cleanName}\n📞 Phone: ${cleanPhone}\n\nPlease share dispatch timeline and current wholesale rates.`;
      const whatsappUrl = `https://wa.me/9180808447?text=${encodeURIComponent(whatsappMsg)}`;

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 700);

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Bulk quote error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again or contact us directly on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Modal Dialog (Matching Website Theme: PopCo Cream Background, Primary Maroon Header & Buttons) */}
      <div className="relative bg-[var(--background)] text-[var(--foreground)] rounded-3xl w-full max-w-md shadow-2xl border border-[var(--border)]/40 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner - PopCo Primary Maroon */}
        <div className="bg-[var(--primary)] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shadow-inner">
              <MessageCircle size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/80 bg-white/10 px-2 py-0.5 rounded inline-block mb-1">
                DIRECT SUPPORT
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-white">
                BULK QUOTE
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Selected Product & Quantity Summary Pill */}
          <div className="bg-white border border-[var(--border)]/40 rounded-2xl p-3.5 flex items-center justify-between text-xs shadow-xs">
            <div>
              <span className="text-[var(--foreground)]/60 block text-[10px] font-bold uppercase tracking-wider">Product</span>
              <span className="font-extrabold text-[var(--foreground)] text-sm">{selectedProduct?.name || 'Bulk Raw Makhana'}</span>
            </div>
            <div className="text-right">
              <span className="text-[var(--foreground)]/60 block text-[10px] font-bold uppercase tracking-wider">Requirement</span>
              <span className="font-black text-[var(--primary)] text-base">{qty} KG</span>
            </div>
          </div>

          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-lg font-extrabold text-[var(--foreground)]">Enquiry Sent Successfully!</h4>
              <p className="text-xs text-[var(--foreground)]/70 max-w-xs mx-auto leading-relaxed">
                Our B2B dispatch team at PopCo Meerut has received your wholesale requirement. Launching WhatsApp for instant rate quotation...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/70 mb-1.5">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm font-semibold border border-[var(--border)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/70 mb-1.5">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10 Digit Mobile Number"
                  maxLength={12}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm font-semibold border border-[var(--border)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/70 mb-1.5">
                  REQUIRED QUANTITY (KG)
                </label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={qty}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQty(val);
                    if (onQuantityChange) onQuantityChange(val);
                  }}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm font-bold border border-[var(--border)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all shadow-xs"
                />
                <p className="text-[10px] text-[var(--foreground)]/60 mt-1">
                  Minimum order: 50 KG • Supplied in 50 KG master sacks
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 active:scale-[0.98] text-white font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>SENDING ENQUIRY...</span>
                  ) : (
                    <>
                      <span>SEND ENQUIRY</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-[var(--foreground)]/60 tracking-wider">
                🔒 100% Direct Factory Inquiry • No Spam • Pan-India Logistics
              </p>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
