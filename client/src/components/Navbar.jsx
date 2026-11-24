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
  ArrowRight,
  LogOut,
  ShieldCheck
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
    price: '₹260',
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
      logout,
      showToast,
      setIsAuthModalOpen, 
      setAuthModalMode, 
      searchQuery, 
      setSearchQuery, 
      setIsBulkOrderOpen 
    } = useStore();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileProductsOpen, setMobileProductsOpen] = useState(true);
    const [desktopProductsOpen, setDesktopProductsOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const hoverTimeoutRef = useRef(null);
    const profileMenuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        setProfileMenuOpen(false);
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
        if (!currentUser) {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
            setMobileMenuOpen(false);
        } else {
            setProfileMenuOpen((prev) => !prev);
        }
    };

    return (
      <header className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)]/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Mobile & Tablet Menu Trigger & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="lg:hidden p-2 text-[var(--foreground)] hover:bg-[var(--primary)]/5 rounded-lg transition-colors cursor-pointer" 
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>

            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              <img 
                src="/popco-logo.webp" 
                alt="PopCo" 
                className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
              />
              <div className="hidden sm:block text-left shrink-0">
                <span className="block text-lg sm:text-xl font-extrabold tracking-wider text-[var(--foreground)] leading-none whitespace-nowrap">
                  POPCO
                </span>
                <span className="block text-[10px] tracking-widest text-[var(--secondary-foreground)] font-semibold mt-0.5 whitespace-nowrap">
                  INDIA
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links (Visible on large screens 1024px+ so it never overlaps on tablets) */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-8 font-sans text-xs xl:text-sm font-bold uppercase tracking-widest text-[var(--foreground)]/80 shrink-0">
            {/* Home Navigation Link */}
            <Link 
              to="/" 
              className="hover:text-[var(--foreground)] transition-colors py-2 relative group cursor-pointer font-bold uppercase tracking-widest text-xs lg:text-sm"
            >
              <span>Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
            </Link>

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

              {/* Desktop Products Dropdown (Names Only - No Images) */}
              {desktopProductsOpen && (
                <div className="absolute top-full left-0 pt-2 w-80 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-white/98 backdrop-blur-md rounded-2xl border border-[var(--border)]/30 shadow-2xl p-3 space-y-1">
                    <div className="px-2.5 py-1.5 border-b border-[var(--border)]/15 flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/60">
                        PopCo Products
                      </span>
                      <a
                        href="/#shop"
                        onClick={handleProductsClick}
                        className="text-[10px] font-extrabold text-[var(--primary)] hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Shop All
                      </a>
                    </div>

                    {PRODUCTS_DATA.map((item) => {
                      if (item.isAvailable) {
                        return (
                          <Link
                            key={item.id}
                            to={item.url}
                            onClick={() => setDesktopProductsOpen(false)}
                            className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--primary)]/10 text-[var(--foreground)] hover:text-[var(--primary)] transition-all cursor-pointer"
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-extrabold uppercase tracking-wide text-xs group-hover:text-[var(--primary)] transition-colors">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-[var(--foreground)]/60 font-sans mt-0.5 normal-case">
                                {item.subtitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-3">
                              {item.price && (
                                <span className="text-[11px] font-black text-[var(--foreground)]/80 group-hover:text-[var(--primary)]">
                                  {item.price}
                                </span>
                              )}
                              <ChevronRight size={14} className="text-[var(--foreground)]/40 group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </Link>
                        );
                      }

                      // Coming soon item (Tea)
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl text-[var(--foreground)]/50 select-none bg-black/[0.02]"
                        >
                          <div className="flex flex-col text-left">
                            <span className="font-bold uppercase tracking-wide text-xs">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[var(--foreground)]/40 font-sans mt-0.5 normal-case">
                              {item.subtitle}
                            </span>
                          </div>
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ml-3">
                            Coming Soon
                          </span>
                        </div>
                      );
                    })}

                    <div className="pt-2 border-t border-[var(--border)]/15 mt-1">
                      <a
                        href="/#shop"
                        onClick={handleProductsClick}
                        className="flex items-center justify-between p-2 rounded-xl text-[11px] font-black text-[var(--secondary-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors uppercase tracking-wider cursor-pointer"
                      >
                        <span>View All In Store</span>
                        <ArrowRight size={13} />
                      </a>
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

          {/* Right: Search, Cart, Account & Logout Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
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
                    className="bg-transparent text-xs text-[var(--foreground)] outline-none w-28 sm:w-48 placeholder:text-[var(--foreground)]/40 uppercase" 
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
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--primary)]/10 transition-colors" 
                  title="Search products"
                >
                  <Search size={19}/>
                </button>
              )}
            </div>

            {/* User Account / Profile with Dropdown */}
            <div className="relative shrink-0" ref={profileMenuRef}>
              <button 
                onClick={handleAccountClick} 
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full hover:bg-[var(--primary)]/10 transition-colors text-[var(--foreground)] cursor-pointer" 
                title={
                  !currentUser 
                    ? 'Login / Register' 
                    : currentUser.role === 'admin' || currentUser.role === 'super_admin'
                      ? `Logged in as ${currentUser.name} (Admin)`
                      : `Logged in as ${currentUser.name}`
                }
                aria-label="User account"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                  {currentUser ? currentUser.name.charAt(0) : <UserIcon size={16}/>}
                </div>
                {currentUser && (
                  <div className="hidden sm:flex flex-col text-left max-w-[80px] md:max-w-[120px]">
                    <span className="text-xs font-bold leading-tight truncate text-[var(--foreground)]" title={currentUser.name}>
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-[var(--primary)] font-semibold uppercase tracking-wider leading-none mt-0.5">
                      {currentUser.role === 'admin' || currentUser.role === 'super_admin' ? 'Admin' : 'Account'}
                    </span>
                  </div>
                )}
                {currentUser && (
                  <ChevronDown size={14} className={`hidden sm:block text-[var(--foreground)]/50 transition-transform ${profileMenuOpen ? 'rotate-180 text-[var(--primary)]' : ''}`} />
                )}
              </button>

              {/* Profile Dropdown: Admin Panel or User Panel + Logout Below */}
              {currentUser && profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border)]/20 p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-[var(--border)]/15 mb-1">
                    <p className="text-xs font-black uppercase text-[var(--foreground)] truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-[var(--foreground)]/60 truncate font-sans lowercase">
                      {currentUser.email}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full">
                      {currentUser.role === 'admin' || currentUser.role === 'super_admin' ? 'Administrator' : 'Customer Account'}
                    </span>
                  </div>

                  {/* Panel navigation: Admin panel for admin, User panel for customer */}
                  {currentUser.role === 'admin' || currentUser.role === 'super_admin' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--primary)]/10 text-[var(--foreground)] hover:text-[var(--primary)] transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[var(--primary)]" />
                        <span>Admin Panel</span>
                      </div>
                      <ChevronRight size={14} className="text-[var(--primary)]/60" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--primary)]/10 text-[var(--foreground)] hover:text-[var(--primary)] transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <UserIcon size={16} className="text-[var(--primary)]" />
                        <span>User Panel</span>
                      </div>
                      <ChevronRight size={14} className="text-[var(--primary)]/60" />
                    </button>
                  )}

                  {/* Logout option below panel */}
                  <div className="pt-1.5 mt-1 border-t border-[var(--border)]/15">
                    <button
                      type="button"
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-all text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Drawer Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-all shadow-md shadow-[var(--primary)]/20 active:scale-95 cursor-pointer group shrink-0" 
              title="Shopping Cart"
            >
              <ShoppingBag size={19} className="transition-transform group-hover:scale-110"/>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--secondary-foreground)] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[var(--background)] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[var(--background)] border-b border-[var(--border)]/15 px-5 py-3 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col font-sans text-xs font-bold uppercase tracking-wider text-[var(--foreground)] divide-y divide-[var(--border)]/15">
              {/* Home link */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3.5 flex items-center justify-between text-xs font-black tracking-wider text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                <span>Home</span>
                <ChevronRight size={16} className="text-[var(--foreground)]/40" />
              </Link>

              {/* Product items (clean text only) */}
              {PRODUCTS_DATA.map((item) => {
                if (item.isAvailable) {
                  return (
                    <Link
                      key={item.id}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-3.5 flex items-center justify-between text-xs font-black tracking-wider text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                    >
                      <span>{item.name}</span>
                      <ChevronRight size={16} className="text-[var(--foreground)]/40" />
                    </Link>
                  );
                }

                // Tea coming soon
                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between text-xs font-black tracking-wider text-[var(--foreground)]/60 select-none"
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200/60">
                      Coming Soon
                    </span>
                  </div>
                );
              })}

              {/* Bulk Order in Mobile/Tablet Menu */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsBulkOrderOpen(true);
                }}
                className="py-3.5 flex items-center justify-between text-xs font-black tracking-wider text-[var(--foreground)] hover:text-[var(--primary)] transition-colors w-full text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[var(--secondary-foreground)]" />
                  <span>Bulk Order (Wholesale)</span>
                </span>
                <span className="text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full font-bold">50KG+</span>
              </button>

              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-3.5 flex items-center justify-between text-xs font-black tracking-wider text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                <span>About POP CO</span>
                <ChevronRight size={16} className="text-[var(--foreground)]/40" />
              </Link>

              <Link 
                to="/cart" 
                onClick={() => setMobileMenuOpen(false)} 
                className="py-3.5 flex items-center justify-between text-xs font-black tracking-wider text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                <span>Cart ({cartCount})</span>
                <span className="text-[var(--primary)] font-black">View</span>
              </Link>

              {currentUser ? (
                <>
                  {currentUser.role === 'admin' || currentUser.role === 'super_admin' ? (
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="py-3.5 flex items-center justify-between text-xs font-black tracking-wider text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon size={16} className="text-[var(--primary)]" />
                        <span className="truncate max-w-[180px] sm:max-w-[240px]">{currentUser.name} (Admin Panel)</span>
                      </span>
                      <span className="text-[10px] bg-[var(--primary)] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Admin</span>
                    </Link>
                  ) : (
                    <Link 
                      to="/profile" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="py-3.5 flex items-center justify-between text-xs font-black tracking-wider text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon size={16} className="text-[var(--primary)]" />
                        <span className="truncate max-w-[180px] sm:max-w-[240px]">{currentUser.name} (My Profile)</span>
                      </span>
                      <span className="text-[10px] bg-[var(--primary)] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Account</span>
                    </Link>
                  )}

                  {/* Logout Button in Mobile/Tablet Menu */}
                  <button
                    type="button"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                    }}
                    className="py-3.5 flex items-center justify-between text-xs font-black tracking-wider text-red-600 hover:text-red-700 transition-colors w-full cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut size={16} />
                      <span>Log Out ({currentUser.name})</span>
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Sign Out</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleAccountClick} 
                  className="py-3.5 text-left text-[var(--foreground)] hover:text-[var(--primary)] flex items-center justify-between w-full cursor-pointer text-xs font-black tracking-wider transition-colors"
                >
                  <span>Login / Register</span>
                  <span className="text-xs text-[var(--primary)] font-bold">Sign In</span>
                </button>
              )}
            </div>

            <div className="pt-3">
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
          </div>
        )}
      </header>
    );
};
