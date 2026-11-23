// Free Country Dial Codes helper with countriesnow.space API and instant offline fallback

export const DEFAULT_COUNTRIES = [
  { name: 'India', code: 'IN', dial_code: '+91' },
  { name: 'United States', code: 'US', dial_code: '+1' },
  { name: 'United Arab Emirates', code: 'AE', dial_code: '+971' },
  { name: 'United Kingdom', code: 'GB', dial_code: '+44' },
  { name: 'Saudi Arabia', code: 'SA', dial_code: '+966' },
  { name: 'Canada', code: 'CA', dial_code: '+1' },
  { name: 'Australia', code: 'AU', dial_code: '+61' },
  { name: 'Singapore', code: 'SG', dial_code: '+65' },
  { name: 'Qatar', code: 'QA', dial_code: '+974' },
  { name: 'Kuwait', code: 'KW', dial_code: '+965' },
  { name: 'Oman', code: 'OM', dial_code: '+968' },
  { name: 'Bahrain', code: 'BH', dial_code: '+973' },
  { name: 'Germany', code: 'DE', dial_code: '+49' },
  { name: 'France', code: 'FR', dial_code: '+33' },
  { name: 'Malaysia', code: 'MY', dial_code: '+60' },
  { name: 'New Zealand', code: 'NZ', dial_code: '+64' },
  { name: 'South Africa', code: 'ZA', dial_code: '+27' },
  { name: 'Nepal', code: 'NP', dial_code: '+977' },
  { name: 'Bangladesh', code: 'BD', dial_code: '+880' },
  { name: 'Sri Lanka', code: 'LK', dial_code: '+94' },
];

export function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}

let cachedCountries = null;
let fetchPromise = null;

export async function fetchCountryCodes() {
  if (cachedCountries && cachedCountries.length > 0) return cachedCountries;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/codes', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        const formatted = json.data
          .filter((c) => c && c.code && c.dial_code)
          .map((c) => ({
            name: c.name,
            code: c.code.toUpperCase(),
            dial_code: c.dial_code.startsWith('+') ? c.dial_code.trim() : `+${c.dial_code.trim()}`,
          }));

        // Put India at the top by default, then sort others alphabetically
        const india = formatted.find((c) => c.code === 'IN') || { name: 'India', code: 'IN', dial_code: '+91' };
        const others = formatted.filter((c) => c.code !== 'IN').sort((a, b) => a.name.localeCompare(b.name));
        cachedCountries = [india, ...others];
        return cachedCountries;
      }
    } catch (err) {
      console.warn('Could not fetch dynamic country codes API, using built-in country list:', err.message);
    }

    cachedCountries = DEFAULT_COUNTRIES;
    return cachedCountries;
  })();

  return fetchPromise;
}
