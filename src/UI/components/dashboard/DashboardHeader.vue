<template>
  <v-app-bar elevation="0" border class="px-2" color="primary">
    <!-- Botón de menú móvil -->
    <v-app-bar-nav-icon
      v-if="!mdAndUp"
      @click.stop="toggleDrawer"
      color="primary">
    </v-app-bar-nav-icon>

    <!-- Botón de menú desktop -->
    <v-btn
      v-else
      @click.stop="toggleRail"
      icon="mdi-menu"
      variant="text"
      color="primary">
    </v-btn>

    <!-- Título -->
    <v-app-bar-title class="text-md-h6 font-weight-medium d-none d-sm-flex">
      Plan-Business
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <!-- Notificaciones con sistema reactivo -->
    <v-menu
      v-model="showNotificationsMenu"
      :close-on-content-click="false"
      anchor="bottom end"
      max-width="400"
      offset="8">

      <template v-slot:activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          icon="mdi-bell"
          variant="text"
          class="ml-2 notification-btn"
          :class="{ 'notification-btn--has-urgent': hasUrgentNotifications }">

          <v-badge
            v-if="unreadCount > 0"
            :content="unreadCount > 99 ? '99+' : unreadCount.toString()"
            :color="hasUrgentNotifications ? 'error' : 'warning'"
            offset-x="3"
            offset-y="3"
            class="notification-badge">
            <v-icon
              :class="{ 'notification-bell--animate': hasNewNotifications }"
              size="24">
              mdi-bell
            </v-icon>
          </v-badge>

          <v-icon v-else size="24">mdi-bell</v-icon>
        </v-btn>
      </template>

      <!-- Panel de notificaciones -->
      <v-card class="notifications-panel" rounded="lg" elevation="8">
        <!-- Header del panel -->
        <v-card-title class="d-flex align-center justify-space-between py-3 px-4">
          <div class="d-flex align-center">
            <v-icon icon="mdi-bell" size="20" class="mr-2"></v-icon>
            <span class="text-h6">Notificaciones</span>
            <v-chip
              v-if="unreadCount > 0"
              :color="hasUrgentNotifications ? 'error' : 'primary'"
              size="small"
              class="ml-2">
              {{ unreadCount }}
            </v-chip>
          </div>

          <div class="d-flex align-center gap-1">
            <v-btn
              icon="mdi-refresh"
              variant="text"
              size="small"
              :loading="isLoading"
              @click="checkForNewReservations">
            </v-btn>

            <v-btn
              v-if="unreadCount > 0"
              icon="mdi-check-all"
              variant="text"
              size="small"
              @click="markAllAsRead">
            </v-btn>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Lista de notificaciones -->
        <div class="notifications-list">
          <div v-if="isLoading && notifications.length === 0" class="loading-state">
            <v-progress-circular indeterminate size="32" color="primary"></v-progress-circular>
            <p class="text-caption mt-2">Cargando notificaciones...</p>
          </div>

          <div v-else-if="notifications.length === 0" class="empty-state">
            <v-icon icon="mdi-bell-off" size="48" color="grey-lighten-1"></v-icon>
            <p class="text-subtitle-2 mt-2">No hay notificaciones</p>
            <p class="text-caption text-medium-emphasis">Las nuevas notificaciones aparecerán aquí</p>
          </div>

          <div v-else class="notification-items">
            <div
              v-for="notification in displayedNotifications"
              :key="notification.id"
              class="notification-item"
              :class="{
                'notification-item--unread': !notification.isRead,
                'notification-item--urgent': notification.severity === 'high'
              }"
              @click="handleNotificationClick(notification)">

              <!-- Indicador de prioridad -->
              <div
                class="notification-indicator"
                :class="`notification-indicator--${notification.severity}`">
              </div>

              <!-- Avatar/Icono -->
              <v-avatar
                :color="getNotificationColor(notification.type, notification.severity)"
                size="36"
                class="notification-avatar">
                <v-icon
                  :icon="getNotificationIcon(notification.type)"
                  size="18"
                  color="white">
                </v-icon>
              </v-avatar>

              <!-- Contenido -->
              <div class="notification-content">
                <div class="notification-header">
                  <h4 class="notification-title">{{ notification.title }}</h4>
                  <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                </div>

                <p class="notification-message">{{ notification.message }}</p>

                <div v-if="notification.type === 'new_reservation'" class="notification-actions">
                  <v-btn
                    size="x-small"
                    color="primary"
                    variant="tonal"
                    @click.stop="goToPendingReservations">
                    Ver Pendientes
                  </v-btn>
                </div>
              </div>

              <!-- Botón de cerrar -->
              <v-btn
                icon="mdi-close"
                variant="text"
                size="x-small"
                class="notification-close"
                @click.stop="removeNotification(notification.id)">
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Footer del panel -->
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-2">
          <v-btn
            variant="text"
            size="small"
            block
            @click="goToPendingReservations">
            Ver todas las reservas pendientes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

    <!-- Avatar usuario -->
    <v-menu anchor="bottom end">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" variant="text" class="ml-2">
          <v-avatar size="40" color="text-white" variant="tonal">
            <span class="text-caption">RM</span>
          </v-avatar>
          <v-icon class="ml-1 d-none d-sm-flex" size="small">mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-card min-width="200" elevation="4" rounded="lg">
        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-account-outline" title="Mi perfil" rounded="lg"></v-list-item>
          <v-list-item prepend-icon="mdi-cog-outline" title="Configuración" rounded="lg"></v-list-item>
          <v-divider class="my-1"></v-divider>
          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar sesión"
            rounded="lg"
            class="text-error"
            :loading="isLoggingOut"
            @click="handleLogout">
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>

    <!-- Toast para nuevas notificaciones -->
    <v-snackbar
      v-model="showNewNotificationToast"
      :timeout="4000"
      location="top end"
      color="primary"
      rounded="pill">
      <div class="d-flex align-center">
        <v-icon icon="mdi-bell-ring" class="mr-2"></v-icon>
        {{ newNotificationMessage }}
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" @click="showNewNotificationToast = false"></v-btn>
      </template>
    </v-snackbar>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { userServiceKey } from '@/services/userService'
import { useNotifications } from '@/composables/useNotifications'

// Props
const props = defineProps<{
  drawer: boolean
  rail: boolean
  mdAndUp: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:drawer', value: boolean): void
  (e: 'update:rail', value: boolean): void
  (e: 'toggle-theme'): void
}>()

// Dependencies
const router = useRouter()
const userService = inject(userServiceKey)

if (!userService) {
  throw new Error('UserService is not available')
}

// Composables
const {
  notifications,
  isLoading,
  unreadCount,
  urgentNotifications,
  checkForNewReservations,
  markAsRead,
  markAllAsRead,
  removeNotification
} = useNotifications()

// Estado local
const isLoggingOut = ref(false)
const showNotificationsMenu = ref(false)
const showNewNotificationToast = ref(false)
const newNotificationMessage = ref('')
const hasNewNotifications = ref(false)

// Computed properties
const hasUrgentNotifications = computed(() => urgentNotifications.value.length > 0)

const displayedNotifications = computed(() =>
  notifications.value.slice(0, 10) // Mostrar solo las 10 más recientes
)

// Métodos de utilidad
const getNotificationIcon = (type: string): string => {
  const icons = {
    new_reservation: 'mdi-calendar-plus',
    urgent_pending: 'mdi-clock-alert',
    payment_received: 'mdi-credit-card',
    system: 'mdi-information'
  }
  return icons[type] || 'mdi-bell'
}

const getNotificationColor = (type: string, severity: string): string => {
  if (severity === 'high') return 'error'
  if (severity === 'medium') return 'warning'

  const colors = {
    new_reservation: 'primary',
    urgent_pending: 'error',
    payment_received: 'success',
    system: 'info'
  }
  return colors[type] || 'grey'
}

const formatTime = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

// Event handlers
const toggleDrawer = () => {
  emit('update:drawer', !props.drawer)
}

const toggleRail = () => {
  emit('update:rail', !props.rail)
}

const handleNotificationClick = (notification: any) => {
  markAsRead(notification.id)

  if (notification.type === 'new_reservation' || notification.type === 'urgent_pending') {
    goToPendingReservations()
  }
}

const goToPendingReservations = () => {
  showNotificationsMenu.value = false
  router.push({ name: 'PendingReservations' })
}

const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    await userService.logout()
    router.push({ name: 'Login' })
  } catch (error) {
    console.error('Error during logout:', error)
  } finally {
    isLoggingOut.value = false
  }
}

// Escuchar eventos de nuevas notificaciones
const handleNotificationEvent = (event: CustomEvent) => {
  const { type, data } = event.detail

  if (type === 'new_notifications' && data.length > 0) {
    hasNewNotifications.value = true

    // Mostrar toast para la primera notificación
    const firstNotification = data[0]
    newNotificationMessage.value = `${firstNotification.title}: ${firstNotification.message}`
    showNewNotificationToast.value = true

    // Remover animación después de 3 segundos
    setTimeout(() => {
      hasNewNotifications.value = false
    }, 3000)
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('notification-event', handleNotificationEvent)
})

onUnmounted(() => {
  window.removeEventListener('notification-event', handleNotificationEvent)
})
</script>

<style scoped>
/* Botón de notificaciones */
.notification-btn {
  transition: all 0.3s ease;
}

.notification-btn--has-urgent {
  animation: urgentPulse 2s infinite;
}

@keyframes urgentPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.notification-badge {
  position: relative;
}

.notification-bell--animate {
  animation: bellRing 0.5s ease-in-out;
}

@keyframes bellRing {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
}

/* Panel de notificaciones */
.notifications-panel {
  min-width: 380px;
  max-width: 400px;
  max-height: 500px;
  overflow: hidden;
}

.notifications-list {
  max-height: 350px;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Elementos de notificación */
.notification-items {
  padding: 8px 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-left: 3px solid transparent;
}

.notification-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
}

.notification-item--unread {
  background: rgba(var(--v-theme-primary), 0.02);
  border-left-color: rgb(var(--v-theme-primary));
}

.notification-item--urgent {
  border-left-color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.02);
}

.notification-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}

.notification-indicator--high {
  background: rgb(var(--v-theme-error));
}

.notification-indicator--medium {
  background: rgb(var(--v-theme-warning));
}

.notification-indicator--low {
  background: rgb(var(--v-theme-info));
}

.notification-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.notification-time {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  flex-shrink: 0;
  margin-left: 8px;
}

.notification-message {
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.notification-actions {
  margin-top: 8px;
}

.notification-close {
  flex-shrink: 0;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-close {
  opacity: 1;
}

/* Scrollbar personalizada */
.notifications-list::-webkit-scrollbar {
  width: 4px;
}

.notifications-list::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-on-surface), 0.05);
}

.notifications-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 2px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}

/* Responsive */
@media (max-width: 600px) {
  .notifications-panel {
    min-width: 320px;
    max-width: 90vw;
  }
}
</style>
