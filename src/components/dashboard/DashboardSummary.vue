<template>
  <v-card elevation="0" rounded="lg" border class="mb-6 pa-4 pb-2">
    <!-- Header con acciones -->
    <div class="d-flex flex-wrap align-center justify-space-between mb-4">
      <div>
        <h1 class="text-h4 font-weight-bold mb-0 d-flex align-center">
          <v-avatar color="primary" size="40" class="mr-3 elevation-1">
            <v-icon color="white" size="20">mdi-calendar-clock</v-icon>
          </v-avatar>
          Reservas Pendientes
        </h1>
        <p class="text-medium-emphasis mt-1">
          Gestiona y aprueba las solicitudes de reserva de servicios
        </p>
      </div>

      <div class="d-flex flex-wrap gap-2 mt-2 mt-sm-0">
        <v-btn prepend-icon="mdi-refresh" color="secondary" variant="text" :loading="loading" @click="$emit('refresh')">
          Actualizar
        </v-btn>

        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" variant="outlined" v-bind="props" class="ml-2" prepend-icon="mdi-filter-variant">
              Filtros
              <v-chip v-if="activeFilters > 0" size="x-small" color="primary" class="ml-2">
                {{ activeFilters }}
              </v-chip>
            </v-btn>
          </template>

          <v-card min-width="300" class="pa-4" elevation="4" rounded="lg">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <v-icon icon="mdi-filter-variant" class="mr-2" color="primary"></v-icon>
              Filtrar reservas
            </h3>

            <v-select label="Tipo de servicio" :items="['Todos', 'Corte de cabello', 'Manicura', 'Pedicura', 'Masaje']"
              variant="outlined" rounded="lg" density="comfortable" hide-details class="mb-4"
              v-model="filtersModel.service"></v-select>

            <v-select label="Estado" :items="['Todos', 'Pendiente', 'Aprobada', 'Rechazada']" variant="outlined"
              rounded="lg" density="comfortable" hide-details class="mb-4" v-model="filtersModel.status"></v-select>

            <v-select label="Ordenar por" :items="['Más reciente', 'Más antiguo', 'Nombre cliente', 'Próxima cita']"
              variant="outlined" rounded="lg" density="comfortable" hide-details class="mb-4"
              v-model="filtersModel.sortBy"></v-select>

            <div class="d-flex justify-end mt-4">
              <v-btn color="secondary" variant="text" class="mr-2" @click="resetFilters">
                Reiniciar
              </v-btn>
              <v-btn color="primary" @click="applyFilters"> Aplicar </v-btn>
            </div>
          </v-card>
        </v-menu>

        <v-tooltip text="Aprobar todas las reservas pendientes">
          <template v-slot:activator="{ props }">
            <v-btn color="success" class="ml-2" variant="elevated" v-bind="props" prepend-icon="mdi-check-all"
              @click="$emit('approve-all')">
              Aprobar todas
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </div>

    <!-- Tarjetas de resumen (KPIs) -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" class="stats-card">
          <div class="stats-card-border"></div>
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="stats-label">Pendientes</p>
                <p class="stats-value">{{ pendingCount }}</p>
              </div>
              <v-avatar class="stats-icon pending-icon">
                <v-icon>mdi-clock-outline</v-icon>
              </v-avatar>
            </div>
            <div class="stats-trend">
              <span class="trend-indicator positive">+6%</span>
              <span class="trend-period">desde ayer</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" class="stats-card">
          <div class="stats-card-border"></div>
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="stats-label">Aprobadas hoy</p>
                <p class="stats-value">8</p>
              </div>
              <v-avatar class="stats-icon approved-icon">
                <v-icon>mdi-check-circle</v-icon>
              </v-avatar>
            </div>
            <div class="stats-trend">
              <span class="trend-indicator positive">+12%</span>
              <span class="trend-period">desde ayer</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" class="stats-card">
          <div class="stats-card-border"></div>
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="stats-label">Reservas totales</p>
                <p class="stats-value">124</p>
              </div>
              <v-avatar class="stats-icon total-icon">
                <v-icon>mdi-calendar</v-icon>
              </v-avatar>
            </div>
            <div class="stats-trend">
              <span class="trend-indicator positive">+5%</span>
              <span class="trend-period">este mes</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card elevation="0" class="stats-card">
          <div class="stats-card-border"></div>
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="stats-label">Tiempo promedio</p>
                <p class="stats-value">5.2h</p>
              </div>
              <v-avatar class="stats-icon time-icon">
                <v-icon>mdi-timer-outline</v-icon>
              </v-avatar>
            </div>
            <div class="stats-trend">
              <span class="trend-indicator negative">-2.3%</span>
              <span class="trend-period">esta semana</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FilterOptions } from '@/types/Reservation';

// Props
const props = defineProps<{
  pendingCount: number;
  loading: boolean;
  activeFilters: number;
  filters: FilterOptions;
}>();

// Emits
const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'approve-all'): void;
  (e: 'update:filters', value: FilterOptions): void;
}>();

// Modelo v-model para filtros
const filtersModel = computed({
  get: () => props.filters,
  set: value => emit('update:filters', value)
});

// Métodos para filtros
const resetFilters = () => {
  emit('update:filters', {
    service: 'Todos',
    status: 'Pendiente',
    sortBy: 'Más reciente'
  });
};

const applyFilters = () => {
  // Aquí podría ir alguna lógica adicional antes de cerrar el menú
};
</script>

<style scoped>
/* Tarjetas de estadísticas */
.stats-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  background-color: rgba(var(--v-theme-surface), 1);
}

.stats-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  border-color: rgba(var(--v-theme-primary), 0.15);
}

.stats-card-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.7), rgba(var(--v-theme-primary), 0.3));
}

.stats-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 8px;
}

.stats-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.stats-icon {
  width: 48px;
  height: 48px;
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgba(var(--v-theme-primary), 1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-trend {
  margin-top: 16px;
  display: flex;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.trend-indicator {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 4px;
  margin-right: 8px;
}

.trend-indicator.positive {
  background-color: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.trend-indicator.negative {
  background-color: rgba(var(--v-theme-error), 0.1);
  color: rgb(var(--v-theme-error));
}

.trend-period {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
</style>
