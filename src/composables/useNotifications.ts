// composables/useNotifications.ts
import { ref, computed, onMounted, onUnmounted, inject, readonly } from 'vue';
import { reservationServiceKey } from '@/services/ReservationService';

interface NotificationItem {
  id: string;
  type: 'new_reservation' | 'urgent_pending' | 'payment_received' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  severity: 'low' | 'medium' | 'high';
  data?: any; // Datos adicionales como reservationId
}

export function useNotifications() {
  // Servicios inyectados
  const reservationService = inject(reservationServiceKey);

  // Estado reactivo
  const notifications = ref<NotificationItem[]>([]);
  const isLoading = ref(false);
  const lastChecked = ref<Date>(new Date());

  // Configuración de polling
  const POLLING_INTERVAL = 30000; // 30 segundos
  let pollingTimer: NodeJS.Timeout | null = null;

  // Computed properties
  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);

  const pendingReservationsCount = computed(
    () => notifications.value.filter(n => n.type === 'new_reservation' && !n.isRead).length
  );

  const urgentNotifications = computed(() =>
    notifications.value.filter(n => n.severity === 'high' && !n.isRead)
  );

  // Métodos principales
  async function checkForNewReservations() {
    if (!reservationService) return;

    try {
      isLoading.value = true;

      // Obtener reservas pendientes desde Firebase
      const pendingReservations = await reservationService.getPendingReservations();

      // Filtrar solo las reservas nuevas (creadas después de la última verificación)
      const newReservations = pendingReservations.filter(reservation => {
        const reservationDate = new Date(reservation.bookingDate);
        return reservationDate > lastChecked.value;
      });

      // Crear notificaciones para las nuevas reservas
      const newNotifications: NotificationItem[] = newReservations.map(reservation => ({
        id: `reservation_${reservation.bookingId}`,
        type: 'new_reservation',
        title: 'Nueva Reserva Pendiente',
        message: `${reservation.clientName} - ${reservation.serviceName}`,
        timestamp: new Date(reservation.bookingDate),
        isRead: false,
        severity: reservation.isPriority ? 'high' : 'medium',
        data: { reservationId: reservation.bookingId, reservation }
      }));

      // Verificar reservas urgentes (más de 2 horas pendientes)
      const urgentReservations = pendingReservations.filter(reservation => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        return new Date(reservation.bookingDate) < twoHoursAgo;
      });

      const urgentNotifications: NotificationItem[] = urgentReservations
        .filter(
          reservation => !notifications.value.some(n => n.id === `urgent_${reservation.bookingId}`)
        )
        .map(reservation => ({
          id: `urgent_${reservation.bookingId}`,
          type: 'urgent_pending',
          title: 'Reserva Urgente',
          message: `${reservation.clientName} - Pendiente +2h`,
          timestamp: new Date(),
          isRead: false,
          severity: 'high',
          data: { reservationId: reservation.bookingId, reservation }
        }));

      // Agregar nuevas notificaciones
      const allNewNotifications = [...newNotifications, ...urgentNotifications];

      if (allNewNotifications.length > 0) {
        notifications.value.unshift(...allNewNotifications);

        // Emitir evento para mostrar toast o sonido
        emitNotificationEvent('new_notifications', allNewNotifications);

        // Limitar a máximo 50 notificaciones
        if (notifications.value.length > 50) {
          notifications.value = notifications.value.slice(0, 50);
        }
      }

      lastChecked.value = new Date();
    } catch (error) {
      console.error('Error checking for new reservations:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function markAsRead(notificationId: string) {
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(notification => {
      notification.isRead = true;
    });
  }

  function removeNotification(notificationId: string) {
    const index = notifications.value.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }

  function clearAllNotifications() {
    notifications.value = [];
  }

  function clearReadNotifications() {
    notifications.value = notifications.value.filter(n => !n.isRead);
  }

  // Sistema de eventos para comunicación con otros componentes
  function emitNotificationEvent(eventType: string, data: any) {
    // Usar EventBus o emit personalizado
    window.dispatchEvent(
      new CustomEvent('notification-event', {
        detail: { type: eventType, data }
      })
    );
  }

  // Gestión del polling
  function startPolling() {
    if (pollingTimer) return;

    pollingTimer = setInterval(() => {
      checkForNewReservations();
    }, POLLING_INTERVAL);

    console.log('📡 Notifications polling started');
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
      console.log('📡 Notifications polling stopped');
    }
  }

  // Inicialización y limpieza
  onMounted(async () => {
    await checkForNewReservations();
    startPolling();
  });

  onUnmounted(() => {
    stopPolling();
  });

  // API pública del composable
  return {
    // Estado
    notifications: readonly(notifications),
    isLoading: readonly(isLoading),
    unreadCount,
    pendingReservationsCount,
    urgentNotifications,

    // Métodos
    checkForNewReservations,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    clearReadNotifications,
    startPolling,
    stopPolling
  };
}
