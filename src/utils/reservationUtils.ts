// src/utils/reservationUtils.ts
import {
  SERVICE_COLORS,
  SERVICE_GRADIENTS,
  STATUS_COLORS,
  STATUS_TEXT
} from '@/constants/reservation';
import type { ReservationStatus } from '@/types/reservation';

/**
 * Gets the initials from a full name
 * @param name - Full name
 * @returns Initials
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

/**
 * Gets the color for a service
 * @param service - Service name
 * @returns CSS color value
 */
export function getServiceColor(service: string): string {
  return SERVICE_COLORS[service] || '#6366F1'; // Default to indigo if not found
}

/**
 * Gets the gradient for a service
 * @param service - Service name
 * @returns CSS gradient value
 */
export function getServiceGradient(service: string): string {
  return SERVICE_GRADIENTS[service] || 'linear-gradient(135deg, #6366F1, #4F46E5)'; // Default gradient
}

/**
 * Gets the color for a reservation status
 * @param status - Reservation status
 * @returns CSS color value
 */
export function getStatusColor(status: ReservationStatus): string {
  return STATUS_COLORS[status];
}

/**
 * Gets the translated text for a reservation status
 * @param status - Reservation status
 * @returns Translated status text
 */
export function getStatusText(status: ReservationStatus): string {
  return STATUS_TEXT[status];
}

/**
 * Gets the color for a wait time
 * @param timeAgo - Time ago string
 * @returns CSS color value
 */
export function getWaitTimeColor(timeAgo: string): string {
  if (timeAgo.includes('minuto')) {
    return '#10B981'; // Green
  } else if (timeAgo.includes('hora')) {
    return '#F59E0B'; // Amber
  } else {
    return '#EF4444'; // Red
  }
}

/**
 * Gets the class for a wait time
 * @param timeAgo - Time ago string
 * @returns CSS class name
 */
export function getWaitTimeClass(timeAgo: string): string {
  if (timeAgo.includes('minuto')) {
    return 'wait-recent';
  } else if (timeAgo.includes('hora')) {
    return 'wait-medium';
  } else {
    return 'wait-long';
  }
}

/**
 * Formats a date string
 * @param date - Date object or string
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    // If the date is already a formatted string, return it
    if (date.includes('/')) {
      return date;
    }
    // Otherwise try to parse it
    date = new Date(date);
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return date.toLocaleDateString('es-ES', options);
}

/**
 * Formats a time string
 * @param time - Time string
 * @returns Formatted time string
 */
export function formatTime(time: string): string {
  // Simple pass-through for now; can be expanded later
  return time;
}

/**
 * Formats a phone number
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  // Simple pass-through for now; can be expanded later
  return phone;
}
