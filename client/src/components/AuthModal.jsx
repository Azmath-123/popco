import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Mail, User, AlertCircle } from 'lucide-react';
import { PhoneInput } from './PhoneInput';
import { validateEmail, validatePhone, validateName, formatFullPhone } from '../lib/validation';

export const AuthModal = () => {
    const { isAuthModalOpen, setIsAuthModalOpen, authModalMode, setAuthModalMode, login, signup } = useStore();
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [email, setEmail] = useState('');
    const [formError, setFormError] = useState('');

    if (!isAuthModalOpen)
        return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        if (authModalMode === 'login') {
            const clean = emailOrPhone.trim();
            if (!clean) {
                setFormError('Please enter your email address or mobile number.');
                return;
            }
            if (clean.includes('@') && !validateEmail(clean)) {
                setFormError('Please enter a valid email address (e.g. name@example.com).');
                return;
            }
            if (!password || password.length < 6) {
                setFormError('Please enter your password.');
                return;
            }
            login(clean, password);
        }
        else {
            if (!validateName(name)) {
                setFormError('Please enter your full name (at least 2 characters).');
                return;
            }
            if (!validatePhone(phone, countryCode)) {
                setFormError(countryCode === '+91'
                    ? 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.'
                    : 'Please enter a valid mobile number (7 to 15 digits).');
                return;
            }
            if (!validateEmail(email)) {
                setFormError('Please enter a valid email address (e.g. name@example.com).');
                return;
            }
            if (!password || password.length < 10) {
                setFormError('Password must be at least 10 characters long.');
                return;
            }
            const fullPhone = formatFullPhone(phone, countryCode);
            signup(name.trim(), email.trim().toLowerCase(), fullPhone, password);
        }
    };
    return (<div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain"
      onClick={(e) => { if (e.target === e.currentTarget) setIsAuthModalOpen(false); }}
    >
      <div className="bg-[var(--background)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--border)]/20 overflow-hidden relative">
        {/* Background artwork or header */}
        <div className="bg-[var(--primary)] text-white p-6 relative">
          <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
            <X size={20}/>
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] tracking-widest text-white font-extrabold uppercase bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full shadow-xs">
              POPCO ACCOUNT
            </span>
          </div>
          <h3 className="text-xl font-black uppercase tracking-wide">
            {authModalMode === 'login' ? 'Welcome Back!' : 'Join PopCo Makhana'}
          </h3>
          <p className="text-xs text-white/80 font-sans mt-1">
            Enjoy premium superfoods delivered directly to your doorstep.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[var(--border)]/15 bg-white text-xs font-bold uppercase tracking-wider">
          <button onClick={() => { setAuthModalMode('login'); setFormError(''); }} className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${authModalMode === 'login'
            ? 'border-[var(--border)] text-[var(--foreground)] bg-[var(--primary)]/5 font-black'
            : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]'}`}>
            Sign In
          </button>
          <button onClick={() => { setAuthModalMode('signup'); setFormError(''); }} className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${authModalMode === 'signup'
            ? 'border-[var(--border)] text-[var(--foreground)] bg-[var(--primary)]/5 font-black'
            : 'border-transparent text-[var(--foreground)]/50 hover:text-[var(--foreground)]'}`}>
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {authModalMode === 'login' ? (<div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <input type="text" required value={emailOrPhone} onChange={(e) => { setEmailOrPhone(e.target.value); setFormError(''); }} placeholder="you@example.com or mobile" className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  <Mail size={15} className="absolute left-3 top-3 text-[var(--foreground)]/40"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">Password</label>
                <input type="password" required minLength={6} value={password} onChange={(e) => { setPassword(e.target.value); setFormError(''); }} autoComplete="current-password" className="w-full px-3 py-2.5 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
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
                  <input type="text" required value={name} onChange={(e) => { setName(e.target.value); setFormError(''); }} placeholder="e.g. Binali Hussain" className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  <User size={15} className="absolute left-3 top-2.5 text-[var(--foreground)]/40"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Mobile Number (for OTP & tracking) *
                </label>
                <PhoneInput
                  phone={phone}
                  onChange={(val) => { setPhone(val); setFormError(''); }}
                  countryCode={countryCode}
                  onCountryCodeChange={(code) => { setCountryCode(code); setFormError(''); }}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setFormError(''); }} placeholder="you@example.com" autoComplete="email" className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
                  <Mail size={15} className="absolute left-3 top-2.5 text-[var(--foreground)]/40"/>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">Password * (at least 10 characters)</label>
                <input type="password" required minLength={10} value={password} onChange={(e) => { setPassword(e.target.value); setFormError(''); }} autoComplete="new-password" className="w-full px-3 py-2 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold"/>
              </div>

              <button type="submit" className="w-full py-3.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all active:scale-98 cursor-pointer">
                Create Account
              </button>
            </div>)}

        </form>
      </div>
    </div>);
};
