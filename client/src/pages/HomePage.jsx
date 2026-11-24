import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { HeroSlider } from '../components/HeroSlider';
import { HomepageComboSection } from '../components/HomepageComboSection';
import { Star, ShoppingBag, Eye, Sparkles, ArrowRight, MapPin, Award, Leaf, ShieldCheck } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
export const HomePage = ({ onOpenCheckout }) => {
  const { products, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, sortBy, setSortBy, addToCart, openPolicy, settings, setIsBulkOrderOpen } = useStore();
  const navigate = useNavigate();
  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchWeight = p.weight.toLowerCase().includes(q);
          return matchName || matchDesc || matchWeight;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low')
          return a.numericPrice - b.numericPrice;
        if (sortBy === 'price-high')
          return b.numericPrice - a.numericPrice;
        if (sortBy === 'rating')
          return b.rating - a.rating;
        // Default: featured first
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);
  const handleQuickAdd = (product, e) => {
    e.stopPropagation();
    const defaultPack = product.packs?.[0] || {
      count: 1,
      label: 'Single Pack',
      price: product.numericPrice,
    };
    addToCart(product, defaultPack, 1);
  };
  return (<div className="flex-1 flex flex-col">
    {/* 1. Hero Section Slider */}
    <HeroSlider />

    {/* 2. Brand Trust Badges Bar */}
    <section className="bg-white py-4 sm:py-6 border-b border-[var(--border)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--background)] border border-[var(--border)]/10 flex items-center justify-center p-2 sm:p-2.5 shrink-0">
              <img src="/leaf.svg" alt="100% Natural" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-extrabold uppercase text-[var(--foreground)] truncate">100% Natural</h4>
              <p className="text-[9px] sm:text-[10px] text-[var(--foreground)]/70 font-sans font-medium line-clamp-1">Zero Preservatives & Additives</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--background)] border border-[var(--border)]/10 flex items-center justify-center p-2 sm:p-2.5 shrink-0">
              <img src="/home.svg" alt="Meerut Origin" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-extrabold uppercase text-[var(--foreground)] truncate">Direct From Source</h4>
              <p className="text-[9px] sm:text-[10px] text-[var(--foreground)]/70 font-sans font-medium line-clamp-1">Direct Meerut Origin & Distribution</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--background)] border border-[var(--border)]/10 flex items-center justify-center p-2 sm:p-2.5 shrink-0">
              <img src="/shield.svg" alt="6+ Suta Jumbo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-extrabold uppercase text-[var(--foreground)] truncate">6+ Suta Jumbo</h4>
              <p className="text-[9px] sm:text-[10px] text-[var(--foreground)]/70 font-sans font-medium line-clamp-1">Double-Cleaned & Hand-Graded</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--background)] border border-[var(--border)]/10 flex items-center justify-center p-2 sm:p-2.5 shrink-0">
              <img src="/heart.svg" alt="Ayurvedic Superfood" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] sm:text-xs font-extrabold uppercase text-[var(--foreground)] truncate">Ayurvedic Superfood</h4>
              <p className="text-[9px] sm:text-[10px] text-[var(--foreground)]/70 font-sans font-medium line-clamp-1">High Protein & Zero Cholesterol</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* 3. Product Catalog Section (#shop) */}
    <section id="shop" className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      {/* Section Heading & Subtitle */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
        <h2 className="text-2xl sm:text-4xl font-serif font-black uppercase text-[#2D2A26] tracking-wider">
          Featured Products
        </h2>
        <div className="w-16 h-1 bg-[#234338] mx-auto rounded-full mt-2"></div>
      </div>

      {/* Filter Controls & Categories */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Category Tab */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className="px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20 cursor-pointer"
          >
            All Products
          </button>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-bold uppercase text-[var(--foreground)]/80">
          <span>Sort By:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-[var(--border)]/20 rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--foreground)] outline-none cursor-pointer uppercase">
            <option value="featured">Featured Harvest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (<div className="text-center py-16 bg-white rounded-2xl border border-[var(--border)]/10 space-y-3">
        <ShoppingBag size={40} className="mx-auto text-[var(--foreground)]/30" />
        <h3 className="text-lg font-black uppercase text-[var(--foreground)]">No Products Found</h3>
        <p className="text-xs text-[var(--foreground)]/70 font-sans">
          Try selecting another category or clearing your search keywords.
        </p>
        <button onClick={() => {
          setSelectedCategory('all');
          setSearchQuery('');
        }} className="px-6 py-2 bg-[var(--primary)] text-white text-xs font-bold uppercase rounded-full">
          Reset Filters
        </button>
      </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => {
          const discountPercent = Math.round(((product.originalPrice - product.numericPrice) / product.originalPrice) * 100);
          const formattedWeight = (product.weight || '').replace(/gm$/i, 'G').toUpperCase();

          return (<div key={product.id} onClick={() => navigate(`/product/${product.slug}`)} className="group bg-white rounded-2xl sm:rounded-[28px] border border-[#EFE8DE] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1.5 p-3.5 sm:p-4">
            <div>
              {/* Image Container matching design */}
              <div className="w-full h-56 sm:h-72 bg-[#F5EFE6] rounded-xl sm:rounded-[22px] p-4 flex items-center justify-center overflow-hidden relative">
                {/* Discount Badge */}
                {discountPercent > 0 && (<span className="absolute top-3 left-3 z-10 bg-[var(--primary)] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider">
                  SAVE {discountPercent}%
                </span>)}

                {/* Rating Pill */}
                <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-extrabold text-[#2D2A26] flex items-center gap-1 shadow-xs border border-[var(--border)]/10">
                  <Star size={10} className="fill-amber-400 text-amber-500" />
                  <span>{product.rating}.0</span>
                </div>

                <img src={product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108" loading="lazy" />
              </div>

              {/* Product Title */}
              <div className="py-3 px-1 text-center">
                <h3 className="text-xs sm:text-sm font-extrabold uppercase text-[#2D2A26] tracking-wider leading-snug group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </div>
            </div>

            {/* Bottom Bar: Amount Button (Hover -> Add to Cart) + Weight Size */}
            <div className="flex items-center gap-2 pt-1">
              {/* Left Pill: Amount Button -> Add to Cart on Hover */}
              <button
                type="button"
                onClick={(e) => handleQuickAdd(product, e)}
                className="group/btn relative flex-1 h-10 sm:h-11 px-2.5 rounded-xl bg-[#F6EFE5] hover:bg-[var(--primary)] text-[#2D2A26] hover:text-white transition-all duration-300 font-extrabold text-xs sm:text-sm tracking-wider cursor-pointer shadow-xs active:scale-95 flex items-center justify-center overflow-hidden border border-transparent hover:border-[var(--primary)]"
                title="Add to cart"
              >
                {/* Normal State: Amount (with icon on mobile) */}
                <span className="flex items-center justify-center gap-1.5 transition-all duration-300 sm:group-hover/btn:-translate-y-8 sm:group-hover/btn:opacity-0 font-extrabold text-xs sm:text-sm">
                  <ShoppingBag size={13} className="sm:hidden text-[var(--primary)]" />
                  <span>₹{product.numericPrice}</span>
                </span>

                {/* Hover State: Add to Cart */}
                <span className="hidden sm:flex absolute inset-0 items-center justify-center gap-1.5 transition-all duration-300 translate-y-8 opacity-0 group-hover/btn:translate-y-0 group-hover/btn:opacity-100 font-black text-[11px] sm:text-xs uppercase tracking-wider text-white">
                  <ShoppingBag size={14} />
                  <span>Add To Cart</span>
                </span>
              </button>

              {/* Right Pill: Weight Size */}
              <div className="flex-1 h-10 sm:h-11 px-2.5 rounded-xl bg-[#F6EFE5] text-[#2D2A26] font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center select-none text-center">
                {formattedWeight || 'PACK'}
              </div>
            </div>
          </div>);
        })}
      </div>)}
    </section>

    {/* 4. Interactive 10-Pack Custom Combo Builder (₹1,799) */}
    {/* <HomepageComboSection /> */}

    {/* 5. Brand Story - About POP CO & 4 Key Pillars */}
    {/*
    <section id="about" className="bg-white py-16 sm:py-20 border-y border-[var(--border)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[#F5EFE6] px-3.5 py-1.5 rounded-full border border-[var(--border)]/15 text-xs font-black uppercase tracking-widest text-[var(--secondary-foreground)]">
              <Sparkles size={14} className="text-[var(--primary)]" />
              <span>About POP CO</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black uppercase text-[#2D2A26] tracking-tight leading-tight">
              Bringing Quality, Taste & Goodness to Everyday Living
            </h2>

            <div className="pt-1">
              <Link
                to="/about"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest hover:bg-[var(--secondary-foreground)] hover:shadow-xl transition-all shadow-md active:scale-95 group cursor-pointer"
              >
                <span>About Us</span>
                <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>

            <div className="pt-4 border-t border-[var(--border)]/10 flex flex-wrap items-center gap-4 text-[11px] font-bold text-[var(--foreground)]/70 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
                100% Natural
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
                No Palm Oil
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
                Zero Preservatives
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="p-5 rounded-2xl bg-[#F5EFE6]/70 hover:bg-[#F5EFE6] border border-[#EFE8DE] transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
                <MapPin size={20} className="text-[var(--primary)]" />
              </div>
              <h4 className="text-xs sm:text-sm font-black uppercase text-[#2D2A26] tracking-wide leading-snug">
                Direct Meerut Crafting
              </h4>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5EFE6]/70 hover:bg-[#F5EFE6] border border-[#EFE8DE] transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
                <Award size={20} className="text-[var(--primary)]" />
              </div>
              <h4 className="text-xs sm:text-sm font-black uppercase text-[#2D2A26] tracking-wide leading-snug">
                6+ Suta Jumbo Kernels
              </h4>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5EFE6]/70 hover:bg-[#F5EFE6] border border-[#EFE8DE] transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
                <Leaf size={20} className="text-[var(--primary)]" />
              </div>
              <h4 className="text-xs sm:text-sm font-black uppercase text-[#2D2A26] tracking-wide leading-snug">
                Clean & High Protein
              </h4>
            </div>

            <div className="p-5 rounded-2xl bg-[#F5EFE6]/70 hover:bg-[#F5EFE6] border border-[#EFE8DE] transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck size={20} className="text-[var(--primary)]" />
              </div>
              <h4 className="text-xs sm:text-sm font-black uppercase text-[#2D2A26] tracking-wide leading-snug">
                Slow Roasted Perfection
              </h4>
            </div>
          </div>

        </div>
      </div>
    </section>
    */}


    {/* 7. Wholesale & B2B Partner CTA - Full Width */}
    <section className="w-full bg-gradient-to-br from-[#9c0008] via-[#8c0007] to-[#6b0006] text-white py-16 sm:py-20 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-white/95 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
          <Sparkles size={13} className="text-amber-300" />
          <span>For Retailers, Cafes & Caterers</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Need Bulk Makhana or Snacks?
        </h2>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
          {/* <button
            type="button"
            onClick={() => setIsBulkOrderOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-[#9c0008] text-xs font-extrabold uppercase tracking-wider shadow-lg hover:bg-[#F5EFE6] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles size={15} />
            <span>Build 10-Jar Custom Combo</span>
          </button> */}

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <a
              href="https://wa.me/918080808447?text=Hello%20PopCo%2C%20I%20am%20interested%20in%20bulk%20and%20wholesale%20makhana%20pricing"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Inquiry"
              title="Chat on WhatsApp"
              className="flex-1 sm:flex-none sm:w-11 h-11 px-4 sm:px-0 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs uppercase"
            >
              <FaWhatsapp size={20} className="text-white" />
              <span className="sm:hidden">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => openPolicy('faq')}
              className="flex-1 sm:flex-none px-5 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-white/90 hover:text-white text-xs font-bold uppercase tracking-wider border border-white/20 transition-all cursor-pointer text-center"
            >
              FAQ
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>);
};
