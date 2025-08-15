// src/constants/reservation.ts
import type { Reservation } from '@/types/reservation';

/**
 * Reservation status colors mapping
 */
export const STATUS_COLORS = {
  pending: '#FF9800',
  approved: '#2196F3',
  completed: '#4CAF50',
  cancelled: '#F44336'
};

/**
 * Reservation status text mapping
 */
export const STATUS_TEXT = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  completed: 'Completada',
  cancelled: 'Cancelada'
};

/**
 * Service colors mapping for visual representation
 */
export const SERVICE_COLORS: Record<string, string> = {
  'Corte de cabello': '#6366F1', // Indigo
  Manicura: '#EC4899', // Pink
  Pedicura: '#8B5CF6', // Purple
  Masaje: '#10B981', // Emerald
  'Tratamiento facial': '#F59E0B' // Amber
};

/**
 * Service gradient mapping for visual representation
 */
export const SERVICE_GRADIENTS: Record<string, string> = {
  'Corte de cabello': 'linear-gradient(135deg, #6366F1, #4F46E5)',
  Manicura: 'linear-gradient(135deg, #EC4899, #DB2777)',
  Pedicura: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  Masaje: 'linear-gradient(135deg, #10B981, #059669)',
  'Tratamiento facial': 'linear-gradient(135deg, #F59E0B, #D97706)'
};

/**
 * Filter options for services
 */
export const SERVICE_FILTER_OPTIONS = [
  { title: 'All Services', value: '' },
  { title: 'Haircut', value: 'Corte de cabello' },
  { title: 'Manicure', value: 'Manicura' },
  { title: 'Pedicure', value: 'Pedicura' },
  { title: 'Massage', value: 'Masaje' },
  { title: 'Facial Treatment', value: 'Tratamiento facial' }
];

/**
 * Filter options for dates
 */
export const DATE_FILTER_OPTIONS = [
  { title: 'All Periods', value: '' },
  { title: 'Today', value: 'today' },
  { title: 'Tomorrow', value: 'tomorrow' },
  { title: 'This Week', value: 'thisWeek' },
  { title: 'Next Week', value: 'nextWeek' },
  { title: 'This Month', value: 'thisMonth' }
];

/**
 * Filter options for sorting
 */
export const SORT_FILTER_OPTIONS = [
  { title: 'Most Recent', value: 'dateNewest' },
  { title: 'Oldest First', value: 'dateOldest' },
  { title: 'Next Appointment', value: 'nextAppointment' },
  { title: 'Client Name (A-Z)', value: 'nameAsc' },
  { title: 'Client Name (Z-A)', value: 'nameDesc' },
  { title: 'Priority First', value: 'priority' }
];

/**
 * Table headers for the reservation table
 */
export const RESERVATION_TABLE_HEADERS = [
  {
    title: 'Client',
    key: 'clientName',
    sortable: true,
    width: '25%'
  },
  {
    title: 'Service',
    key: 'service',
    sortable: true,
    width: '15%'
  },
  {
    title: 'Date & Time',
    key: 'dateTime',
    sortable: true,
    width: '20%'
  },
  {
    title: 'Priority',
    key: 'isPriority',
    sortable: true,
    width: '10%'
  },
  {
    title: 'Wait Time',
    key: 'timeAgo',
    sortable: true,
    width: '15%'
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    width: '15%'
  }
];

/**
 * Days of the week for the calendar
 */
export const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/**
 * Months of the year for the calendar
 */
export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

/**
 * Recent activities for the dashboard
 */
export const RECENT_ACTIVITIES: Activity[] = [
  {
    title: 'Reserva aprobada',
    time: 'Hace 15 minutos',
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    title: 'Nueva reserva recibida',
    time: 'Hace 48 minutos',
    icon: 'mdi-calendar-plus',
    color: 'primary'
  },
  {
    title: 'Reserva rechazada',
    time: 'Hace 1 hora',
    icon: 'mdi-close-circle',
    color: 'error'
  },
  {
    title: 'Configuración actualizada',
    time: 'Hace 3 horas',
    icon: 'mdi-cog',
    color: 'info'
  },
  {
    title: 'Sistema iniciado',
    time: 'Hace 5 horas',
    icon: 'mdi-power',
    color: 'secondary'
  }
];
