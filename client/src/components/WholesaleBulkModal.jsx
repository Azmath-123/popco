import React, { useState } from 'react';
import { 
  X, 
  Minus, 
  Plus, 
  Truck, 
  ShieldCheck, 
  FileText, 
  Package, 
  Check, 
  Sparkles, 
  Sun, 
  Award, 
  Zap, 
  Leaf 
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useStore } from '../context/StoreContext';
import { BulkQuoteModal } from './BulkQuoteModal';

const WHOLESALE_PRODUCTS = [
  {
    id: 'bulk-makhana',
    name: 'Raw Makhana',
    shortName: 'Raw Makhana',
    subtitle: 'Direct Meerut Dispatch • Premium Jumbo Grade',
    images: [
      '/products/popco-raw-makhana-200g-lifestyle-01.webp',
      '/products/popco-raw-makhana-200g-front.webp',
      '/products/popco-raw-makhana-200g-lifestyle-02.webp',
      '/products/popco-raw-makhana-200g-lifestyle-03.webp',
    ],
    features: [
      { icon: Sun, label: '100% Sun-Dried Natural' },
      { icon: Award, label: 'Direct Meerut Origin' },
      { icon: Sparkles, label: 'Jumbo 6+ Suta Kernels' },
      { icon: ShieldCheck, label: 'Zero Additives or Bleach' }
    ]
  },
  {
    id: 'bulk-edamame',
    name: 'Roasted Edamame',
    shortName: 'Roasted Edamame',
    subtitle: 'High Protein • Crunchy Roasted Soy Snack',
    images: [
      '/products/popco-roasted-edamame-150g-lifestyle-04.jpg',
      '/products/popco-roasted-edamame-150g-front.jpg',
      '/products/popco-roasted-edamame-150g-lifestyle-01.jpg',
      '/products/popco-roasted-edamame-150g-lifestyle-02.jpg',
    ],
    features: [
      { icon: Zap, label: '46% Plant-Based Protein' },
      { icon: Sun, label: 'Slow Hot-Air Roasted' },
      { icon: Leaf, label: 'Gluten-Free & 100% Vegan' },
      { icon: ShieldCheck, label: 'Pure Sea Salt Seasoning' }
    ]
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
        <div className="min-h-screen px-2.5 sm:px-4 py-4 sm:py-10 flex items-center justify-center">
          <div className="relative w-full max-w-5xl bg-[var(--background)] rounded-2xl sm:rounded-3xl shadow-2xl border border-[var(--border)]/40 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Close Button */}
            <button
              onClick={() => setIsBulkOrderOpen(false)}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20 p-2 sm:p-2.5 rounded-full bg-white hover:bg-[var(--primary)]/10 text-[var(--foreground)] transition-colors shadow-sm cursor-pointer border border-[var(--border)]/20"
              aria-label="Close wholesale modal"
            >
              <X size={18} />
            </button>

            {/* Modal Body: Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 p-4 sm:p-10">
              
              {/* Left Column: Product Gallery (Spacious, uncropped, free image presentation) */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-3 sm:space-y-4">
                
                {/* Main Hero Image Frame */}
                <div className="relative w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex items-center justify-center border border-[var(--border)]/30 shadow-xs min-h-[220px] sm:min-h-[380px] overflow-hidden">
                  <img
                    src={activeImage}
                    alt={currentProduct.name}
                    className="w-full h-full max-h-[240px] sm:max-h-[340px] object-contain transition-all duration-300 drop-shadow-sm hover:scale-102"
                  />
                  
                  {/* Subtle Factory Badge */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[var(--primary)] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                    <Package size={11} />
                    <span>WHOLESALE • B2B DISPATCH</span>
                  </div>
                </div>

                {/* Horizontal Thumbnails Row (Clean, centered, not crowding the main image) */}
                <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-1 overflow-x-auto pb-1">
                  {currentProduct.images.map((img, idx) => (
                    <button
                      key={img}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden p-1 bg-white border-2 transition-all cursor-pointer shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30 shadow-sm scale-105'
                          : 'border-[var(--border)]/40 opacity-70 hover:opacity-100 hover:border-[var(--primary)]/50'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${currentProduct.name} preview ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Clean, Modern Information & Action */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
                
                {/* Title & Product Switcher */}
                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full border border-[var(--primary)]/20">
                    <Sparkles size={12} />
                    <span>FACTORY WHOLESALE ORDER</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--foreground)] mt-2">
                    {currentProduct.name} <span className="text-[var(--primary)] font-bold">(BULK)</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--foreground)]/70 font-medium mt-0.5">
                    {currentProduct.subtitle}
                  </p>

                  {/* Clean 2-Product Segmented Toggle */}
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--primary)]/5 rounded-2xl border border-[var(--border)]/30">
                      {WHOLESALE_PRODUCTS.map((prod, idx) => (
                        <button
                          key={prod.id}
                          onClick={() => handleProductSelect(idx)}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all border-0 cursor-pointer flex items-center justify-center gap-2 ${
                            selectedProductIndex === idx
                              ? 'bg-[var(--primary)] text-white shadow-sm'
                              : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-white/60'
                          }`}
                        >
                          <span>{prod.shortName}</span>
                          {selectedProductIndex === idx && <Check size={16} className="text-white shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feature Cards Grid (Clean Icons, No Dense Text Paragraphs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {currentProduct.features.map((feat) => {
                    const FeatIcon = feat.icon;
                    return (
                      <div 
                        key={feat.label} 
                        className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white border border-[var(--border)]/30 shadow-xs"
                      >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                          <FeatIcon size={15} />
                        </div>
                        <span className="text-[11px] sm:text-xs font-bold text-[var(--foreground)]/80 leading-snug">
                          {feat.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Quantity Stepper (Min 50 KG, Adjustments of 50 KG) */}
                <div className="bg-white rounded-2xl p-4 border border-[var(--border)]/30 shadow-xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/60">
                      ORDER QUANTITY (KG)
                    </span>
                    <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">
                      Min 50 KG • 50 KG Steps
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    {/* Decrement Button */}
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantityKg <= 50}
                      className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-[var(--primary)] transition-all cursor-pointer font-bold shrink-0"
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
                      <p className="text-[10px] font-semibold text-[var(--foreground)]/50 mt-0.5">
                        ({Math.round(quantityKg / 50)} × 50 KG Master Sacks)
                      </p>
                    </div>

                    {/* Increment Button */}
                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white flex items-center justify-center text-[var(--primary)] transition-all cursor-pointer active:scale-95 font-bold shrink-0"
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
                    className="w-full py-4 px-6 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 active:scale-[0.99] text-white font-black uppercase tracking-widest text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                  >
                    <FaWhatsapp size={20} className="text-white group-hover:scale-110 transition-transform" />
                    <span>GET INSTANT QUOTE</span>
                  </button>
                  <p className="text-[10px] text-center text-[var(--foreground)]/50 mt-2 font-medium">
                    ⚡ Instant wholesale rates & dispatch timeline via WhatsApp
                  </p>
                </div>

                {/* Trust & Logistics Compact Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[var(--border)]/30 text-center">
                  <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/60 border border-[var(--border)]/20">
                    <Truck size={17} className="text-[var(--primary)]" />
                    <span className="text-[10px] font-bold text-[var(--foreground)]/70">Pan-India</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/60 border border-[var(--border)]/20">
                    <ShieldCheck size={17} className="text-[var(--primary)]" />
                    <span className="text-[10px] font-bold text-[var(--foreground)]/70">Meerut Mandi</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/60 border border-[var(--border)]/20">
                    <FileText size={17} className="text-[var(--primary)]" />
                    <span className="text-[10px] font-bold text-[var(--foreground)]/70">GST & FSSAI</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/60 border border-[var(--border)]/20">
                    <Package size={17} className="text-[var(--primary)]" />
                    <span className="text-[10px] font-bold text-[var(--foreground)]/70">50KG Sacks</span>
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
