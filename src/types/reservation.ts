// src/types/Reservation.ts
export interface Reservation {
  id: number;
  clientName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
  timeAgo: string;
  isPriority: boolean;
}

export interface FilterOptions {
  service: string;
  status: string;
  sortBy: string;
}

export const ServiceColors = {
  'Corte de cabello': 'indigo',
  Manicura: 'pink',
  Pedicura: 'teal',
  Masaje: 'purple',
  Tinte: 'blue',
  'Tratamiento facial': 'cyan'
} as const;

export const ServiceColorLighters = {
  'Corte de cabello': 'indigo-lighten-1',
  Manicura: 'pink-lighten-1',
  Pedicura: 'teal-lighten-1',
  Masaje: 'purple-lighten-1',
  Tinte: 'blue-lighten-1',
  'Tratamiento facial': 'cyan-lighten-1'
} as const;
