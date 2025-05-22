// // src/composables/useReservations.ts
// import { ref, computed, onMounted, watch } from 'vue';
// // import { firebaseAPI } from '@/infra/FirebaseConfig';
// // import { Reservation, ReservationStatus } from '@/types/reservation';

// export function useReservations() {
//   // Estado reactivo
//   // const reservations = ref<Reservation[]>([]);
//   // const selectedReservation = ref<Reservation | null>(null);
//   // const loading = ref(false);
//   // const error = ref<Error | null>(null);
//   // const statusFilter = ref<ReservationStatus | null>(ReservationStatus.PENDING);
//   const searchQuery = ref('');

//   // Propiedades computadas
//   // const pendingReservations = computed(() =>
//   //   reservations.value.filter(r => r.status === ReservationStatus.PENDING)
//   // );

//   // const approvedReservations = computed(() =>
//   //   reservations.value.filter(r => r.status === ReservationStatus.APPROVED)
//   // );

//   // const rejectedReservations = computed(() =>
//   //   reservations.value.filter(r => r.status === ReservationStatus.REJECTED)
//   // );

//   // const completedReservations = computed(() =>
//   //   reservations.value.filter(r => r.status === ReservationStatus.COMPLETED)
//   // );

//   // const cancelledReservations = computed(() =>
//   //   reservations.value.filter(r => r.status === ReservationStatus.CANCELLED)
//   // );

//   const filteredReservations = computed(() => {
//     // let result = [...reservations.value];

//     // // Filtrar por estado si hay un filtro seleccionado
//     // if (statusFilter.value) {
//     //   result = result.filter(r => r.status === statusFilter.value);
//     // }

//     // Aplicar búsqueda si hay un término
//     if (searchQuery.value.trim()) {
//       const query = searchQuery.value.toLowerCase();
//       result = result.filter(
//         r =>
//           r.clientName.toLowerCase().includes(query) ||
//           r.clientEmail.toLowerCase().includes(query) ||
//           r.serviceName.toLowerCase().includes(query) ||
//           (r.notes && r.notes.toLowerCase().includes(query))
//       );
//     }

//     return result;
//   });

//   // Contador de reservaciones pendientes
//   const pendingCount = computed(() => pendingReservations.value.length);

//   // Método para cargar todas las reservaciones
//   const fetchAllReservations = async () => {
//     loading.value = true;
//     error.value = null;

//     try {
//       reservations.value = await firebaseAPI.getAllReservations();
//     } catch (err) {
//       error.value = err as Error;
//       console.error('Error al cargar reservaciones:', err);
//     } finally {
//       loading.value = false;
//     }
//   };

//   // Método para cargar reservaciones por estado
//   const fetchReservationsByStatus = async (status: ReservationStatus) => {
//     loading.value = true;
//     error.value = null;

//     try {
//       reservations.value = await firebaseAPI.getReservationsByStatus(status);
//     } catch (err) {
//       error.value = err as Error;
//       console.error(`Error al cargar reservaciones con estado ${status}:`, err);
//     } finally {
//       loading.value = false;
//     }
//   };

//   // Método para cargar una reservación específica
//   const fetchReservationById = async (id: string) => {
//     loading.value = true;
//     error.value = null;

//     try {
//       const reservation = await firebaseAPI.getReservationById(id);
//       selectedReservation.value = reservation;
//     } catch (err) {
//       error.value = err as Error;
//       console.error(`Error al cargar la reservación ${id}:`, err);
//     } finally {
//       loading.value = false;
//     }
//   };

//   // Método para aprobar una reservación
//   const approveReservation = async (id: string) => {
//     loading.value = true;
//     error.value = null;

//     try {
//       await firebaseAPI.approveReservation(id);

//       // Actualizar estado local
//       const index = reservations.value.findIndex(r => r.id === id);
//       if (index !== -1) {
//         reservations.value[index].status = ReservationStatus.APPROVED;
//       }

//       return true;
//     } catch (err) {
//       error.value = err as Error;
//       console.error(`Error al aprobar la reservación ${id}:`, err);
//       return false;
//     } finally {
//       loading.value = false;
//     }
//   };

//   // Método para rechazar una reservación
//   const rejectReservation = async (id: string) => {
//     loading.value = true;
//     error.value = null;

//     try {
//       await firebaseAPI.rejectReservation(id);

//       // Actualizar estado local
//       const index = reservations.value.findIndex(r => r.id === id);
//       if (index !== -1) {
//         reservations.value[index].status = ReservationStatus.REJECTED;
//       }

//       return true;
//     } catch (err) {
//       error.value = err as Error;
//       console.error(`Error al rechazar la reservación ${id}:`, err);
//       return false;
//     } finally {
//       loading.value = false;
//     }
//   };

//   // Método para marcar como completada una reservación
//   const completeReservation = async (id: string) => {
//     loading.value = true;
//     error.value = null;

//     try {
//       await firebaseAPI.completeReservation(id);

//       // Actualizar estado local
//       const index = reservations.value.findIndex(r => r.id === id);
//       if (index !== -1) {
//         reservations.value[index].status = ReservationStatus.COMPLETED;
//       }

//       return true;
//     } catch (err) {
//       error.value = err as Error;
//       console.error(`Error al completar la reservación ${id}:`, err);
//       return false;
//     } finally {
//       loading.value = false;
//     }
//   };

//   // Método para cancelar una reservación
//   const cancelReservation = async (id: string) => {
//     loading.value = true;
//     error.value = null;

//     try {
//       await firebaseAPI.cancelReservation(id);

//       // Actualizar estado local
//       const index = reservations.value.findIndex(r => r.id === id);
//       if (index !== -1) {
//         reservations.value[index].status = ReservationStatus.CANCELLED;
//       }

//       return true;
//     } catch (err) {
//       error.value = err as Error;
//       console.error(`Error al cancelar la reservación ${id}:`, err);
//       return false;
//     } finally {
//       loading.value = false;
//     }
//   };

//   // Método para filtrar reservaciones
//   const filterByStatus = (status: ReservationStatus | null) => {
//     statusFilter.value = status;
//   };

//   // Método para buscar reservaciones
//   const search = (query: string) => {
//     searchQuery.value = query;
//   };

//   // Cargar reservaciones pendientes al montar el componente
//   onMounted(() => {
//     if (statusFilter.value) {
//       fetchReservationsByStatus(statusFilter.value);
//     } else {
//       fetchAllReservations();
//     }
//   });

//   // Observar cambios en el filtro de estado
//   watch(statusFilter, newStatus => {
//     if (newStatus) {
//       fetchReservationsByStatus(newStatus);
//     } else {
//       fetchAllReservations();
//     }
//   });

//   // Devolver los datos y métodos
//   return {
//     // Estado
//     reservations,
//     selectedReservation,
//     loading,
//     error,
//     statusFilter,
//     searchQuery,

//     // Propiedades computadas
//     pendingReservations,
//     approvedReservations,
//     rejectedReservations,
//     completedReservations,
//     cancelledReservations,
//     filteredReservations,
//     pendingCount,

//     // Métodos
//     fetchAllReservations,
//     fetchReservationsByStatus,
//     fetchReservationById,
//     approveReservation,
//     rejectReservation,
//     completeReservation,
//     cancelReservation,
//     filterByStatus,
//     search
//   };
// }
