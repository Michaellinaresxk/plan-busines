// src/utils/formatters.ts

/**
 * Format Dominican Republic cedula number
 * @param cedula - Raw cedula string
 * @returns Formatted cedula (XXX-XXXXXXX-X)
 */
export function formatCedula(cedula: string): string {
  if (!cedula) return '';

  // Remove all non-numeric characters
  const cleaned = cedula.replace(/\D/g, '');

  // Ensure we have 11 digits for Dominican cedula
  if (cleaned.length !== 11) return cedula;

  // Format as XXX-XXXXXXX-X
  return cleaned.replace(/(\d{3})(\d{7})(\d{1})/, '$1-$2-$3');
}

/**
 * Format phone number
 * @param phone - Raw phone string
 * @returns Formatted phone ((XXX) XXX-XXXX)
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle different phone number lengths
  if (cleaned.length === 10) {
    // US/Dominican format: (XXX) XXX-XXXX
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US format with country code: +1 (XXX) XXX-XXXX
    return cleaned.replace(/1(\d{3})(\d{3})(\d{4})/, '+1 ($1) $2-$3');
  } else if (cleaned.length === 10 && cleaned.startsWith('8')) {
    // Dominican format starting with 8: (8XX) XXX-XXXX
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }

  // If it doesn't match standard formats, return with basic formatting
  return phone;
}

/**
 * Get initials from a full name
 * @param name - Full name string
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '??';

  return name
    .trim()
    .split(/\s+/)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format currency for Dominican Republic
 * @param amount - Numeric amount
 * @param currency - Currency code (default: 'DOP')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'DOP'): string {
  const formatter = new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return formatter.format(amount);
}

/**
 * Format a date for Dominican Republic locale
 * @param date - Date object or string
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat('es-DO', defaultOptions).format(dateObj);
}

/**
 * Format a time
 * @param date - Date object or string
 * @param use24Hour - Use 24-hour format (default: false)
 * @returns Formatted time string
 */
export function formatTime(date: Date | string, use24Hour: boolean = false): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return new Intl.DateTimeFormat('es-DO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24Hour
  }).format(dateObj);
}

/**
 * Format email for display (truncate if too long)
 * @param email - Email string
 * @param maxLength - Maximum length before truncation
 * @returns Formatted email
 */
export function formatEmail(email: string, maxLength: number = 25): string {
  if (!email) return '';

  if (email.length <= maxLength) return email;

  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const availableLength = maxLength - domain.length - 4; // -4 for "@" and "..."

  if (availableLength <= 0) {
    return `${email.slice(0, maxLength - 3)}...`;
  }

  return `${localPart.slice(0, availableLength)}...@${domain}`;
}

/**
 * Format file size in human readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) return text;

  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function titleCase(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format a number with thousands separators
 * @param num - Number to format
 * @param locale - Locale for formatting (default: 'es-DO')
 * @returns Formatted number string
 */
export function formatNumber(num: number, locale: string = 'es-DO'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format percentage
 * @param value - Decimal value (e.g., 0.1 for 10%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Clean and validate email format
 * @param email - Email to validate
 * @returns Clean email or null if invalid
 */
export function validateAndCleanEmail(email: string): string | null {
  if (!email) return null;

  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(cleaned) ? cleaned : null;
}

/**
 * Clean and validate phone format
 * @param phone - Phone to validate
 * @returns Clean phone or null if invalid
 */
export function validateAndCleanPhone(phone: string): string | null {
  if (!phone) return null;

  const cleaned = phone.replace(/\D/g, '');

  // Dominican phone numbers should be 10 digits (including area code)
  // or 11 digits with country code
  if (cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'))) {
    return cleaned;
  }

  return null;
}
