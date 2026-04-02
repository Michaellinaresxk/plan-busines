<template>
  <v-navigation-drawer
    v-model="drawerModel"
    :rail="railModel"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    :permanent="mdAndUp"
    :temporary="!mdAndUp"
    elevation="0"
    theme="dark"
    color="#0F172A"
    class="modern-sidebar"
  >
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <v-icon icon="mdi-calendar-check" size="20" color="white" />
      </div>
      <transition name="brand-fade">
        <div v-if="!railModel" class="brand-text">
          <span class="brand-name">Plan</span><span class="brand-accent">Business</span>
        </div>
      </transition>
    </div>

    <div class="sidebar-section-divider" />

    <!-- Navigation -->
    <div class="sidebar-nav">

      <!-- Principal Section -->
      <p v-if="!railModel" class="nav-section-label">PRINCIPAL</p>

      <v-list nav density="compact" class="nav-list pa-0">
        <v-list-item
          prepend-icon="mdi-view-dashboard-outline"
          title="Dashboard"
          to="/dashboard"
          rounded="lg"
          class="nav-item"
          active-class="nav-item--active"
          color="#818CF8"
        >
          <template v-if="!railModel" #append>
            <span />
          </template>
        </v-list-item>

        <v-list-item
          prepend-icon="mdi-check-circle-outline"
          title="Aprobadas"
          to="/approved-reservation"
          rounded="lg"
          class="nav-item"
          active-class="nav-item--active"
          color="#818CF8"
        >
          <template v-if="approvedCount > 0 && !railModel" #append>
            <span class="nav-badge nav-badge--success">{{ approvedCount }}</span>
          </template>
        </v-list-item>

        <v-list-item
          prepend-icon="mdi-clock-outline"
          title="Pendientes"
          to="/pending"
          rounded="lg"
          class="nav-item"
          active-class="nav-item--active"
          color="#818CF8"
        >
          <template v-if="pendingCount > 0 && !railModel" #append>
            <span class="nav-badge nav-badge--error">{{ pendingCount }}</span>
          </template>
        </v-list-item>

        <v-list-item
          prepend-icon="mdi-close-circle-outline"
          title="Rechazadas"
          to="/rejected-reservation"
          rounded="lg"
          class="nav-item"
          active-class="nav-item--active"
          color="#818CF8"
        />
      </v-list>

      <div v-if="!railModel" class="sidebar-section-divider my-3" />

      <!-- Servicios Section -->
      <p v-if="!railModel" class="nav-section-label">SERVICIOS</p>

      <v-list nav density="compact" class="nav-list pa-0">
        <v-list-item
          prepend-icon="mdi-account-hard-hat-outline"
          title="Proveedores"
          to="/suppliers"
          rounded="lg"
          class="nav-item"
          active-class="nav-item--active"
          color="#818CF8"
        >
          <template v-if="suppliersCount > 0 && !railModel" #append>
            <span class="nav-badge nav-badge--info">{{ suppliersCount }}</span>
          </template>
        </v-list-item>
      </v-list>

      <div v-if="!railModel" class="sidebar-section-divider my-3" />

      <!-- Análisis Section -->
      <p v-if="!railModel" class="nav-section-label">ANÁLISIS</p>

      <v-list nav density="compact" class="nav-list pa-0">
        <v-list-item
          prepend-icon="mdi-package-variant-closed"
          title="Inventario"
          to="/inventory"
          rounded="lg"
          class="nav-item"
          active-class="nav-item--active"
          color="#818CF8"
        />
        <v-list-item
          prepend-icon="mdi-history"
          title="Historial"
          to="/all-reservations"
          rounded="lg"
          class="nav-item"
          active-class="nav-item--active"
          color="#818CF8"
        />
        <v-list-item
          prepend-icon="mdi-chart-areaspline"
          title="Estadísticas"
          to="/stats"
          rounded="lg"
          class="nav-item"
          active-class="nav-item--active"
          color="#818CF8"
        />
      </v-list>

    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';

const { mdAndUp } = useDisplay();

const props = withDefaults(defineProps<{
  drawer: boolean;
  rail: boolean;
  pendingCount?: number;
  suppliersCount?: number;
  approvedCount?: number;
}>(), {
  pendingCount: 0,
  suppliersCount: 0,
  approvedCount: 0
});

const emit = defineEmits<{
  (e: 'update:drawer', value: boolean): void;
  (e: 'update:rail', value: boolean): void;
}>();

const drawerModel = computed({
  get: () => props.drawer,
  set: value => emit('update:drawer', value)
});

const railModel = computed({
  get: () => props.rail,
  set: value => emit('update:rail', value)
});

const onMouseEnter = () => emit('update:rail', false);
const onMouseLeave = () => { if (mdAndUp.value) emit('update:rail', true); };
</script>

<style scoped>
/* ─── Sidebar Container ─── */
.modern-sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* ─── Brand ─── */
.sidebar-brand {
  display: flex;
  align-items: center;
  padding: 18px 14px 14px;
  gap: 12px;
  min-height: 64px;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.brand-text {
  display: flex;
  align-items: baseline;
  overflow: hidden;
  white-space: nowrap;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.3px;
}

.brand-accent {
  font-size: 1.1rem;
  font-weight: 700;
  color: #818CF8;
  letter-spacing: -0.3px;
}

/* ─── Dividers ─── */
.sidebar-section-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 0 14px;
}

/* ─── Navigation ─── */
.sidebar-nav {
  padding: 14px 8px 16px;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav::-webkit-scrollbar { width: 3px; }
.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}

.nav-section-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.28);
  padding: 4px 10px 6px;
  margin: 0;
  text-transform: uppercase;
}

.nav-list {
  gap: 0;
}

/* Override Vuetify list item styles for dark sidebar */
.nav-item {
  margin-bottom: 2px !important;
  min-height: 40px !important;
  border-radius: 10px !important;
}

:deep(.nav-item .v-list-item__prepend .v-icon) {
  color: rgba(255, 255, 255, 0.45) !important;
  opacity: 1 !important;
}

:deep(.nav-item .v-list-item-title) {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  color: rgba(255, 255, 255, 0.55) !important;
}

:deep(.nav-item:hover .v-list-item__prepend .v-icon) {
  color: rgba(255, 255, 255, 0.85) !important;
}

:deep(.nav-item:hover .v-list-item-title) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.nav-item:hover) {
  background: rgba(255, 255, 255, 0.06) !important;
}

/* Active state */
:deep(.nav-item--active) {
  background: rgba(129, 140, 248, 0.15) !important;
}

:deep(.nav-item--active .v-list-item__prepend .v-icon) {
  color: #818CF8 !important;
}

:deep(.nav-item--active .v-list-item-title) {
  color: #818CF8 !important;
  font-weight: 600 !important;
}

/* ─── Badges ─── */
.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  font-size: 0.68rem;
  font-weight: 700;
}

.nav-badge--success { background: #10B981; color: white; }
.nav-badge--error   { background: #EF4444; color: white; }
.nav-badge--info    { background: #3B82F6; color: white; }

/* ─── Transitions ─── */
.brand-fade-enter-active,
.brand-fade-leave-active {
  transition: opacity 0.18s ease;
}
.brand-fade-enter-from,
.brand-fade-leave-to {
  opacity: 0;
}
</style>
