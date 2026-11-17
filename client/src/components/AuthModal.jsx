import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Coins, Phone, Mail, User } from 'lucide-react';
export const AuthModal = () => {
    const { isAuthModalOpen, setIsAuthModalOpen, authModalMode, setAuthModalMode, login, signup } = useStore();
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    if (!isAuthModalOpen)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (authModalMode === 'login') {
            if (!emailOrPhone.trim() || !password)
                return;
            login(emailOrPhone, password);
        }
        else {
            if (!name.trim() || !password)
                return;
            signup(name, email, phone, password);
        }
    };
    return (<div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--background)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--border)]/20 overflow-hidden relative">
        {/* Background artwork or header */}
        <div className="bg-[var(--primary)] text-white p-6 relative">
          <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
            <X size={20}/>
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] tracking-widest text-[var(--secondary-foreground)] font-extrabold uppercase bg-white/10 px-2 py-0.5 rounded">
              POPCO ACCOUNT
            </span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-wide">
            {authModalMode === 'login' ? 'Welcome Back!' : 'Join PopCo Makhana'}
          </h3>
          <p className="text-xs text-white/80 font-sans mt-1 flex items-center gap-1.5">
            <Coins size={14} className="text-[var(--secondary-foreground)]"/>
            <span>Earn 100 Free mCoins on your first order!</span>
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[var(--border)]/15 bg-white text-xs font-bold uppercase tracking-wider">
          <button onClick={() => setAuthModalMode('login')} className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${authModalMode === 'login'
            ? 'border-[var(--border)] text-[var(--foreground)] bg-[var(--primary)]/5 font-black'
            : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]'}`}>
            Sign In
          </button>
          <button onClick={() => setAuthModalMode('signup')} className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${authModalMode === 'signup'
            ? 'border-[var(--border)] text-[var(--foreground)] bg-[var(--primary)]/5 font-black'
            : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]'}`}>
            Register (+100 mCoins)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {authModalMode === 'login' ? (<div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input type="email" required value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} placeholder="you@example.com" className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  <Mail size={15} className="absolute left-3 top-3 text-[var(--foreground)]/40"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">Password</label>
                <input type="password" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="w-full px-3 py-2.5 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
              </div>

              <button type="submit" className="w-full py-3.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-98 cursor-pointer">
                Sign In to Account
              </button>
            </div>) : (<div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Binali Hussain" className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  <User size={15} className="absolute left-3 top-2.5 text-[var(--foreground)]/40"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Mobile Number (for OTP & tracking) *
                </label>
                <div className="relative">
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  <Phone size={15} className="absolute left-3 top-2.5 text-[var(--foreground)]/40"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  <Mail size={15} className="absolute left-3 top-2.5 text-[var(--foreground)]/40"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">Password * (at least 10 characters)</label>
                <input type="password" required minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
              </div>

              <button type="submit" className="w-full py-3.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-98 cursor-pointer">
                Create Account (+100 mCoins)
              </button>
            </div>)}

        </form>
      </div>
    </div>);
};
