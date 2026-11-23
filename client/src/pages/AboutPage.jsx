import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Leaf, 
  MapPin, 
  Coffee, 
  Heart, 
  Award, 
  ShoppingBag, 
  CheckCircle2,
  Package,
  Zap,
  TrendingUp
} from 'lucide-react';

export const AboutPage = ({ onOpenCheckout }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-[var(--background)]">
      {/* 1. Hero Header */}
      <section className="relative bg-gradient-to-b from-[#F5EFE6] via-white to-[var(--background)] py-12 sm:py-24 border-b border-[var(--border)]/15 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[var(--border)]/20 shadow-xs text-xs font-black uppercase tracking-widest text-[var(--secondary-foreground)]">
            <Sparkles size={14} className="text-[var(--primary)]" />
            <span>The POP CO Story</span>
          </div>

          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-serif font-black uppercase text-[#2D2A26] tracking-tight max-w-4xl mx-auto leading-tight">
            Bringing Quality, Taste & Goodness to Everyday Living
          </h1>

          <p className="text-xs sm:text-base text-[var(--foreground)]/75 font-sans max-w-2xl mx-auto leading-relaxed">
            POP CO is an emerging food brand built with a singular vision: to craft delicious flavours, uncompromised purity, and healthier everyday snacking choices for modern consumers.
          </p>

          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <Link
              to="/#shop"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest hover:bg-[var(--secondary-foreground)] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              <span>Explore Our Superfoods</span>
            </Link>

            <a
              href="https://wa.me/918080808447?text=Hello%20PopCo%2C%20I%20would%20like%20to%20know%20more%20about%20your%20brand"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-[var(--foreground)] border border-[var(--border)]/20 text-xs font-bold uppercase tracking-widest hover:bg-[#F5EFE6] transition-all shadow-xs text-center"
            >
              Contact Our Team
            </a>
          </div>
        </div>
      </section>

      {/* 2. Brand Roots & Story */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Image visual */}
          <div className="relative">
            <div className="rounded-2xl sm:rounded-[32px] overflow-hidden border border-[var(--border)]/15 shadow-xl bg-white p-3 sm:p-4">
              <div className="rounded-xl sm:rounded-[24px] overflow-hidden bg-[#F5EFE6] h-[260px] sm:h-[420px] relative">
                <img
                  src="/hero-raw-makhana.jpg"
                  alt="POP CO Harvest & Crafting"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 sm:p-6">
                  <div className="text-white space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--primary)] px-2.5 py-0.5 rounded-full">
                      Meerut Origin
                    </span>
                    <h3 className="text-lg sm:text-2xl font-serif font-black uppercase tracking-wide">
                      Processed & Packed at Source
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/80 font-sans">
                      Handpicked Jumbo 6+ Suta makhana double-cleaned without chemical bleaching.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-6 sm:right-6 bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[var(--border)]/20 shadow-lg sm:shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#E6F0E8] text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-[#2D2A26]">100% Purity Tested</p>
                <p className="text-[10px] text-[var(--foreground)]/60 font-sans">FSSAI Certified • Zero Additives</p>
              </div>
            </div>
          </div>

          {/* Text Story */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--secondary-foreground)]">
                Our Heritage & Roots
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-black uppercase text-[#2D2A26] tracking-tight leading-tight">
                Authentic Indian Superfoods Crafted with Modern Standards
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[var(--foreground)]/80 font-sans leading-relaxed">
              POP CO was created out of a desire to provide families with snacks they can enjoy every day without second thoughts. Traditional Indian superfoods like Fox Nuts (Makhana) have sustained generations with their Ayurvedic light nourishment, but finding consistent, unbleached, jumbo-grade quality in modern stores was challenging.
            </p>

            <p className="text-xs sm:text-sm text-[var(--foreground)]/80 font-sans leading-relaxed">
              By basing our processing and packaging in <strong>Meerut</strong>, we work hand-in-hand with experienced artisans and quality producers. We grade only uniform 6+ Suta kernels, discarding hard seeds and hulls, and packaging immediately to retain the fresh, light crunch.
            </p>

            {/* 4 Pillars Matching Homepage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[var(--border)]/15 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-[var(--primary)]" />
                </div>
                <h4 className="text-xs font-black uppercase text-[#2D2A26]">Direct Meerut Crafting</h4>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[var(--border)]/15 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center shrink-0">
                  <Award size={18} className="text-[var(--primary)]" />
                </div>
                <h4 className="text-xs font-black uppercase text-[#2D2A26]">6+ Suta Jumbo Kernels</h4>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[var(--border)]/15 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center shrink-0">
                  <Leaf size={18} className="text-[var(--primary)]" />
                </div>
                <h4 className="text-xs font-black uppercase text-[#2D2A26]">Clean & High Protein</h4>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[var(--border)]/15 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5EFE6] flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-[var(--primary)]" />
                </div>
                <h4 className="text-xs font-black uppercase text-[#2D2A26]">Slow Roasted Perfection</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Initial Product Trio */}
      <section className="bg-white py-16 sm:py-20 border-y border-[var(--border)]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--secondary-foreground)]">
              Our Journey Begins
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black uppercase text-[#2D2A26] tracking-tight">
              Three Signature Starting Products
            </h2>
            <div className="w-16 h-1 bg-[#234338] mx-auto rounded-full mt-2 mb-3"></div>
            <p className="text-xs sm:text-sm text-[var(--foreground)]/70 font-sans">
              Carefully chosen to deliver balanced nutrition, authentic taste, and everyday versatility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 01 Makhana */}
            <div className="bg-[var(--background)] p-6 rounded-[28px] border border-[var(--border)]/15 flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E6F0E8] flex items-center justify-center text-emerald-800">
                  <Leaf size={22} />
                </div>
                <h3 className="text-base font-black uppercase text-[#2D2A26]">
                  Premium Raw Makhana
                </h3>
                <p className="text-xs text-[var(--foreground)]/75 font-sans leading-relaxed">
                  Processed and hygienically packed in Meerut. Naturally light, wholesome, and versatile for fasting (vrat), evening roasting with ghee, or daily snacking.
                </p>
              </div>
              <Link
                to="/product/mukeja-makhana-200g"
                className="text-xs font-black uppercase tracking-wider text-[var(--primary)] hover:underline inline-flex items-center gap-1.5"
              >
                <span>View Product Details</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* 02 Roasted Edamame */}
            <div className="bg-[var(--background)] p-6 rounded-[28px] border border-[var(--border)]/15 flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E2F0D9] flex items-center justify-center text-lime-900">
                  <Zap size={22} />
                </div>
                <h3 className="text-base font-black uppercase text-[#2D2A26]">
                  Roasted & Salted Edamame
                </h3>
                <p className="text-xs text-[var(--foreground)]/75 font-sans leading-relaxed">
                  Packed with 46% plant-based protein and 14% dietary fiber. Hot-air roasted with pure sea salt for a crispy, satisfying crunch with zero palm oil.
                </p>
              </div>
              <Link
                to="/product/popco-roasted-salted-edamame-beans-150g"
                className="text-xs font-black uppercase tracking-wider text-[var(--primary)] hover:underline inline-flex items-center gap-1.5"
              >
                <span>View Product Details</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* 03 Masala Tea */}
            <div className="bg-[var(--background)] p-6 rounded-[28px] border border-[var(--border)]/15 flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-900">
                  <Coffee size={22} />
                </div>
                <h3 className="text-base font-black uppercase text-[#2D2A26]">
                  Artisan Masala Tea
                </h3>
                <p className="text-xs text-[var(--foreground)]/75 font-sans leading-relaxed">
                  Bringing the authentic, warming aroma of robust Indian chai with traditional aromatic spices. Crafted for everyday tea lovers.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                In Formulation • Launching Soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Future Roadmap & Portfolio Expansion */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#2D2A26] to-[#1E1C1A] text-white rounded-[36px] p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-[#F5EFE6]">
              <TrendingUp size={14} />
              <span>Future Roadmap</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black uppercase tracking-tight">
              Expanding Into Everyday Food Essentials
            </h2>

            <p className="text-xs sm:text-sm text-white/80 font-sans leading-relaxed">
              POP CO is establishing a long-term presence as a household staple. Our product development roadmap focuses on healthy, wholesome, clean-label pantry categories:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { title: 'Dry Fruits & Jumbo Nuts', desc: 'Premium almonds, cashews, and walnuts sourced with strict grading.' },
                { title: 'Healthy & Roasted Snacks', desc: 'Innovative hot-air roasted seeds and lentils seasoned naturally.' },
                { title: 'Traditional & Modern Teas', desc: 'Kadak masala chai, single-estate Assam orthodox, and wellness herbal teas.' },
                { title: 'Everyday Food & Grocery', desc: 'Wholesome staples, cold-pressed items, and unadulterated essentials.' }
              ].map((cat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">{cat.title}</h4>
                  </div>
                  <p className="text-[11px] text-white/70 font-sans">{cat.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link
                to="/#shop"
                className="px-6 py-3 rounded-full bg-white text-[#2D2A26] text-xs font-black uppercase tracking-widest hover:bg-[#F5EFE6] transition-all shadow-md active:scale-95"
              >
                Shop Current Releases
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Brand Motto Callout */}
      <section className="py-12 bg-[#F5EFE6] border-t border-[var(--border)]/15 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-[var(--secondary-foreground)]">
            Our Promise to You
          </p>
          <h3 className="text-xl sm:text-3xl font-serif font-black uppercase text-[#2D2A26] tracking-tight">
            POP CO – Naturally Good, Simply Delicious!
          </h3>
          <p className="text-xs sm:text-sm text-[#2D2A26]/75 font-sans max-w-xl mx-auto">
            From our packing floor in Meerut to your family table, we maintain absolute transparency, honest pricing, and genuine taste in every single pack.
          </p>
        </div>
      </section>
    </div>
  );
};
