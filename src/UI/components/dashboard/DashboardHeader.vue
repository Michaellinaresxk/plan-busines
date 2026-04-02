<template>
  <v-app-bar elevation="0" color="surface" class="app-header px-2" border="b">

    <!-- Mobile menu button -->
    <v-app-bar-nav-icon
      v-if="!mdAndUp"
      @click.stop="toggleDrawer"
      color="on-surface-variant"
    />

    <!-- Desktop rail toggle -->
    <v-btn
      v-else
      @click.stop="toggleRail"
      icon="mdi-menu"
      variant="text"
      color="on-surface-variant"
    />

    <!-- Page title — desktop only -->
    <v-app-bar-title class="d-none d-sm-flex">
      <span class="header-title">Plan-Business</span>
    </v-app-bar-title>

    <v-spacer />

    <!-- Notification Bell -->
    <v-menu
      v-model="showNotificationsMenu"
      :close-on-content-click="false"
      anchor="bottom end"
      max-width="400"
      offset="8"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          variant="text"
          icon
          class="notif-btn"
          :class="{ 'notif-btn--urgent': hasUrgentNotifications }"
        >
          <v-badge
            v-if="unreadCount > 0"
            :content="unreadCount > 99 ? '99+' : String(unreadCount)"
            :color="hasUrgentNotifications ? 'error' : 'warning'"
            offset-x="3"
            offset-y="3"
          >
            <v-icon
              :class="{ 'bell-ring': hasNewNotifications }"
              size="22"
              color="on-surface-variant"
            >
              mdi-bell-outline
            </v-icon>
          </v-badge>
          <v-icon v-else size="22" color="on-surface-variant">mdi-bell-outline</v-icon>
        </v-btn>
      </template>

      <!-- Notifications Panel -->
      <v-card class="notif-panel" rounded="xl" elevation="8">
        <v-card-title class="notif-panel-header">
          <div class="d-flex align-center gap-2">
            <v-icon icon="mdi-bell-outline" size="18" />
            <span class="text-subtitle-1 font-weight-semibold">Notificaciones</span>
            <v-chip v-if="unreadCount > 0" :color="hasUrgentNotifications ? 'error' : 'primary'" size="x-small">
              {{ unreadCount }}
            </v-chip>
          </div>
          <div class="d-flex gap-1">
            <v-btn icon="mdi-refresh" variant="text" size="small" :loading="isLoading" @click="checkForNewReservations" />
            <v-btn v-if="unreadCount > 0" icon="mdi-check-all" variant="text" size="small" @click="markAllAsRead" />
          </div>
        </v-card-title>

        <v-divider />

        <div class="notif-list">
          <div v-if="isLoading && notifications.length === 0" class="notif-empty">
            <v-progress-circular indeterminate size="28" color="primary" />
            <p class="text-caption mt-2">Cargando...</p>
          </div>

          <div v-else-if="notifications.length === 0" class="notif-empty">
            <v-icon icon="mdi-bell-off-outline" size="40" color="grey-lighten-1" />
            <p class="text-body-2 font-weight-medium mt-2">Sin notificaciones</p>
            <p class="text-caption text-medium-emphasis">Las nuevas aparecerán aquí</p>
          </div>

          <div v-else>
            <div
              v-for="notification in displayedNotifications"
              :key="notification.id"
              class="notif-item"
              :class="{
                'notif-item--unread': !notification.isRead,
                'notif-item--urgent': notification.severity === 'high'
              }"
              @click="handleNotificationClick(notification)"
            >
              <v-avatar
                :color="getNotificationColor(notification.type, notification.severity)"
                size="32"
                class="flex-shrink-0"
              >
                <v-icon :icon="getNotificationIcon(notification.type)" size="16" color="white" />
              </v-avatar>

              <div class="notif-content">
                <div class="notif-header">
                  <span class="notif-title">{{ notification.title }}</span>
                  <span class="notif-time">{{ formatTime(notification.timestamp) }}</span>
                </div>
                <p class="notif-message">{{ notification.message }}</p>
                <div v-if="notification.type === 'new_reservation'" class="mt-1">
                  <v-btn size="x-small" color="primary" variant="tonal" @click.stop="goToPendingReservations">
                    Ver Pendientes
                  </v-btn>
                </div>
              </div>

              <v-btn
                icon="mdi-close"
                variant="text"
                size="x-small"
                class="notif-close"
                @click.stop="removeNotification(notification.id)"
              />
            </div>
          </div>
        </div>

        <v-divider />
        <v-card-actions class="px-3 py-2">
          <v-btn variant="text" size="small" block color="primary" @click="goToPendingReservations">
            Ver todas las reservas pendientes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

    <!-- User Menu -->
    <v-menu anchor="bottom end" offset="8">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" class="ml-1 user-btn">
          <v-avatar size="34" color="primary" variant="tonal">
            <span class="text-caption font-weight-bold">RM</span>
          </v-avatar>
          <v-icon class="ml-1 d-none d-sm-flex" size="small" color="on-surface-variant">
            mdi-chevron-down
          </v-icon>
        </v-btn>
      </template>
      <v-card min-width="200" elevation="8" rounded="xl">
        <v-list density="compact" nav class="py-2">
          <v-list-item prepend-icon="mdi-account-outline" title="Mi perfil" rounded="lg" />
          <v-list-item prepend-icon="mdi-cog-outline" title="Configuración" rounded="lg" />
          <v-divider class="my-1" />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar sesión"
            rounded="lg"
            class="text-error"
            :disabled="isLoggingOut"
            @click="handleLogout"
          />
        </v-list>
      </v-card>
    </v-menu>

    <!-- New notification toast -->
    <v-snackbar
      v-model="showNewNotificationToast"
      :timeout="4000"
      location="top end"
      color="primary"
      rounded="pill"
    >
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-bell-ring" size="18" />
        {{ newNotificationMessage }}
      </div>
      <template #actions>
        <v-btn icon="mdi-close" variant="text" size="small" @click="showNewNotificationToast = false" />
      </template>
    </v-snackbar>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
import { userServiceKey } from '@/services/userService';
import { useNotifications } from '@/composables/useNotifications';

// ── Internal display state (no prop needed) ──
const { mdAndUp } = useDisplay();

// ── Props (optional for backward compat) ──
const props = withDefaults(defineProps<{
  drawer?: boolean;
  rail?: boolean;
}>(), {
  drawer: false,
  rail: false
});

const emit = defineEmits<{
  (e: 'update:drawer', value: boolean): void;
  (e: 'update:rail', value: boolean): void;
  (e: 'toggle-theme'): void;
}>();

const router = useRouter();
const userService = inject(userServiceKey);

if (!userService) {
  throw new Error('UserService is not available');
}

const {
  notifications,
  isLoading,
  unreadCount,
  urgentNotifications,
  checkForNewReservations,
  markAsRead,
  markAllAsRead,
  removeNotification,
} = useNotifications();

// ── Local state ──
const isLoggingOut = ref(false);
const showNotificationsMenu = ref(false);
const showNewNotificationToast = ref(false);
const newNotificationMessage = ref('');
const hasNewNotifications = ref(false);

// ── Computed ──
const hasUrgentNotifications = computed(() => urgentNotifications.value.length > 0);
const displayedNotifications = computed(() => notifications.value.slice(0, 10));

// ── Helpers ──
function getNotificationIcon(type: string): string {
  const map: Record<string, string> = {
    new_reservation: 'mdi-calendar-plus',
    urgent_pending: 'mdi-clock-alert',
    payment_received: 'mdi-credit-card',
    system: 'mdi-information',
  };
  return map[type] ?? 'mdi-bell';
}

function getNotificationColor(type: string, severity: string): string {
  if (severity === 'high') return 'error';
  if (severity === 'medium') return 'warning';
  const map: Record<string, string> = {
    new_reservation: 'primary',
    urgent_pending: 'error',
    payment_received: 'success',
    system: 'info',
  };
  return map[type] ?? 'grey';
}

function formatTime(timestamp: Date): string {
  const diff = Date.now() - timestamp.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return 'Ahora';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  return `${d}d`;
}

// ── Actions ──
function toggleDrawer() {
  emit('update:drawer', !props.drawer);
}

function toggleRail() {
  emit('update:rail', !props.rail);
}

function handleNotificationClick(notification: any) {
  markAsRead(notification.id);
  if (['new_reservation', 'urgent_pending'].includes(notification.type)) {
    goToPendingReservations();
  }
}

function goToPendingReservations() {
  showNotificationsMenu.value = false;
  router.push({ name: 'PendingReservations' });
}

async function handleLogout() {
  isLoggingOut.value = true;
  try {
    await userService!.logout();
    router.push({ name: 'Login' });
  } catch (e) {
    console.error('Logout error:', e);
  } finally {
    isLoggingOut.value = false;
  }
}

function handleNotificationEvent(event: Event) {
  const { type, data } = (event as CustomEvent).detail;
  if (type === 'new_notifications' && data.length > 0) {
    hasNewNotifications.value = true;
    newNotificationMessage.value = `${data[0].title}: ${data[0].message}`;
    showNewNotificationToast.value = true;
    setTimeout(() => { hasNewNotifications.value = false; }, 3000);
  }
}

onMounted(() => window.addEventListener('notification-event', handleNotificationEvent));
onUnmounted(() => window.removeEventListener('notification-event', handleNotificationEvent));
</script>

<style scoped>
.app-header {
  border-bottom-color: rgba(var(--v-theme-on-surface), 0.08) !important;
}

.header-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.85);
  letter-spacing: -0.2px;
}

/* Notification button */
.notif-btn {
  transition: transform 0.2s ease;
}

.notif-btn--urgent {
  animation: urgentPulse 2s infinite;
}

@keyframes urgentPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

.bell-ring {
  animation: bellRing 0.5s ease-in-out;
}

@keyframes bellRing {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
}

/* Notifications panel */
.notif-panel {
  min-width: 360px;
  max-width: 400px;
}

.notif-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
}

.notif-list {
  max-height: 340px;
  overflow-y: auto;
}

.notif-list::-webkit-scrollbar { width: 4px; }
.notif-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 2px;
}

.notif-empty {
  padding: 40px 20px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* Notification items */
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
  border-left: 3px solid transparent;
}

.notif-item:hover {
  background: rgba(var(--v-theme-primary), 0.04);
}

.notif-item--unread {
  background: rgba(var(--v-theme-primary), 0.03);
  border-left-color: rgb(var(--v-theme-primary));
}

.notif-item--urgent {
  border-left-color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.02);
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3px;
}

.notif-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.notif-time {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  flex-shrink: 0;
  margin-left: 8px;
}

.notif-message {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
  margin: 0;
  line-height: 1.4;
}

.notif-close {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.notif-item:hover .notif-close {
  opacity: 0.6;
}

/* User button */
.user-btn {
  border-radius: 10px;
}

@media (max-width: 600px) {
  .notif-panel {
    min-width: 300px;
    max-width: 90vw;
  }
}
</style>
