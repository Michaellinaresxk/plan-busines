<template>
  <!-- Encabezado de la sección -->
  <div class="d-flex justify-space-between align-center mb-4">
    <h2 class="text-h5 font-weight-bold d-flex align-center">
      <v-icon icon="mdi-clipboard-text-clock" color="primary" class="mr-2 mt-10"></v-icon>
      Solicitudes pendientes
      <v-chip color="primary" size="small" class="ml-2">{{ pendingCount }}</v-chip>
    </h2>

    <v-chip-group v-model="filterChipsModel" column multiple>
      <v-chip filter variant="elevated" color="primary" label size="small"> Hoy </v-chip>
      <v-chip filter variant="elevated" color="primary" label size="small"> Prioritarios </v-chip>
      <v-chip filter variant="elevated" color="primary" label size="small"> Recientes </v-chip>
    </v-chip-group>
  </div>

  <!-- Estado de vacío - Cuando no hay reservas -->
  <v-card v-if="pendingReservations.length === 0" class="mb-6 pa-8 d-flex flex-column align-center justify-center"
    elevation="0" rounded="lg" border>
    <v-avatar color="primary" class="mb-4" size="64">
      <v-icon icon="mdi-calendar-check" size="36" color="white"></v-icon>
    </v-avatar>
    <h3 class="text-h5 mb-2 text-center">No hay reservas pendientes</h3>
    <p class="text-medium-emphasis text-body-1 text-center mb-6">
      Todas las reservas han sido procesadas. ¡Buen trabajo!
    </p>
    <v-btn color="primary" prepend-icon="mdi-refresh" @click="$emit('refresh')" :loading="loading">
      Actualizar datos
    </v-btn>
  </v-card>

  <!-- Vista de lista - Cuando hay reservas -->
  <v-row v-if="pendingReservations.length > 0">
    <v-col cols="12" sm="6" md="4" v-for="reservation in pendingReservations" :key="reservation.id">
      <ReservationCard :reservation="reservation" @approve="$emit('approve', reservation)"
        @reject="$emit('reject', reservation)" />
    </v-col>
  </v-row>

  <!-- Paginación -->
  <div v-if="pendingReservations.length > 0" class="d-flex justify-center mt-6">
    <v-pagination v-model="pageModel" :length="3" rounded="circle" :disabled="loading" color="primary"
      :active-color="loading ? 'grey' : 'primary'"></v-pagination>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ReservationCard from './ReservationCard.vue';
import type { Reservation } from '@/types/Reservation';

// Props
const props = defineProps<{
  pendingReservations: Reservation[];
  pendingCount: number;
  loading: boolean;
  filterChips: unknown[];
  page: number;
}>();

// Emits
const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'approve', reservation: Reservation): void;
  (e: 'reject', reservation: Reservation): void;
  (e: 'update:filterChips', value: unknown[]): void;
  (e: 'update:page', value: number): void;
}>();

// Modelos v-model
const filterChipsModel = computed({
  get: () => props.filterChips,
  set: value => emit('update:filterChips', value)
});

const pageModel = computed({
  get: () => props.page,
  set: value => emit('update:page', value)
});
</script>

<style scoped>
/* Puedes agregar estilos específicos si se necesitan */
</style>
