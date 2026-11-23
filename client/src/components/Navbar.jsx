import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { FaWhatsapp } from 'react-icons/fa';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Menu, 
  X, 
  Sparkles, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Coffee, 
  ArrowRight 
} from 'lucide-react';

const PRODUCTS_DATA = [
  {
    id: 'makhana',
    name: 'Premium Raw Makhana',
    subtitle: '100% Raw Fox Nuts • 200g Pack',
    price: '₹399',
    badge: 'Bestseller',
    badgeColor: 'bg-[var(--primary)] text-white',
    image: '/products/popco-raw-makhana-200g-front.webp',
    bgColor: 'bg-[#E6F0E8]',
    url: '/product/mukeja-makhana-200g',
    isAvailable: true,
  },
  {
    id: 'edamame',
    name: 'Roasted and Salted Edamame Beans',
    subtitle: 'Plant Protein & Fibre • 150g Pack',
    price: '₹299',
    badge: '46% Protein',
    badgeColor: 'bg-[var(--secondary-foreground)] text-white',
    image: '/products/popco-roasted-edamame-150g-front.jpg',
    bgColor: 'bg-[#E2F0D9]',
    url: '/product/popco-roasted-salted-edamame-beans-150g',
    isAvailable: true,
  },
  {
    id: 'tea',
    name: 'Tea',
    subtitle: 'Authentic Masala Chai Blend',
    price: null,
    badge: 'Coming Soon',
    badgeColor: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white',
    image: null,
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
    url: null,
    isAvailable: false,
  },
];

export const Navbar = () => {
    const { 
      cartCount, 
      setIsCartOpen, 
      currentUser, 
      setIsAuthModalOpen, 
      setAuthModalMode, 
      searchQuery, 
      setSearchQuery, 
      setIsBulkOrderOpen 
    } = useStore();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileProductsOpen, setMobileProductsOpen] = useState(true);
    const [desktopProductsOpen, setDesktopProductsOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const hoverTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleDropdownEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setDesktopProductsOpen(true);
    };

    const handleDropdownLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setDesktopProductsOpen(false);
        }, 180);
    };

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    // Close menus on route change
    useEffect(() => {
        setDesktopProductsOpen(false);
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleProductsClick = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        setDesktopProductsOpen(false);
        setMobileMenuOpen(false);

        if (location.pathname === '/') {
            const shopEl = document.getElementById('shop');
            if (shopEl) {
                shopEl.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/#shop');
        }
    };

    const handleAboutClick = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        navigate('/about');
        setMobileMenuOpen(false);
    };

    const handleAccountClick = () => {
        if (currentUser) {
            navigate('/profile');
        } else {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
        }
        setMobileMenuOpen(false);
    };

    return (
      <header className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)]/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 text-[var(--foreground)] hover:bg-[var(--primary)]/5 rounded-lg transition-colors cursor-pointer" 
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/popco-logo.webp" 
                alt="PopCo" 
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="hidden sm:block text-left">
                <span className="block text-xl font-extrabold tracking-wider text-[var(--foreground)] leading-none">
                  POPCO
                </span>
                <span className="block text-[10px] tracking-widest text-[var(--secondary-foreground)] font-semibold mt-0.5">
                  INDIA
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-sans text-xs lg:text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/80">
            {/* Products Dropdown (Hover Trigger) */}
            <div 
              className="relative"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <button
                type="button"
                onClick={handleProductsClick}
                className="hover:text-[var(--foreground)] transition-colors py-2 relative group cursor-pointer flex items-center gap-1.5 font-bold uppercase tracking-widest text-xs lg:text-sm"
              >
                <span>Products</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-200 ${desktopProductsOpen ? 'rotate-180 text-[var(--primary)]' : ''}`}
                />
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
              </button>

              {/* Desktop Hover Mega-Dropdown */}
              {desktopProductsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[720px] z-50">
                  <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[var(--border)]/20 shadow-2xl p-5 space-y-4">
                    {/* Dropdown Header */}
                    <div className="flex items-center justify-between border-b border-[var(--border)]/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
                        <span className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                          POP CO Products
                        </span>
                      </div>
                      <a
                        href="/#shop"
                        onClick={handleProductsClick}
                        className="text-[11px] font-bold text-[var(--secondary-foreground)] hover:text-[var(--primary)] flex items-center gap-1 tracking-wider uppercase transition-colors"
                      >
                        <span>View All In Shop</span>
                        <ArrowRight size={12} />
                      </a>
                    </div>

                    {/* 3 Product Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      {PRODUCTS_DATA.map((item) => {
                        if (item.isAvailable) {
                          return (
                            <Link
                              key={item.id}
                              to={item.url}
                              onClick={() => setDesktopProductsOpen(false)}
                              className="group flex flex-col justify-between bg-[var(--background)]/60 hover:bg-white rounded-2xl p-3 border border-[var(--border)]/15 hover:border-[var(--primary)]/40 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
                            >
                              <div>
                                <div className={`relative w-full h-32 rounded-xl ${item.bgColor} overflow-hidden flex items-center justify-center mb-2.5 shadow-inner`}>
                                  <span className={`absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs ${item.badgeColor}`}>
                                    {item.badge}
                                  </span>
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                                  />
                                </div>
                                <h4 className="text-xs font-black uppercase text-[var(--foreground)] leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                                  {item.name}
                                </h4>
                                <p className="text-[10px] text-[var(--foreground)]/60 font-sans mt-0.5">
                                  {item.subtitle}
                                </p>
                              </div>
                              <div className="mt-2.5 pt-2 border-t border-[var(--border)]/10 flex items-center justify-between">
                                <span className="text-xs font-black text-[var(--foreground)]">
                                  {item.price}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                  <span>View</span>
                                  <ChevronRight size={12} />
                                </span>
                              </div>
                            </Link>
                          );
                        }

                        // Product 3: Tea (Coming Soon, Not clickable)
                        return (
                          <div
                            key={item.id}
                            className="flex flex-col justify-between bg-gradient-to-b from-[#FFFDF9] to-[#FEF3C7]/40 rounded-2xl p-3 border-2 border-dashed border-amber-300/80 cursor-not-allowed select-none relative overflow-hidden shadow-xs text-left"
                          >
                            <div>
                              {/* Coming Soon Banner */}
                              <div className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-[9px] font-black uppercase tracking-widest py-1 text-center rounded-lg shadow-xs mb-2">
                                COMING SOON
                              </div>

                              {/* Tea Visual */}
                              <div className={`relative w-full h-24 rounded-xl ${item.bgColor} flex flex-col items-center justify-center mb-2.5 border border-amber-200/60 shadow-inner`}>
                                <div className="w-10 h-10 rounded-full bg-amber-200/70 text-amber-900 flex items-center justify-center shadow-xs">
                                  <Coffee size={20} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-900/80 mt-1">
                                  Artisan Chai
                                </span>
                              </div>

                              <h4 className="text-xs font-black uppercase text-amber-950 leading-tight">
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-amber-900/70 font-sans mt-0.5">
                                {item.subtitle}
                              </p>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-amber-200/50 flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                In Crafting
                              </span>
                              <span className="text-[10px] font-bold text-amber-800/60">
                                Coming Soon
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={() => setIsBulkOrderOpen(true)} 
              className="hover:text-[var(--foreground)] transition-colors py-1 relative group cursor-pointer flex items-center gap-1.5 font-bold uppercase tracking-widest text-xs lg:text-sm"
            >
              <Sparkles size={14} className="text-[var(--secondary-foreground)]"/>
              <span>Bulk Order</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
            </button>

            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--foreground)] transition-colors py-1 relative group cursor-pointer">
              About POP CO
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
            </Link>

            <a 
              href="https://wa.me/918080808447?text=Hello%20PopCo%2C%20I%20am%20interested%20in%20partnering%20with%20you" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2 rounded-full bg-[var(--primary)] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--primary)]/90 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-[var(--secondary-foreground)]"/>
              Partner With Us
            </a>
          </nav>

          {/* Right: Search, Cart & Account Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Bar Toggle */}
            <div className="relative">
              {showSearch ? (
                <div className="flex items-center bg-white border border-[var(--border)]/20 rounded-full px-3 py-1.5 shadow-sm">
                  <Search size={16} className="text-[var(--foreground)]/60 mr-2"/>
                  <input 
                    type="text" 
                    placeholder="Search makhana..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="bg-transparent text-xs text-[var(--foreground)] outline-none w-32 sm:w-48 placeholder:text-[var(--foreground)]/40 uppercase" 
                    autoFocus
                  />
                  <button 
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }} 
                    className="text-xs text-[var(--foreground)]/50 hover:text-[var(--foreground)] ml-1"
                  >
                    <X size={14}/>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowSearch(true)} 
                  className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--primary)]/10 transition-colors" 
                  title="Search products"
                >
                  <Search size={19}/>
                </button>
              )}
            </div>

            {/* User Account / Profile */}
            <button 
              onClick={handleAccountClick} 
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[var(--primary)]/10 transition-colors text-[var(--foreground)] cursor-pointer" 
              title={currentUser ? `Logged in as ${currentUser.name}` : 'Login / Register'}
            >
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {currentUser ? currentUser.name.charAt(0) : <UserIcon size={16}/>}
              </div>
              {currentUser && (
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-[var(--foreground)]/60 font-semibold uppercase">
                    {currentUser.role === 'super_admin' ? 'Admin' : 'Account'}
                  </span>
                </div>
              )}
            </button>

            {/* Cart Drawer Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative w-11 h-11 flex items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-all shadow-md shadow-[var(--primary)]/20 active:scale-95 cursor-pointer group" 
              title="Shopping Cart"
            >
              <ShoppingBag size={20} className="transition-transform group-hover:scale-110"/>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--secondary-foreground)] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[var(--background)] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[var(--background)] border-b border-[var(--border)]/15 px-5 py-5 shadow-xl space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="flex flex-col space-y-3 font-sans text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
              {/* Mobile Products Accordion */}
              <div className="border-b border-[var(--border)]/10 pb-3">
                <button
                  type="button"
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className="w-full py-2 hover:text-[var(--secondary-foreground)] flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span>Products</span>
                    <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full font-bold">
                      3 Items
                    </span>
                  </span>
                  <ChevronDown 
                    size={18} 
                    className={`transition-transform duration-200 ${mobileProductsOpen ? 'rotate-180 text-[var(--primary)]' : ''}`}
                  />
                </button>

                {mobileProductsOpen && (
                  <div className="mt-2 space-y-2.5">
                    {PRODUCTS_DATA.map((item) => {
                      if (item.isAvailable) {
                        return (
                          <Link
                            key={item.id}
                            to={item.url}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-[var(--border)]/20 hover:border-[var(--primary)]/40 hover:shadow-sm transition-all group text-left"
                          >
                            <div className={`w-14 h-14 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0 overflow-hidden shadow-inner`}>
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-xs font-black uppercase text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-[var(--foreground)]/60 font-medium">
                                {item.subtitle} • <span className="font-bold text-[var(--foreground)]">{item.price}</span>
                              </p>
                            </div>
                            <ChevronRight size={16} className="text-[var(--foreground)]/40 group-hover:text-[var(--primary)] shrink-0" />
                          </Link>
                        );
                      }

                      // Coming Soon Tea in Mobile
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-dashed border-amber-300/80 cursor-not-allowed select-none text-left"
                        >
                          <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-900 shadow-inner">
                            <Coffee size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-600 to-orange-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                                Coming Soon
                              </span>
                            </div>
                            <p className="text-xs font-black uppercase text-amber-950 truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-amber-900/70 font-medium">
                              {item.subtitle}
                            </p>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-1 rounded-md shrink-0">
                            Soon
                          </span>
                        </div>
                      );
                    })}

                    <div className="pt-1">
                      <a
                        href="/#shop"
                        onClick={handleProductsClick}
                        className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1.5 py-1"
                      >
                        <span>View full catalog in Shop section</span>
                        <ArrowRight size={13} />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="button"
                onClick={() => { setIsBulkOrderOpen(true); setMobileMenuOpen(false); }} 
                className="py-2 text-left border-b border-[var(--border)]/10 hover:text-[var(--secondary-foreground)] flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[var(--secondary-foreground)]"/>
                  <span>Bulk Order (Custom Combo)</span>
                </span>
                <span className="text-[10px] bg-[var(--primary)] text-white px-2 py-0.5 rounded-full font-black">
                  10 For ₹1,799
                </span>
              </button>

              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[var(--border)]/10 hover:text-[var(--secondary-foreground)]">
                About POP CO
              </Link>

              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[var(--border)]/10 flex items-center justify-between">
                <span>Cart ({cartCount})</span>
                <span className="text-[var(--secondary-foreground)] font-black">View</span>
              </Link>

              {currentUser ? (
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[var(--border)]/10 flex items-center justify-between">
                  <span>My Profile ({currentUser.name})</span>
                  <span className="text-[var(--secondary-foreground)] text-xs font-semibold uppercase">{currentUser.role === 'super_admin' ? 'Admin' : 'Account'}</span>
                </Link>
              ) : (
                <button onClick={handleAccountClick} className="py-2 text-left border-b border-[var(--border)]/10 text-[var(--foreground)] flex items-center justify-between">
                  <span>Login / Register</span>
                  <span className="text-xs text-[var(--secondary-foreground)]">Sign In</span>
                </button>
              )}

              {currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin') && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[var(--secondary-foreground)] font-bold flex items-center gap-2">
                  <span>Admin Management Portal</span>
                </Link>
              )}
            </div>

            <a 
              href="https://wa.me/918080808447?text=Hello%20PopCo%2C%20I%20am%20interested%20in%20partnering%20with%20you" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-widest shadow-md"
            >
              <FaWhatsapp size={15} />
              <span>Partner With Us (WhatsApp)</span>
            </a>
          </div>
        )}
      </header>
    );
};
