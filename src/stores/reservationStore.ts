// src/stores/reservationStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Reservation, ReservationDetail, ReservationFilters } from '@/types/reservation';
import { MOCK_RESERVATIONS } from '@/constants/reservation';

export const useReservationStore = defineStore('reservation', () => {
  // State
  const reservations = ref<Reservation[]>([...MOCK_RESERVATIONS]);
  const selectedReservation = ref<ReservationDetail | null>(null);
  const isLoading = ref<boolean>(false);
  const filters = ref<ReservationFilters>({
    service: '',
    status: 'Pendiente',
    sortBy: 'Más reciente'
  });

  // Getters
  const pendingReservations = computed(() =>
    reservations.value.filter(r => r.status === 'pending')
  );

  const approvedReservations = computed(() =>
    reservations.value.filter((r: { status: string; }) => r.status === 'approved')
  );

  const completedReservations = computed(() =>
    reservations.value.filter((r: { status: string; }) => r.status === 'completed')
  );

  const rejectedReservations = computed(() =>
    reservations.value.filter((r: { status: string; }) => r.status === 'cancelled')
  );

  const pendingCount = computed(() => pendingReservations.value.length);

  const filteredReservations = computed(() => {
    let result = [...reservations.value];

    // Apply service filter
    if (filters.value.service && filters.value.service !== 'Todos') {
      result = result.filter(r => r.service === filters.value.service);
    }

    // Apply status filter
    if (filters.value.status && filters.value.status !== 'Todos') {
      const statusMap: Record<string, string> = {
        Pendiente: 'pending',
        Aprobada: 'approved',
        Completada: 'completed',
        Rechazada: 'cancelled'
      };

      const statusValue = statusMap[filters.value.status];
      if (statusValue) {
        result = result.filter(r => r.status === statusValue);
      }
    }

    // Apply sorting
    const sortMap: Record<string, (a: Reservation, b: Reservation) => number> = {
      'Más reciente': (a, b) => a.id - b.id,
      'Más antiguo': (a, b) => b.id - a.id,
      'Próxima cita': (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
      'Nombre cliente (A-Z)': (a, b) => a.clientName.localeCompare(b.clientName),
      'Nombre cliente (Z-A)': (a, b) => b.clientName.localeCompare(a.clientName)
    };

    const sortFn = sortMap[filters.value.sortBy];
    if (sortFn) {
      result.sort(sortFn);
    }

    return result;
  });

  // Actions
  async function fetchReservations() {
    isLoading.value = true;
    try {
      // In a real app, this would be an API call
      // For now, we'll use a timeout to simulate a network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      reservations.value = [...MOCK_RESERVATIONS];
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function getReservationById(id: number) {
    isLoading.value = true;
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const reservation = reservations.value.find(r => r.id === id);

      if (reservation) {
        // In a real app, we would fetch additional details from the API
        // For now, we'll create a mock detail object
        selectedReservation.value = {
          ...reservation,
          isNewClient: Math.random() > 0.5,
          previousReservations: Math.floor(Math.random() * 10),
          averageSpending: `${Math.floor(Math.random() * 100 + 20)} €`,
          lastVisit: Math.random() > 0.3 ? '15/04/2025' : null,
          address: Math.random() > 0.5 ? 'Calle Principal 123, Madrid' : '',
          staff: Math.random() > 0.3 ? 'Carlos Rodríguez' : '',
          duration: Math.random() > 0.5 ? '1 hora' : '45 minutos',
          price: `${Math.floor(Math.random() * 50 + 15)} €`,
          createdAt: '23/05/2025, 08:32 AM'
        };
      } else {
        selectedReservation.value = null;
      }
    } catch (error) {
      console.error('Error fetching reservation details:', error);
      selectedReservation.value = null;
    } finally {
      isLoading.value = false;
    }

    return selectedReservation.value;
  }

  async function approveReservation(id: number) {
    isLoading.value = true;
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const reservation = reservations.value.find(r => r.id === id);
      if (reservation) {
        reservation.status = 'approved';
      }
    } catch (error) {
      console.error('Error approving reservation:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function rejectReservation(id: number) {
    isLoading.value = true;
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const reservation = reservations.value.find(r => r.id === id);
      if (reservation) {
        reservation.status = 'cancelled';
      }
    } catch (error) {
      console.error('Error rejecting reservation:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function setFilters(newFilters: Partial<ReservationFilters>) {
    filters.value = { ...filters.value, ...newFilters };
  }

  function resetFilters() {
    filters.value = {
      service: '',
      status: 'Pendiente',
      sortBy: 'Más reciente'
    };
  }

  return {
    // State
    reservations,
    selectedReservation,
    isLoading,
    filters,

    // Getters
    pendingReservations,
    approvedReservations,
    completedReservations,
    rejectedReservations,
    pendingCount,
    filteredReservations,

    // Actions
    fetchReservations,
    getReservationById,
    approveReservation,
    rejectReservation,
    setFilters,
    resetFilters
  };
});
