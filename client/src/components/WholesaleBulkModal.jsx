import React, { useState } from 'react';
import { X, Minus, Plus, MessageCircle, Truck, ShieldCheck, FileText, Package, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BulkQuoteModal } from './BulkQuoteModal';

const WHOLESALE_PRODUCTS = [
  {
    id: 'bulk-makhana',
    name: 'Bulk Raw Makhana',
    subtitle: 'Direct Meerut Dispatch • Premium Jumbo Grade',
    description: 'Premium double-screened makhana kernels. Screened for large size, minimal moisture, and superior expansion ratio. Packaged in airtight bulk sacks for wholesale, retail re-packing, and snack processing.',
    images: [
      '/products/popco-raw-makhana-200g-lifestyle-01.webp',
      '/products/popco-raw-makhana-200g-lifestyle-02.webp',
      '/products/popco-raw-makhana-200g-lifestyle-03.webp',
      '/products/popco-raw-makhana-200g-front.webp',
    ],
    highlights: ['100% Sun-Dried Natural', 'Meerut Quality Checked', 'High Expansion Ratio', 'Zero Additives']
  },
  {
    id: 'bulk-edamame',
    name: 'Bulk Roasted & Salted Edamame Beans',
    subtitle: 'High Protein • Crunchy Roasted Soy Snack',
    description: 'Crisp, golden-roasted green edamame beans lightly seasoned with pure sea salt. Packed with 46% plant protein and 14% dietary fiber. Ideal for private labeling, healthy snack mixes, and institutional catering.',
    images: [
      '/products/popco-roasted-edamame-150g-lifestyle-04.jpg',
      '/products/popco-roasted-edamame-150g-lifestyle-01.jpg',
      '/products/popco-roasted-edamame-150g-lifestyle-02.jpg',
      '/products/popco-roasted-edamame-150g-front.jpg',
    ],
    highlights: ['46% Plant-Based Protein', 'Roasted Not Fried', 'Gluten-Free & Vegan', 'Long Shelf Life']
  }
];

export const WholesaleBulkModal = () => {
  const { isBulkOrderOpen, setIsBulkOrderOpen } = useStore();
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantityKg, setQuantityKg] = useState(50);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  if (!isBulkOrderOpen) return null;

  const currentProduct = WHOLESALE_PRODUCTS[selectedProductIndex];
  const activeImage = currentProduct.images[selectedImageIndex] || currentProduct.images[0];

  const handleProductSelect = (index) => {
    setSelectedProductIndex(index);
    setSelectedImageIndex(0);
  };

  const handleIncrement = () => {
    setQuantityKg((prev) => prev + 50);
  };

  const handleDecrement = () => {
    setQuantityKg((prev) => (prev > 50 ? prev - 50 : 50));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsBulkOrderOpen(false)}
          aria-hidden="true"
        />

        {/* Modal Window Container */}
        <div className="min-h-screen px-4 py-6 sm:py-10 flex items-center justify-center">
          <div className="relative w-full max-w-5xl bg-[var(--background)] rounded-3xl shadow-2xl border border-[var(--border)]/40 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Close Button */}
            <button
              onClick={() => setIsBulkOrderOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-2.5 rounded-full bg-white hover:bg-[var(--primary)]/10 text-[var(--foreground)] transition-colors shadow-sm cursor-pointer border border-[var(--border)]/20"
              aria-label="Close wholesale modal"
            >
              <X size={20} />
            </button>

            {/* Modal Body: Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
              
              {/* Left Column: Product Gallery */}
              <div className="lg:col-span-6 flex flex-col sm:flex-row gap-4">
                {/* Thumbnails list */}
                <div className="flex sm:flex-col gap-2.5 order-2 sm:order-1 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 shrink-0">
                  {currentProduct.images.map((img, idx) => (
                    <button
                      key={img}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30 shadow-md scale-102'
                          : 'border-[var(--border)]/30 opacity-70 hover:opacity-100 hover:border-[var(--primary)]/50'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${currentProduct.name} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Main Hero Image */}
                <div className="relative flex-1 rounded-3xl overflow-hidden bg-white border border-[var(--border)]/30 shadow-inner order-1 sm:order-2 aspect-4/3 sm:aspect-square flex items-center justify-center">
                  <img
                    src={activeImage}
                    alt={currentProduct.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md">
                    WHOLESALE • B2B DISPATCH
                  </div>
                </div>
              </div>

              {/* Right Column: Wholesale Specifications & Action */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                
                {/* Title & Product Switcher */}
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full border border-[var(--primary)]/20">
                      FACTORY WHOLESALE ORDER
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--foreground)] leading-tight">
                    {currentProduct.name} <span className="text-[var(--primary)]">(BULK)</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--foreground)]/70 font-medium mt-1">
                    {currentProduct.subtitle}
                  </p>

                  {/* Clean 2-Product Toggle (Strictly 2 products, no Suta / sub-categories) */}
                  <div className="mt-5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/60 mb-2">
                      SELECT WHOLESALE PRODUCT
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {WHOLESALE_PRODUCTS.map((prod, idx) => (
                        <button
                          key={prod.id}
                          onClick={() => handleProductSelect(idx)}
                          className={`p-3 rounded-2xl text-left font-bold text-xs sm:text-sm transition-all border cursor-pointer flex items-center justify-between ${
                            selectedProductIndex === idx
                              ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md'
                              : 'bg-white text-[var(--foreground)]/80 border-[var(--border)]/40 hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5'
                          }`}
                        >
                          <span className="truncate">{prod.name.replace('Bulk ', '')}</span>
                          {selectedProductIndex === idx && <Check size={16} className="text-white shrink-0 ml-1" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Product Highlights */}
                <div className="bg-white rounded-2xl p-4 border border-[var(--border)]/30 shadow-xs">
                  <p className="text-xs text-[var(--foreground)]/80 leading-relaxed mb-3">
                    {currentProduct.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]/20">
                    {currentProduct.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--foreground)]/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quantity Stepper (Min 50 KG, Adjustments of 50 KG) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/60">
                      ORDER QUANTITY (KG)
                    </label>
                    <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">
                      Min 50 KG • 50 KG Steps
                    </span>
                  </div>

                  <div className="flex items-center gap-4 bg-white border-2 border-[var(--border)]/40 rounded-2xl p-2 shadow-xs">
                    {/* Decrement Button */}
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantityKg <= 50}
                      className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[var(--primary)] transition-all cursor-pointer font-bold"
                      title={quantityKg <= 50 ? 'Minimum wholesale order is 50 KG' : 'Decrease by 50 KG'}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={18} />
                    </button>

                    {/* Quantity Display */}
                    <div className="flex-1 text-center">
                      <span className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
                        {quantityKg}
                      </span>
                      <span className="text-sm font-extrabold text-[var(--primary)] ml-1.5 uppercase">
                        KG
                      </span>
                      <p className="text-[10px] font-semibold text-[var(--foreground)]/50">
                        ({Math.round(quantityKg / 50)} × 50 KG Master Sacks)
                      </p>
                    </div>

                    {/* Increment Button */}
                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white flex items-center justify-center text-[var(--primary)] transition-all cursor-pointer active:scale-95 font-bold"
                      title="Increase by 50 KG"
                      aria-label="Increase quantity"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* GET QUOTE CTA (Opens Direct Quote Popup) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="w-full py-4 px-6 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 active:scale-[0.99] text-white font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 cursor-pointer group"
                  >
                    <MessageCircle size={20} className="text-white group-hover:scale-110 transition-transform" />
                    <span>GET QUOTE</span>
                  </button>
                  <p className="text-[10px] text-center text-[var(--foreground)]/50 mt-2 font-medium">
                    ⚡ Instant quotation & dispatch timelines via WhatsApp & Email
                  </p>
                </div>

                {/* Trust & Logistics Footer Points (Matching Reference) */}
                <div className="space-y-2.5 pt-4 border-t border-[var(--border)]/30 text-[11px] text-[var(--foreground)]/70 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Truck size={16} className="text-[var(--primary)] shrink-0" />
                    <span>Pan-India Bulk Delivery via Reliable Road Logistics</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-[var(--primary)] shrink-0" />
                    <span>Direct Factory & Mandi Dispatch from Meerut</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-[var(--primary)] shrink-0" />
                    <span>FSSAI Certified, Lab Reports & GST Tax Invoicing Provided</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Package size={16} className="text-[var(--primary)] shrink-0" />
                    <span>Supplied in Heavy-Duty Airtight 50 KG Moisture-Barrier Sacks</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Quote Dialog Popup */}
      <BulkQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        selectedProduct={currentProduct}
        quantityKg={quantityKg}
        onQuantityChange={(newQty) => setQuantityKg(newQty)}
      />
    </>
  );
};
