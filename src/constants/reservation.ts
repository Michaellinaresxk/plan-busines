// src/constants/reservation.ts
import type { ReservationStatus, Activity, Reservation, CalendarEvent } from '@/types/reservation';

/**
 * Reservation status colors mapping
 */
export const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: '#FF9800',
  approved: '#2196F3',
  completed: '#4CAF50',
  cancelled: '#F44336'
};

/**
 * Reservation status text mapping
 */
export const STATUS_TEXT: Record<ReservationStatus, string> = {
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
 * Mock reservation data (will be replaced with API data in production)
 */
export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 1,
    clientName: 'Juan Pérez',
    email: 'juan.perez@gmail.com',
    phone: '+34 612 345 678',
    service: 'Corte de cabello',
    date: '24/05/2025',
    time: '10:30 AM',
    notes: 'Preferiblemente con Carlos, el estilista de siempre.',
    timeAgo: '2 horas',
    isPriority: true,
    status: 'pending'
  },
  {
    id: 2,
    clientName: 'María López',
    email: 'maria.lopez@hotmail.com',
    phone: '+34 623 456 789',
    service: 'Manicura',
    date: '25/05/2025',
    time: '16:00 PM',
    notes: '',
    timeAgo: '5 horas',
    isPriority: false,
    status: 'pending'
  },
  {
    id: 3,
    clientName: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@outlook.com',
    phone: '+34 634 567 890',
    service: 'Masaje',
    date: '26/05/2025',
    time: '12:15 PM',
    notes: 'Masaje terapéutico para aliviar dolor de espalda.',
    timeAgo: '1 día',
    isPriority: true,
    status: 'pending'
  },
  {
    id: 4,
    clientName: 'Ana Martínez',
    email: 'ana.martinez@gmail.com',
    phone: '+34 645 678 901',
    service: 'Pedicura',
    date: '27/05/2025',
    time: '11:00 AM',
    notes: '',
    timeAgo: '1 día',
    isPriority: false,
    status: 'pending'
  },
  {
    id: 5,
    clientName: 'Roberto Sánchez',
    email: 'roberto.sanchez@yahoo.com',
    phone: '+34 656 789 012',
    service: 'Corte de cabello',
    date: '28/05/2025',
    time: '18:30 PM',
    notes: 'Primera vez. Corte moderno.',
    timeAgo: '2 días',
    isPriority: false,
    status: 'pending'
  },
  {
    id: 6,
    clientName: 'Elena Gómez',
    email: 'elena.gomez@gmail.com',
    phone: '+34 667 890 123',
    service: 'Tratamiento facial',
    date: '29/05/2025',
    time: '15:45 PM',
    notes: 'Alergia a productos con fragancia.',
    timeAgo: '3 días',
    isPriority: false,
    status: 'pending'
  },
  {
    id: 7,
    clientName: 'Javier Ortiz',
    email: 'javier.ortiz@outlook.com',
    phone: '+34 678 901 234',
    service: 'Masaje',
    date: '30/05/2025',
    time: '13:00 PM',
    notes: '',
    timeAgo: '4 días',
    isPriority: false,
    status: 'pending'
  },
  {
    id: 8,
    clientName: 'Sofía Torres',
    email: 'sofia.torres@hotmail.com',
    phone: '+34 689 012 345',
    service: 'Manicura',
    date: '31/05/2025',
    time: '17:30 PM',
    notes: 'Diseño de flores en las uñas.',
    timeAgo: '4 días',
    isPriority: true,
    status: 'pending'
  }
];

/**
 * Mock calendar events data (will be replaced with API data in production)
 */
export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    clientName: 'Juan Pérez',
    service: 'Corte de cabello',
    time: '10:30',
    status: 'pending'
  },
  {
    id: 2,
    clientName: 'María López',
    service: 'Manicura',
    time: '16:00',
    status: 'approved'
  },
  {
    id: 3,
    clientName: 'Carlos Rodríguez',
    service: 'Masaje',
    time: '12:15',
    status: 'approved'
  },
  {
    id: 4,
    clientName: 'Ana Martínez',
    service: 'Pedicura',
    time: '11:00',
    status: 'pending'
  },
  {
    id: 5,
    clientName: 'Roberto Sánchez',
    service: 'Corte de cabello',
    time: '18:30',
    status: 'approved'
  },
  {
    id: 6,
    clientName: 'Lucía Gómez',
    service: 'Masaje',
    time: '14:45',
    status: 'completed'
  },
  {
    id: 7,
    clientName: 'Miguel Fernández',
    service: 'Corte de cabello',
    time: '09:15',
    status: 'cancelled'
  }
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
