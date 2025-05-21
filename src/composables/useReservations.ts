// src/composables/useReservations.ts
import { ref, computed } from 'vue';
import type { Reservation, FilterOptions } from '@/types/Reservation';

// Datos simulados iniciales para demostración
const MOCK_RESERVATIONS: Reservation[] = [
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
    isPriority: true
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
    isPriority: false
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
    isPriority: true
  }
];

export function useReservations() {
  // Estado de las reservaciones
  const pendingReservations = ref<Reservation[]>([...MOCK_RESERVATIONS]);

  // Estado de filtros
  const filters = ref<FilterOptions>({
    service: 'Todos',
    status: 'Pendiente',
    sortBy: 'Más reciente'
  });

  // Computed properties
  const pendingCount = computed(() => pendingReservations.value.length);

  const activeFilters = computed(() => {
    let count = 0;
    if (filters.value.service !== 'Todos') count++;
    if (filters.value.status !== 'Todos') count++;
    if (filters.value.sortBy !== 'Más reciente') count++;
    return count;
  });

  // Métodos para manipular reservaciones

  // En una aplicación real, estos métodos harían llamadas a API
  const approveReservation = async (id: number): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        pendingReservations.value = pendingReservations.value.filter(res => res.id !== id);
        resolve();
      }, 1000);
    });
  };

  const rejectReservation = async (id: number): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        pendingReservations.value = pendingReservations.value.filter(res => res.id !== id);
        resolve();
      }, 1000);
    });
  };

  const approveAllReservations = async (): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        pendingReservations.value = [];
        resolve();
      }, 1500);
    });
  };

  const refreshReservations = async (): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        // Solo recargar si no hay reservaciones (para demo)
        if (pendingReservations.value.length === 0) {
          pendingReservations.value = [...MOCK_RESERVATIONS];
        }
        resolve();
      }, 1000);
    });
  };

  const applyFilters = () => {
    // En una aplicación real, esto podría hacer una llamada a API
    // con los filtros seleccionados
    console.log('Filtros aplicados:', filters.value);
  };

  const resetFilters = () => {
    filters.value = {
      service: 'Todos',
      status: 'Pendiente',
      sortBy: 'Más reciente'
    };
  };

  return {
    pendingReservations,
    pendingCount,
    filters,
    activeFilters,
    approveReservation,
    rejectReservation,
    approveAllReservations,
    refreshReservations,
    applyFilters,
    resetFilters
  };
}

// Utilidades para reservaciones
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}
