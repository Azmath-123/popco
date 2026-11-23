import React, { useState, useEffect } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { fetchCountryCodes, getFlagEmoji, DEFAULT_COUNTRIES } from '../lib/countryCodes';

export const PhoneInput = ({
  phone = '',
  onChange,
  countryCode = '+91',
  onCountryCodeChange,
  required = true,
  placeholder,
  className = '',
  autoFocus = false,
  error = false,
}) => {
  const [countries, setCountries] = useState(DEFAULT_COUNTRIES);

  useEffect(() => {
    let isMounted = true;
    fetchCountryCodes().then((list) => {
      if (isMounted && Array.isArray(list) && list.length > 0) {
        setCountries(list);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const defaultPlaceholder = countryCode === '+91' ? '10-digit mobile number' : 'Phone number';

  const handlePhoneInputChange = (e) => {
    const raw = e.target.value;
    // Allow only numeric digits
    const digits = raw.replace(/\D/g, '');
    // Limit to max 15 digits (E.164 standard)
    const limited = digits.slice(0, 15);
    onChange(limited);
  };

  return (
    <div className={`flex items-stretch gap-2 ${className}`}>
      {/* Country Code Dropdown */}
      <div className="relative shrink-0">
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange && onCountryCodeChange(e.target.value)}
          aria-label="Country Dial Code"
          title="Select Country Code"
          className="h-full px-2.5 py-2 pr-7 text-xs bg-white border border-[var(--border)]/20 rounded-lg focus:outline-none focus:border-[var(--border)] font-bold text-[var(--foreground)] cursor-pointer appearance-none shadow-2xs max-w-[125px] truncate"
        >
          {countries.map((c, idx) => (
            <option key={`${c.code}-${c.dial_code}-${idx}`} value={c.dial_code}>
              {getFlagEmoji(c.code)} {c.dial_code} ({c.code})
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 pointer-events-none"
        />
      </div>

      {/* Phone Number Input */}
      <div className="relative flex-1">
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          required={required}
          value={phone}
          onChange={handlePhoneInputChange}
          placeholder={placeholder || defaultPlaceholder}
          autoFocus={autoFocus}
          className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-lg focus:outline-none font-bold text-[var(--foreground)] transition-colors ${
            error
              ? 'border-red-500 focus:border-red-600 ring-1 ring-red-400/30'
              : 'border-[var(--border)]/20 focus:border-[var(--border)]'
          }`}
        />
        <Phone
          size={14}
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
            error ? 'text-red-500' : 'text-[var(--foreground)]/40'
          }`}
        />
      </div>
    </div>
  );
};
