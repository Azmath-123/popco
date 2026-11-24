import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Mail, MapPin, Heart, Lock, Truck } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export const Footer = () => {
  const { openPolicy, settings, setIsBulkOrderOpen } = useStore();

  return (
    <footer className="bg-[var(--primary)] text-white pt-14 pb-8 border-t border-black/10 mt-auto font-sans relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/15">
          {/* Col 1: Brand Info (5 cols) */}
          <div className="lg:col-span-5 flex items-start">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/popco-logo.webp" alt="PopCo" className="h-14 w-auto object-contain drop-shadow-sm" />
              <div>
                <span className="block text-2xl font-black tracking-wider text-white">
                  POPCO
                </span>
                <span className="block text-[10px] tracking-widest text-white/80 font-bold uppercase">
                  Premium Superfoods
                </span>
              </div>
            </Link>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/90 border-b border-white/15 pb-2">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-white/75">
              <li>
                <a href="/#shop" className="hover:text-white transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                {/* <button 
                    type="button"
                    onClick={() => setIsBulkOrderOpen(true)} 
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Bulk 10-Jar Pack
                  </button> */}
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care / Policies (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/90 border-b border-white/15 pb-2">
              Help & Policies
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-white/75">
              <li>
                <button onClick={() => openPolicy('faq')} className="hover:text-white transition-colors text-left cursor-pointer">
                  FAQs & Support
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('privacy')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('terms')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <Link to="/admin" className="text-white/60 hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & WhatsApp (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/90 border-b border-white/15 pb-2">
              Get in Touch
            </h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="text-white/70 shrink-0 mt-0.5" />
                <span className="leading-snug">Modipuram, Meerut, UP 250110</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-white/70 shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-white transition-colors">
                  {settings.supportEmail}
                </a>
              </li>
              <li className="pt-1">
                <a
                  href={`https://wa.me/${settings.whatsappNumber}?text=Hello%20PopCo`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 hover:text-white transition-colors"
                >
                  <FaWhatsapp size={16} className="text-emerald-300" />
                  <span>Chat on WhatsApp</span>
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=Hello%20PopCo%2C%20I%20am%20interested%20in%20partnering%20with%20you`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-[var(--primary)] hover:bg-white/90 font-bold text-xs rounded-full shadow-sm transition-all"
              >
                <FaWhatsapp size={15} />
                <span> Inquiries</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Trending Visual Trust Badges */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <p className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} POP CO Superfoods. Crafted with</span>
            <Heart size={13} className="text-red-300 fill-red-300" />
            <span>in Meerut.</span>
          </p>

          {/* Trending Modern Trust Badges - Icons Only */}
          <div className="flex items-center gap-2">
            {/* Razorpay Verified Badge */}
            <span
              title="Razorpay Verified"
              aria-label="Razorpay Verified"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-sky-300 fill-current" viewBox="0 0 24 24">
                <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.324-4.881 16.275 11.34-16.275h-5.464z" />
              </svg>
            </span>

            {/* 100% Safe Checkout Badge */}
            <span
              title="100% Safe Checkout"
              aria-label="100% Safe Checkout"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <Lock size={15} className="text-emerald-300" />
            </span>

            {/* Express Dispatch Badge */}
            <span
              title="Express Dispatch"
              aria-label="Express Dispatch"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center shadow-xs transition-all cursor-pointer"
            >
              <Truck size={16} className="text-amber-300" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
