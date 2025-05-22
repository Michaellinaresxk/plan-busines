<template>
  <v-layout class="dashboard-layout">
    <!-- Barra lateral (sidebar) -->
    <DashboardSidebar v-model:drawer="drawer" v-model:rail="rail" :mdAndUp="mdAndUp" :pendingCount="pendingCount" />

    <!-- Barra superior (app bar) -->
    <DashboardHeader :mdAndUp="mdAndUp" v-model:drawer="drawer" v-model:rail="rail" @toggle-theme="toggleTheme" />

    <!-- Contenido principal -->
    <v-main>
      <v-container fluid class="py-6 px-4 md:px-6">
        <!-- Encabezado y KPIs -->
        <DashboardSummary :pendingCount="pendingCount" :loading="loading" @refresh="refreshData"
          @approve-all="approveAllReservations" :activeFilters="activeFilters" v-model:filters="filters" />

        <ReservationsList :pendingReservations="pendingReservations" :loading="loading" @refresh="refreshData"
          @approve="openApproveDialog" @reject="openRejectDialog" :pendingCount="pendingCount"
          v-model:filterChips="filterChips" v-model:page="page" />

        <!-- Lista de reservas -->
      </v-container>
    </v-main>

    <!-- Diálogos de confirmación -->
    <ReservationApproveDialog v-model="showApproveDialog" :reservation="selectedReservation"
      :processingAction="processingAction" @confirm="approveReservation" />

    <ReservationRejectDialog v-model="showRejectDialog" :reservation="selectedReservation"
      :processingAction="processingAction" @confirm="rejectReservation" />

    <!-- Notificaciones -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" location="bottom end" rounded="pill" elevation="4"
      timeout="3000">
      <div class="d-flex align-center">
        <v-icon :icon="snackbarIcon" class="mr-2" size="small"></v-icon>
        {{ snackbarText }}
      </div>
      <template v-slot:actions>
        <v-btn icon="mdi-close" variant="text" @click="snackbar = false"></v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useDisplay } from 'vuetify';
import DashboardSidebar from '@/UI/components/dashboard/DashboardSidebar.vue';
import DashboardHeader from '@/UI/components/dashboard/DashboardHeader.vue';
import DashboardSummary from '@/UI/components/dashboard/DashboardSummary.vue';
import ReservationsList from '@/UI/components/reservation/ReservationsList.vue';
import ReservationApproveDialog from '@/UI/components/modals/ReservationApproveDialog.vue';
import ReservationRejectDialog from '@/UI/components/modals/ReservationRejectDialog.vue';
// import { useReservations } from '@/composables/useReservations';
// import { useNotifications } from '@/composables/useNotifications';
import type { Reservation } from '@/types/Reservation';

// Responsive helpers
const { mdAndUp } = useDisplay();

// Estado del drawer y rail (sidebar)
const drawer = ref(true);
const rail = ref(false);

// Estado de la UI
const page = ref(1);
const loading = ref(false);
const processingAction = ref(false);
const filterChips = ref([]);

// Diálogos
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const selectedReservation = ref<Reservation | null>(null);

// Composables para manejar lógica de dominio
// const {
//   pendingReservations,
//   pendingCount,
//   filters,
//   activeFilters,
//   approveReservation: approveReservationAction,
//   rejectReservation: rejectReservationAction,
//   approveAllReservations: approveAllAction,
//   refreshReservations
// } = useReservations();

// const {
//   snackbar,
//   snackbarText,
//   snackbarColor,
//   snackbarIcon,
//   showSuccessNotification,
//   showErrorNotification,
//   showInfoNotification
// } = useNotifications();

// Métodos para los diálogos
const openApproveDialog = (reservation: Reservation) => {
  selectedReservation.value = reservation;
  showApproveDialog.value = true;
};

const openRejectDialog = (reservation: Reservation) => {
  selectedReservation.value = reservation;
  showRejectDialog.value = true;
};

// Acciones para las reservas
// const approveReservation = () => {
//   if (!selectedReservation.value) return;

//   processingAction.value = true;

//   approveReservationAction(selectedReservation.value.id)
//     .then(() => {
//       showApproveDialog.value = false;
//       showSuccessNotification('Reserva aprobada con éxito');
//     })
//     .finally(() => {
//       processingAction.value = false;
//     });
// };

// const rejectReservation = () => {
//   if (!selectedReservation.value) return;

//   processingAction.value = true;

//   rejectReservationAction(selectedReservation.value.id)
//     .then(() => {
//       showRejectDialog.value = false;
//       showErrorNotification('Reserva rechazada');
//     })
//     .finally(() => {
//       processingAction.value = false;
//     });
// };

// const approveAllReservations = () => {
//   loading.value = true;

//   approveAllAction()
//     .then(() => {
//       showSuccessNotification('Todas las reservas han sido aprobadas', 'mdi-check-all');
//     })
//     .finally(() => {
//       loading.value = false;
//     });
// };

// Métodos para filtros
// const refreshData = () => {
//   loading.value = true;

//   refreshReservations()
//     .then(() => {
//       showInfoNotification('Datos actualizados correctamente', 'mdi-refresh');
//     })
//     .finally(() => {
//       loading.value = false;
//     });
// };

// Cambiar tema oscuro/claro
const toggleTheme = () => {
  // Aquí irían las acciones para cambiar el tema global
  // que podrían venir de un composable useTheme() si se necesita
};

// Lifecycle hooks
onMounted(() => {
  // Ajustamos el rail basado en el tamaño de pantalla
  rail.value = !mdAndUp.value;

  // Carga inicial de datos
  // refreshData();
});

// Observamos cambios en el tamaño de pantalla
watch(mdAndUp, (newValue) => {
  if (!newValue) {
    rail.value = false;
    drawer.value = false;
  } else {
    drawer.value = true;
  }
});
</script>
