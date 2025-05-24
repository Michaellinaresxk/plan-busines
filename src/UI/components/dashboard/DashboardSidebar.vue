<template>
  <v-navigation-drawer v-model="drawerModel" :rail="railModel" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave"
    :permanent="mdAndUp" :temporary="!mdAndUp" elevation="0" border color="surface" class="sidebar">
    <!-- Logo y Título -->
    <div class="brand-container pa-4 d-flex align-center">
      <v-avatar color="primary" class="logo-avatars" elevation="1">
        <v-icon icon="mdi-calendar-check" color="white"></v-icon>
      </v-avatar>
      <h2 class="text-h6 font-weight-bold brand-gradient ml-2">
        Plan<span class="brand-accent" color="">Business</span>
      </h2>
    </div>

    <v-divider class="mt-2 mb-3"></v-divider>

    <!-- Sección Principal -->
    <div class="px-3">
      <v-list-subheader v-show="!railModel" class="text-overline font-weight-bold text-primary px-2">
        Principal
      </v-list-subheader>

      <v-list nav class="nav-list">
        <!-- Dashboard -->
        <v-list-item prepend-icon="mdi-view-dashboard-outline" title="Dashboard" value="dashboard"
          :active="currentRoute === '/dashboard'" color="primary" rounded="lg" class="list-item mb-1"
          :class="{ 'active-item': currentRoute === '/dashboard' }" to="/dashboard"></v-list-item>

        <!-- Approved -->
        <v-list-item prepend-icon="mdi-check-circle" title="Approved" value="approved"
          :active="currentRoute === '/approved'" color="primary" rounded="lg" class="list-item mb-1"
          :class="{ 'active-item': currentRoute === '/approved' }" to="/approved" :badge="approvedCount"
          badge-color="success"></v-list-item>

        <!-- Pendientes -->
        <v-list-item prepend-icon="mdi-calendar-clock" title="Pendientes" value="pending"
          :active="currentRoute === '/pending'" color="primary" :badge="pendingCount" badge-color="error" rounded="lg"
          class="list-item mb-1" :class="{ 'active-item': currentRoute === '/pending' }" to="/pending"></v-list-item>

        <!-- Rechazadas -->
        <v-list-item prepend-icon="mdi-calendar-remove" title="Rechazadas" value="rejected"
          :active="currentRoute === '/rejected'" color="primary" rounded="lg" class="list-item mb-1"
          :class="{ 'active-item': currentRoute === '/rejected' }" to="/rejected"></v-list-item>
      </v-list>

      <!-- Sección Proveedores -->
      <v-divider class="my-3" v-show="!railModel"></v-divider>

      <v-list-subheader v-show="!railModel" class="text-overline font-weight-bold text-primary px-2">
        Servicios Externos
      </v-list-subheader>

      <v-list nav class="nav-list">
        <v-list-item prepend-icon="mdi-account-hard-hat" title="Proveedores" value="suppliers"
          :active="currentRoute === '/suppliers'" color="primary" :badge="suppliersCount" badge-color="info"
          rounded="lg" class="list-item mb-1" :class="{ 'active-item': currentRoute === '/suppliers' }"
          to="/suppliers"></v-list-item>
      </v-list>

      <!-- Sección Análisis -->
      <v-divider class="my-3" v-show="!railModel"></v-divider>

      <v-list-subheader v-show="!railModel" class="text-overline font-weight-bold text-primary px-2">
        Análisis
      </v-list-subheader>

      <v-list nav class="nav-list">
        <v-list-item prepend-icon="mdi-history" title="Historial" value="history" :active="currentRoute === '/history'"
          color="primary" rounded="lg" class="list-item mb-1" :class="{ 'active-item': currentRoute === '/history' }"
          to="/history"></v-list-item>

        <v-list-item prepend-icon="mdi-chart-bar" title="Estadísticas" value="stats" :active="currentRoute === '/stats'"
          color="primary" rounded="lg" class="list-item mb-1" :class="{ 'active-item': currentRoute === '/stats' }"
          to="/stats"></v-list-item>
      </v-list>
    </div>

    <!-- Botón de acción y perfil -->
    <template v-slot:append>
      <div class="actions-container pa-3" v-if="!railModel">
        <v-btn block color="primary" variant="elevated" prepend-icon="mdi-plus" class="action-btn mb-3" elevation="1"
          rounded="lg" @click="createNewReservation">
          Nueva reserva
        </v-btn>
      </div>

      <div v-if="!railModel" class="user-profile px-3 py-3 mx-3 mb-3 d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="36" class="mr-2 user-avatar">
            <span class="text-primary font-weight-bold">AM</span>
          </v-avatar>
          <div>
            <p class="text-body-2 mb-0 font-weight-medium">Admin Manager</p>
            <p class="text-caption text-medium-emphasis">admin@example.com</p>
          </div>
        </div>
        <v-btn icon="mdi-logout" size="small" variant="text" color="primary" class="logout-btn"
          @click="handleLogout"></v-btn>
      </div>

      <!-- Avatar compacto en modo rail -->
      <div class="d-flex justify-center" v-else>
        <v-avatar color="primary" size="36" class="mb-3 user-avatar-rail">
          <span class="text-caption">AM</span>
        </v-avatar>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Router composables
const route = useRoute();
const router = useRouter();

// Props
const props = defineProps<{
  drawer: boolean;
  rail: boolean;
  mdAndUp: boolean;
  pendingCount: number;
  suppliersCount: number;
  approvedCount?: number;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:drawer', value: boolean): void;
  (e: 'update:rail', value: boolean): void;
  (e: 'create-reservation'): void;
  (e: 'logout'): void;
}>();

// Computed para obtener la ruta actual
const currentRoute = computed(() => route.path);

// Modelo v-model para drawer y rail
const drawerModel = computed({
  get: () => props.drawer,
  set: value => emit('update:drawer', value)
});

const railModel = computed({
  get: () => props.rail,
  set: value => emit('update:rail', value)
});

// Métodos
const onMouseEnter = () => {
  emit('update:rail', false);
};

const onMouseLeave = () => {
  if (props.mdAndUp) {
    emit('update:rail', true);
  }
};

const createNewReservation = () => {
  emit('create-reservation');
};

const handleLogout = () => {
  emit('logout');
};

// Debug - Log route changes
console.log('🔍 Current route:', currentRoute.value);
</script>

<style scoped>
.sidebar {
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.brand-container {
  margin-bottom: 12px;
  padding-left: 20px;
  position: relative;
}

.logo-avatars {
  box-shadow: 0 4px 8px rgba(var(--v-theme-primary), 0.2);
  margin-left: -7px;
}

.brand-gradient {
  background: linear-gradient(90deg,
      rgba(var(--v-theme-primary), 1) 0%,
      rgba(var(--v-theme-primary), 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.brand-accent {
  opacity: 0.7;
}

.nav-list {
  padding: 0 4px;
}

.list-item {
  transition: all 0.3s ease;
  font-weight: 500;
  margin-left: 0;
  margin-right: 0;
  position: relative;
  overflow: hidden;
}

.list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(4px);
}

.active-item {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
}

/* Estilo especial para elementos activos con router-link */
.list-item.router-link-active {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
}

.actions-container {
  padding-bottom: 16px;
}

.action-btn {
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  font-weight: 600;
  text-transform: none;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

.user-profile {
  background-color: rgba(var(--v-theme-surface-variant), 0.4);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-profile:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.6);
}

.user-avatar {
  border: 2px solid rgba(var(--v-theme-primary), 0.1);
}

.user-avatar-rail {
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.2);
  transition: all 0.3s ease;
}

.user-avatar-rail:hover {
  transform: scale(1.1);
}

.logout-btn {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  opacity: 1;
  transform: rotate(15deg);
}
</style>
