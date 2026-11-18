import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { MessageCircle, Mail, MapPin, ShieldCheck, Heart, Sparkles } from 'lucide-react';
export const Footer = () => {
    const { openPolicy, settings, setIsBulkOrderOpen } = useStore();
    return (<footer className="bg-[var(--primary)] text-[var(--background)] pt-16 pb-10 border-t border-[var(--border)]/20 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/popco-logo.webp" alt="PopCo" className="h-16 w-auto object-contain"/>
              <div>
                <span className="block text-2xl font-black tracking-wider text-white">
                  POPCO
                </span>
                <span className="block text-[10px] tracking-widest text-[var(--secondary-foreground)] font-bold">
                  PREMIUM BIHAR MAKHANA
                </span>
              </div>
            </Link>

            <p className="text-xs text-white/75 leading-relaxed max-w-sm">
              POP CO – Bringing Quality, Taste & Goodness to Everyday Living. An emerging brand crafting delicious, better snacking choices with directly sourced Bihar Makhana, Roasted Edamame, and Masala Tea. Naturally Good, Simply Delicious!
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-extrabold tracking-widest uppercase text-white/90">
              <span className="bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={11} className="text-[var(--secondary-foreground)]"/>
                GI Tagged Origin
              </span>
              <span className="bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={11} className="text-[var(--secondary-foreground)]"/>
                100% Raw & Natural
              </span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
              Explore
            </h4>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-white/70">
              <li>
                <a href="/#about" className="hover:text-white transition-colors">
                  About POP CO
                </a>
              </li>
              <li>
                <a href="/#shop" className="hover:text-white transition-colors">
                  All Products
                </a>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => setIsBulkOrderOpen(true)} 
                  className="hover:text-white transition-colors text-left cursor-pointer uppercase text-xs font-bold"
                >
                  Bulk Order (10 Jars)
                </button>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  My Profile & Orders
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-[var(--secondary-foreground)] hover:text-white transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
              Policies
            </h4>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-white/70">
              <li>
                <button onClick={() => openPolicy('about')} className="hover:text-white transition-colors text-left cursor-pointer">
                  About POP CO
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('faq')} className="hover:text-white transition-colors text-left cursor-pointer">
                  FAQ & Support
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
                <button onClick={() => openPolicy('cancellation')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Cancellation & Refund
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('sitemap')} className="hover:text-white transition-colors text-left cursor-pointer">
                  Sitemap
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[var(--secondary-foreground)] shrink-0 mt-0.5"/>
                <span>O-Pocket Pallavpuram Phase-2 Modipuram Meerut 250110</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[var(--secondary-foreground)] shrink-0"/>
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-white transition-colors underline">
                  {settings.supportEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={16} className="text-[var(--secondary-foreground)] shrink-0"/>
                <a href={`https://wa.me/${settings.whatsappNumber}?text=Hello%20PopCo`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-bold text-white">
                  WhatsApp: +91 8080808447
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <a href="https://wa.me/918080808447?text=Hello%20PopCo%2C%20I%20am%20interested%20in%20partnering%20with%20you" target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-[var(--secondary-foreground)] hover:bg-[var(--secondary-foreground)]/90 text-white font-extrabold text-[10px] tracking-wider uppercase rounded-full shadow-md transition-all">
                Wholesale Inquiry
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} PopCo Makhana. Crafted with</span>
            <Heart size={13} className="text-red-400 fill-red-400"/>
            <span>in Mithilanchal, Bihar.</span>
          </p>
          <div className="flex items-center gap-4 text-[11px] font-bold tracking-wider uppercase">
            <span>Razorpay Verified</span>
            <span>•</span>
            <span>PCI-DSS Compliant</span>
            <span>•</span>
            <span>Fast Express Dispatch</span>
          </div>
        </div>
      </div>
    </footer>);
};
