import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, User as UserIcon, Menu, X, Coins, Sparkles, Search } from 'lucide-react';
export const Navbar = () => {
    const { cartCount, setIsCartOpen, currentUser, setIsAuthModalOpen, setAuthModalMode, searchQuery, setSearchQuery, setIsBulkOrderOpen } = useStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const handleProductsClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const shopEl = document.getElementById('shop');
            if (shopEl) {
                shopEl.scrollIntoView({ behavior: 'smooth' });
            }
        }
        else {
            navigate('/#shop');
        }
        setMobileMenuOpen(false);
    };
    const handleAboutClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const aboutEl = document.getElementById('about');
            if (aboutEl) {
                aboutEl.scrollIntoView({ behavior: 'smooth' });
            }
        }
        else {
            navigate('/#about');
        }
        setMobileMenuOpen(false);
    };
    const handleAccountClick = () => {
        if (currentUser) {
            navigate('/profile');
        }
        else {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
        }
        setMobileMenuOpen(false);
    };
    return (<header className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)]/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger & Logo */}
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[var(--foreground)] hover:bg-[var(--primary)]/5 rounded-lg transition-colors cursor-pointer" aria-label="Toggle navigation">
            {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            <img src="/popco-logo.webp" alt="PopCo" className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105"/>
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
          <a href="/#shop" onClick={handleProductsClick} className="hover:text-[var(--foreground)] transition-colors py-1 relative group cursor-pointer">
            Products
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
          </a>

          <button 
            type="button"
            onClick={() => setIsBulkOrderOpen(true)} 
            className="hover:text-[var(--foreground)] transition-colors py-1 relative group cursor-pointer flex items-center gap-1.5 font-bold uppercase tracking-widest text-xs lg:text-sm"
          >
            <Sparkles size={14} className="text-[var(--secondary-foreground)]"/>
            <span>Bulk Order</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
          </button>

          <a href="/#about" onClick={handleAboutClick} className="hover:text-[var(--foreground)] transition-colors py-1 relative group cursor-pointer">
            About POP CO
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
          </a>

          <Link to="/blogs" className={`hover:text-[var(--foreground)] transition-colors py-1 relative group ${location.pathname === '/blogs' ? 'text-[var(--foreground)] font-black' : ''}`}>
            Blogs & Heritage
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all group-hover:w-full"></span>
          </Link>

          <a href="https://wa.me/918080808447?text=Hello%20PopCo%2C%20I%20am%20interested%20in%20partnering%20with%20you" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-[var(--primary)] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--primary)]/90 transition-all shadow-sm active:scale-95 flex items-center gap-1.5">
            <Sparkles size={13} className="text-[var(--secondary-foreground)]"/>
            Partner With Us
          </a>
        </nav>

        {/* Right: Search, Cart & Account Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar Toggle */}
          <div className="relative">
            {showSearch ? (<div className="flex items-center bg-white border border-[var(--border)]/20 rounded-full px-3 py-1.5 shadow-sm">
                <Search size={16} className="text-[var(--foreground)]/60 mr-2"/>
                <input type="text" placeholder="Search makhana..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-xs text-[var(--foreground)] outline-none w-32 sm:w-48 placeholder:text-[var(--foreground)]/40 uppercase" autoFocus/>
                <button onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
            }} className="text-xs text-[var(--foreground)]/50 hover:text-[var(--foreground)] ml-1">
                  <X size={14}/>
                </button>
              </div>) : (<button onClick={() => setShowSearch(true)} className="w-10 h-10 flex items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--primary)]/10 transition-colors" title="Search products">
                <Search size={19}/>
              </button>)}
          </div>

          {/* User Account / Profile */}
          <button onClick={handleAccountClick} className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[var(--primary)]/10 transition-colors text-[var(--foreground)] cursor-pointer" title={currentUser ? `Logged in as ${currentUser.name}` : 'Login / Register'}>
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
              {currentUser ? currentUser.name.charAt(0) : <UserIcon size={16}/>}
            </div>
            {currentUser && (<div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold leading-tight truncate max-w-[100px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[var(--secondary-foreground)] flex items-center gap-1 font-semibold">
                  <Coins size={10}/>
                  {currentUser.mCoins} mCoins
                </span>
              </div>)}
          </button>

          {/* Cart Drawer Trigger */}
          <button onClick={() => setIsCartOpen(true)} className="relative w-11 h-11 flex items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-all shadow-md shadow-[var(--primary)]/20 active:scale-95 cursor-pointer group" title="Shopping Cart">
            <ShoppingBag size={20} className="transition-transform group-hover:scale-110"/>
            {cartCount > 0 && (<span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--secondary-foreground)] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[var(--background)] animate-pulse">
                {cartCount}
              </span>)}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (<div className="md:hidden bg-[var(--background)] border-b border-[var(--border)]/15 px-6 py-6 shadow-xl space-y-4">
          <div className="flex flex-col space-y-3 font-sans text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
            <a href="/#shop" onClick={handleProductsClick} className="py-2 border-b border-[var(--border)]/10 hover:text-[var(--secondary-foreground)]">
              All Products
            </a>
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
            <a href="/#about" onClick={handleAboutClick} className="py-2 border-b border-[var(--border)]/10 hover:text-[var(--secondary-foreground)]">
              About POP CO
            </a>
            <Link to="/blogs" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[var(--border)]/10 hover:text-[var(--secondary-foreground)]">
              Blogs & Origin Story
            </Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[var(--border)]/10 flex items-center justify-between">
              <span>Cart ({cartCount})</span>
              <span className="text-[var(--secondary-foreground)] font-black">View</span>
            </Link>
            {currentUser ? (<Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-[var(--border)]/10 flex items-center justify-between">
                <span>My Profile ({currentUser.name})</span>
                <span className="text-[var(--secondary-foreground)] text-xs font-semibold">{currentUser.mCoins} mCoins</span>
              </Link>) : (<button onClick={handleAccountClick} className="py-2 text-left border-b border-[var(--border)]/10 text-[var(--foreground)] flex items-center justify-between">
                <span>Login / Register</span>
                <span className="text-xs text-[var(--secondary-foreground)]">+100 Welcome mCoins</span>
              </button>)}
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[var(--secondary-foreground)] font-bold flex items-center gap-2">
              <span>Admin Management Portal</span>
            </Link>
          </div>

          <a href="https://wa.me/918080808447?text=Hello%20PopCo%2C%20I%20am%20interested%20in%20partnering%20with%20you" target="_blank" rel="noopener noreferrer" className="w-full block text-center py-3 rounded-full bg-[var(--primary)] text-white text-xs font-bold uppercase tracking-widest shadow-md">
            Partner With Us (WhatsApp)
          </a>
        </div>)}
    </header>);
};
