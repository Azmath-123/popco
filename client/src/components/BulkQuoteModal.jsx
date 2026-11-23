import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';
import { apiRequest } from '../lib/api';
import { PhoneInput } from './PhoneInput';
import { validatePhone, validateName, formatFullPhone } from '../lib/validation';

export const BulkQuoteModal = ({ isOpen, onClose, selectedProduct, quantityKg, onQuantityChange }) => {
  const { currentUser, showToast } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
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

    if (!validateName(cleanName)) {
      setErrorMsg('Please enter your full name or business name (at least 2 characters).');
      return;
    }

    if (!validatePhone(phone, countryCode)) {
      setErrorMsg(countryCode === '+91'
        ? 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.'
        : 'Please enter a valid mobile number (7 to 15 digits).');
      return;
    }

    const finalQty = Number(qty) >= 50 ? Number(qty) : 50;
    const fullPhone = formatFullPhone(phone, countryCode);

    setIsSubmitting(true);
    try {
      await apiRequest('/bulk-quotes', {
        method: 'POST',
        body: {
          name: cleanName,
          phone: fullPhone,
          email: currentUser?.email || '',
          productName: selectedProduct?.name || 'Bulk Raw Makhana',
          quantityKg: finalQty,
          message: `Direct Bulk Quote Request: ${finalQty} KG of ${selectedProduct?.name || 'Wholesale Products'}`
        }
      });

      setIsSuccess(true);
      showToast('Enquiry received! Opening WhatsApp for instant quotation...', 'success');

      // WhatsApp pre-filled message
      const whatsappMsg = `Hi PopCo, I am requesting a bulk wholesale quotation for *${finalQty} KG* of *${selectedProduct?.name || 'Bulk Products'}*.\n\n👤 Name: ${cleanName}\n📞 Phone: ${fullPhone}\n\nPlease share dispatch timeline and current wholesale rates.`;
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
    <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-2.5 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative bg-[var(--background)] text-[var(--foreground)] rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-[var(--border)]/40 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="bg-[var(--primary)] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shadow-inner">
              <FaWhatsapp size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/80 flex items-center gap-1 mb-0.5">
                <Sparkles size={11} />
                <span>DIRECT MEERUT DISPATCH</span>
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                WHOLESALE QUOTE
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-7 space-y-4">
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
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-base font-extrabold text-[var(--foreground)]">Enquiry Received!</h4>
              <p className="text-xs text-[var(--foreground)]/70 max-w-xs mx-auto leading-relaxed">
                Opening WhatsApp for direct rate quotation and dispatch timelines...
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
                  placeholder="Your Name / Business Name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] text-sm font-semibold border border-[var(--border)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/70 mb-1.5">
                  PHONE NUMBER (WHATSAPP) *
                </label>
                <PhoneInput
                  phone={phone}
                  onChange={(val) => { setPhone(val); setErrorMsg(''); }}
                  countryCode={countryCode}
                  onCountryCodeChange={(code) => { setCountryCode(code); setErrorMsg(''); }}
                  required
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
                <p className="text-[10px] text-[var(--foreground)]/50 mt-1 font-medium">
                  Min 50 KG • Supplied in airtight 50 KG master sacks
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 active:scale-[0.98] text-white font-black uppercase tracking-widest text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>PROCESSING...</span>
                  ) : (
                    <>
                      <FaWhatsapp size={16} />
                      <span>GET QUOTE ON WHATSAPP</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-[var(--foreground)]/50 font-medium">
                ⚡ Direct factory quotation • Fast dispatch across India
              </p>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
