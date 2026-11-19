import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { HeroSlider } from '../components/HeroSlider';
import { HomepageComboSection } from '../components/HomepageComboSection';
import { Star, ShoppingBag, Eye, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
      <section className="bg-white py-6 border-b border-[var(--border)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--background)] border border-[var(--border)]/10 flex items-center justify-center p-2.5 shrink-0">
                <img src="/leaf.svg" alt="100% Natural" className="w-full h-full object-contain"/>
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase text-[var(--foreground)]">100% Natural</h4>
                <p className="text-[10px] text-[var(--foreground)]/70 font-sans font-medium">Zero Preservatives & Additives</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--background)] border border-[var(--border)]/10 flex items-center justify-center p-2.5 shrink-0">
                <img src="/home.svg" alt="Meerut Origin" className="w-full h-full object-contain"/>
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase text-[var(--foreground)]">Direct From Source</h4>
                <p className="text-[10px] text-[var(--foreground)]/70 font-sans font-medium">Direct Meerut Origin & Distribution</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--background)] border border-[var(--border)]/10 flex items-center justify-center p-2.5 shrink-0">
                <img src="/shield.svg" alt="6+ Suta Jumbo" className="w-full h-full object-contain"/>
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase text-[var(--foreground)]">6+ Suta Jumbo</h4>
                <p className="text-[10px] text-[var(--foreground)]/70 font-sans font-medium">Double-Cleaned & Hand-Graded</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--background)] border border-[var(--border)]/10 flex items-center justify-center p-2.5 shrink-0">
                <img src="/heart.svg" alt="Ayurvedic Superfood" className="w-full h-full object-contain"/>
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase text-[var(--foreground)]">Ayurvedic Superfood</h4>
                <p className="text-[10px] text-[var(--foreground)]/70 font-sans font-medium">High Protein & Zero Cholesterol</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Catalog Section (#shop) */}
      <section id="shop" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Heading & Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[var(--secondary-foreground)] text-xs font-extrabold uppercase tracking-widest">
            <Sparkles size={14}/>
            <span>Healthy Everyday Snacking</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-[var(--foreground)] tracking-tight">
            Explore POP CO Superfoods
          </h2>
          <p className="text-xs sm:text-sm text-[var(--foreground)]/75 font-sans uppercase tracking-wider">
            From raw Meerut Makhana pearls to protein-rich roasted Edamame beans.
          </p>
        </div>

        {/* Filter Controls & Categories */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
            { id: 'all', label: 'All Products' },
            { id: 'raw', label: 'Raw Makhana (200gm)' },
            { id: 'snacks', label: 'Roasted Edamame (150gm)' },
        ].map((cat) => (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${selectedCategory === cat.id
                ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20 scale-102'
                : 'bg-white text-[var(--foreground)]/80 border border-[var(--border)]/20 hover:border-[var(--border)] hover:text-[var(--foreground)]'}`}>
                {cat.label}
              </button>))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--foreground)]/80">
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
            <ShoppingBag size={40} className="mx-auto text-[var(--foreground)]/30"/>
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
          </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
                const discountPercent = Math.round(((product.originalPrice - product.numericPrice) / product.originalPrice) * 100);
                return (<div key={product.id} onClick={() => navigate(`/product/${product.slug}`)} className="group bg-white rounded-2xl border border-[var(--border)]/15 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1.5 relative">
                  {/* Discount Badge */}
                  {discountPercent > 0 && (<span className="absolute top-3 left-3 z-10 bg-[var(--secondary-foreground)] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider">
                      SAVE {discountPercent}%
                    </span>)}

                  {/* Rating Pill */}
                  <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-extrabold text-[var(--foreground)] flex items-center gap-1 shadow-xs border border-[var(--border)]/10">
                    <Star size={11} className="fill-amber-400 text-amber-500"/>
                    <span>{product.rating}.0</span>
                  </div>

                  {/* Image Container with Smooth Hover Effect */}
                  <div className="w-full h-60 bg-[var(--background)] p-4 flex items-center justify-center overflow-hidden relative border-b border-[var(--border)]/5">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" loading="lazy"/>
                    {/* Hover Quick View Overlay */}
                    <div className="absolute inset-0 bg-[var(--primary)]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-[var(--foreground)] text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-md flex items-center gap-1.5">
                        <Eye size={13}/>
                        <span>View Details</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-black uppercase text-[var(--foreground)] tracking-wide group-hover:text-[var(--secondary-foreground)] transition-colors leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-[11px] font-bold text-[var(--secondary-foreground)] mt-0.5 uppercase tracking-wider">
                        {product.weight}
                      </p>
                      <p className="text-[11px] text-[var(--foreground)]/70 font-sans line-clamp-2 mt-1 leading-snug">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-2 border-t border-[var(--border)]/10 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-[var(--foreground)]">
                            ₹{product.numericPrice}
                          </span>
                          <span className="text-xs text-[var(--foreground)]/40 line-through font-semibold">
                            ₹{product.originalPrice}
                          </span>
                        </div>
                        <span className="text-[9px] text-[var(--foreground)]/60 font-bold uppercase tracking-wider block">
                          Taxes Included
                        </span>
                      </div>

                      <button onClick={(e) => handleQuickAdd(product, e)} className="p-2.5 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--secondary-foreground)] transition-all shadow-md active:scale-95 cursor-pointer" title="Add to cart">
                        <ShoppingBag size={15}/>
                      </button>
                    </div>
                  </div>
                </div>);
            })}
          </div>)}
      </section>

      {/* 4. Interactive 10-Pack Custom Combo Builder (₹1,799) */}
      <HomepageComboSection />

      {/* 5. Brand Story & Nutrition Breakdown - About POP CO & Vision */}
      <section id="about" className="bg-white py-16 border-y border-[var(--border)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Row: About POP CO & Brand Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <div className="flex items-center gap-1.5 text-[var(--secondary-foreground)] text-xs font-black uppercase tracking-widest">
                <Sparkles size={15}/>
                <span>About POP CO</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase text-[var(--foreground)] tracking-tight leading-tight">
                Bringing Quality, Taste & Goodness to Everyday Living
              </h2>
              <p className="text-xs sm:text-sm text-[var(--foreground)]/85 font-sans leading-relaxed font-medium">
                POP CO is an emerging food brand built with a vision to bring quality food products, delicious flavours, and better snacking choices to everyday consumers.
              </p>
              <p className="text-xs sm:text-sm text-[var(--foreground)]/80 font-sans leading-relaxed">
                We are beginning our journey with three carefully selected products: <strong className="text-[var(--foreground)]">Makhana</strong>, <strong className="text-[var(--foreground)]">Roasted Edamame</strong>, and <strong className="text-[var(--foreground)]">Masala Tea</strong>, with a long-term vision of establishing POP CO as a trusted name in the dry fruits, healthy snacks, tea, and food essentials industry.
              </p>
              <p className="text-xs sm:text-sm text-[var(--foreground)]/80 font-sans leading-relaxed">
                Our makhana is crafted and packed in Meerut, ensuring uncompromised purity and bringing the goodness of traditional Indian superfoods to your table.
              </p>

              {/* Initial Product Range Cards */}
              <div className="pt-2 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--secondary-foreground)]"></span>
                  Our Initial Product Range
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[var(--background)] rounded-2xl border border-[var(--border)]/10 space-y-1.5 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary-foreground)] bg-white px-2 py-0.5 rounded-full inline-block">01</span>
                    <h5 className="text-xs font-black uppercase text-[var(--foreground)]">Makhana</h5>
                    <p className="text-[11px] text-[var(--foreground)]/75 font-sans leading-snug">Processed and packed in Meerut, bringing the goodness of a traditional Indian snack.</p>
                  </div>
                  <div className="p-3.5 bg-[var(--background)] rounded-2xl border border-[var(--border)]/10 space-y-1.5 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary-foreground)] bg-white px-2 py-0.5 rounded-full inline-block">02</span>
                    <h5 className="text-xs font-black uppercase text-[var(--foreground)]">Roasted Edamame</h5>
                    <p className="text-[11px] text-[var(--foreground)]/75 font-sans leading-snug">A tasty and protein-rich snacking option for modern consumers.</p>
                  </div>
                  <div className="p-3.5 bg-[var(--background)] rounded-2xl border border-[var(--border)]/10 space-y-1.5 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary-foreground)] bg-white px-2 py-0.5 rounded-full inline-block">03</span>
                    <h5 className="text-xs font-black uppercase text-[var(--foreground)]">Masala Tea</h5>
                    <p className="text-[11px] text-[var(--foreground)]/75 font-sans leading-snug">Bringing the authentic and refreshing flavours of Indian chai to everyday tea lovers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Our Vision & Philosophy Card */}
            <div className="bg-[var(--background)] p-6 sm:p-8 rounded-3xl border border-[var(--border)]/15 shadow-sm space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary-foreground)] bg-white px-3 py-1 rounded-full border border-[var(--border)]/10 inline-block">
                  Future Roadmap
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-[var(--foreground)] tracking-tight">
                  Our Vision
                </h3>
                <p className="text-xs sm:text-sm text-[var(--foreground)]/80 font-sans leading-relaxed">
                  POP CO aims to expand beyond its initial offerings and build a diverse product portfolio across:
                </p>
              </div>

              {/* Portfolio Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'Dry Fruits & Nuts',
                  'Healthy & Roasted Snacks',
                  'Traditional & Innovative Tea Varieties',
                  'Everyday Food & Grocery Products'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-[var(--border)]/10 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0"></span>
                    <span className="text-xs font-extrabold uppercase text-[var(--foreground)]">{item}</span>
                  </div>
                ))}
              </div>

              {/* Beliefs & Commitment */}
              <div className="pt-2 border-t border-[var(--border)]/10 space-y-2.5">
                <p className="text-xs text-[var(--foreground)]/85 font-sans leading-relaxed font-bold">
                  We believe in building a brand that stands for quality, trust, taste, and customer satisfaction.
                </p>
                <p className="text-xs text-[var(--foreground)]/75 font-sans leading-relaxed">
                  As we grow, our focus remains on sourcing quality ingredients, developing products that consumers love, and creating meaningful relationships with customers, suppliers, distributors, and business partners.
                </p>
              </div>

              {/* Tagline Callout */}
              <div className="p-4 bg-[var(--primary)] text-white rounded-2xl text-center shadow-md">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--background)]">
                  POP CO – Naturally Good, Simply Delicious!
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 7. Wholesale & B2B Partner CTA */}
      <section className="bg-[var(--primary)] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--secondary-foreground)] bg-white/10 px-3 py-1 rounded-full">
            FOR RETAILERS, CAFES & COMMERCIAL CATERERS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[var(--background)]">
            Need Bulk Makhana Or Wholesale Sacks?
          </h2>
          <p className="text-xs sm:text-sm text-white/80 font-sans max-w-xl mx-auto leading-relaxed">
            We supply 50KG master sacks direct from our Meerut processing facility with guaranteed premium-grade consistency and factory wholesale pricing.
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-4">
            <button 
              type="button"
              onClick={() => setIsBulkOrderOpen(true)}
              className="px-8 py-3.5 rounded-full bg-[var(--background)] text-[var(--foreground)] text-xs font-black uppercase tracking-widest shadow-xl hover:bg-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles size={16} className="text-[var(--secondary-foreground)]"/>
              <span>Build 10-Jar Custom Combo (₹1,799)</span>
            </button>
            <a href="https://wa.me/918080808447?text=Hello%20PopCo%2C%20I%20am%20interested%20in%20bulk%20and%20wholesale%20makhana%20pricing" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest border border-white/20 transition-all flex items-center gap-2">
              <MessageCircle size={16} className="text-[var(--secondary-foreground)]"/>
              <span>Wholesale WhatsApp (+91 8080808447)</span>
            </a>
            <button onClick={() => openPolicy('faq')} className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest border border-white/20 transition-all cursor-pointer">
              Read Wholesale FAQ
            </button>
          </div>
        </div>
      </section>
    </div>);
};
