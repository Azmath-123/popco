// Form Validation Utilities for Email, Phone, Names, Pincodes, etc.

/**
 * Validates an email address against standard RFC 5322 regex.
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(clean) && clean.length <= 254;
}

/**
 * Validates a phone number based on dial code.
 * For +91 (India), checks 10 digits starting with 6, 7, 8, or 9.
 * For other countries, checks valid E.164 length (7 to 15 digits).
 */
export function validatePhone(phone, dialCode = '+91') {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  const cleanDial = (dialCode || '+91').trim();

  if (cleanDial === '+91') {
    return /^[6-9]\d{9}$/.test(digits);
  }
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Formats a clean full phone string including country dial code.
 * e.g. "+91 9876543210"
 */
export function formatFullPhone(phone, dialCode = '+91') {
  const digits = (phone || '').replace(/\D/g, '');
  const code = (dialCode || '+91').trim();
  return digits ? `${code} ${digits}` : '';
}

/**
 * Validates PIN code / Postal code.
 * For India (+91), must be exactly 6 digits.
 */
export function validatePincode(pincode, dialCode = '+91') {
  if (!pincode || typeof pincode !== 'string') return false;
  const clean = pincode.trim();
  const cleanDial = (dialCode || '+91').trim();

  if (cleanDial === '+91') {
    return /^\d{6}$/.test(clean);
  }
  return clean.length >= 3 && clean.length <= 12;
}

/**
 * Validates a customer / contact person name.
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 2 && name.trim().length <= 160;
}
