<template>
  <v-dialog v-model="dialogModel" max-width="850px" class="reservation-detail-dialog" persistent>
    <v-card class="rounded-lg">
      <v-toolbar :color="getServiceColor" class="rounded-t-lg">
        <v-toolbar-title class="text-white">
          Reservación #{{ reservation?.bookingId?.slice(0, 8) || reservation?.id?.slice(0, 8) }} - {{
            reservation?.serviceName }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
      </v-toolbar>

      <v-card-text class="pa-6">
        <v-row>
          <!-- Columna izquierda: Información del cliente -->
          <v-col cols="12" md="5">
            <div class="d-flex align-center mb-4">
              <v-avatar :color="getAvatarColor" size="64" class="mr-4">
                {{ getInitials(reservation.clientName) }}
              </v-avatar>
              <div>
                <h2 class="text-h5 font-weight-bold mb-1">{{ reservation.clientName }}</h2>
                <p class="text-body-2 mb-0">
                  <v-icon icon="mdi-account-outline" size="small" class="mr-1"></v-icon>
                  Cliente {{ reservation.isNewClient ? 'nuevo' : 'recurrente' }}
                </p>
              </div>
            </div>

            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-email-outline" :color="getServiceColor"></v-icon>
                </template>
                <v-list-item-title>{{ reservation.clientEmail }}</v-list-item-title>
                <v-list-item-subtitle>Email</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-phone" :color="getServiceColor"></v-icon>
                </template>
                <v-list-item-title>{{ reservation.clientPhone }}</v-list-item-title>
                <v-list-item-subtitle>Teléfono</v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <v-divider class="my-4"></v-divider>



          </v-col>

          <!-- Columna derecha: Detalles de la reserva -->
          <v-col cols="12" md="7">
            <!-- Detalles compactos del servicio -->
            <v-card variant="outlined" class="mb-4 rounded-lg">
              <v-card-item>
                <template v-slot:prepend>
                  <v-icon :icon="getServiceIcon" size="large" :color="getServiceColor"></v-icon>
                </template>
                <v-card-title>{{ reservation.serviceName }}</v-card-title>
                <v-card-subtitle>
                  {{ reservation.date }} - {{ reservation.time }} | ${{ reservation.totalPrice }}
                </v-card-subtitle>
              </v-card-item>
            </v-card>

            <!-- Componente de proveedores filtrados -->
            <ReservationSuppliersSection :reservation="reservation" @supplier-selected="handleSupplierSelected" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-6">
        <v-btn color="error" variant="outlined" class="mr-2" @click="showRejectDialog = true" :loading="rejectLoading">
          Rechazar
        </v-btn>

        <v-spacer></v-spacer>
        <v-btn prepend-icon="mdi-email" color="secondary" variant="text">
          Contactar cliente
        </v-btn>

      </v-card-actions>
    </v-card>

    <!-- Diálogos de Aprobación y Rechazo -->
    <v-dialog v-model="showApproveDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 pt-5 pb-2 px-5">
          <v-icon icon="mdi-check-circle" color="success" class="mr-2"></v-icon>
          Aprobar Reserva
        </v-card-title>

        <v-card-text class="px-5 pt-2">
          <p class="mb-4">Estás a punto de aprobar la reserva de <strong>{{ reservation.clientName }}</strong> para el
            servicio <strong>{{ reservation.serviceName }}</strong>.</p>

          <v-text-field v-model="approvalMessage" label="Mensaje para el cliente (opcional)"
            placeholder="Añade un mensaje que se enviará junto con la confirmación" variant="outlined" rows="3"
            auto-grow></v-text-field>

          <v-checkbox v-model="sendApprovalEmail" label="Enviar email de confirmación al cliente" hide-details
            color="success"></v-checkbox>
        </v-card-text>

        <v-card-actions class="px-5 pb-5">
          <v-btn color="secondary" variant="text" @click="showApproveDialog = false">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="approveReservation" :loading="approveLoading">
            <v-icon icon="mdi-check" class="mr-2"></v-icon>
            Confirmar aprobación
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showRejectDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 pt-5 pb-2 px-5">
          <v-icon icon="mdi-close-circle" color="error" class="mr-2"></v-icon>
          Rechazar Reserva
        </v-card-title>

        <v-card-text class="px-5 pt-2">
          <p class="mb-4">Estás a punto de rechazar la reserva de <strong>{{ reservation.clientName }}</strong> para el
            servicio <strong>{{ reservation.serviceName }}</strong>.</p>

          <v-select v-model="rejectReason" label="Motivo del rechazo" :items="rejectReasons" variant="outlined"
            class="mb-4"></v-select>

          <v-textarea v-model="rejectMessage" label="Mensaje para el cliente"
            placeholder="Explica al cliente el motivo del rechazo" variant="outlined" rows="3" auto-grow
            :rules="[v => !!v || 'Este campo es requerido']"></v-textarea>

          <v-checkbox v-model="sendRejectEmail" label="Enviar email de notificación al cliente" hide-details
            color="error"></v-checkbox>
        </v-card-text>

        <v-card-actions class="px-5 pb-5">
          <v-btn color="secondary" variant="text" @click="showRejectDialog = false">Cancelar</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="rejectReservation" :loading="rejectLoading" :disabled="!rejectMessage.trim()">
            <v-icon icon="mdi-close" class="mr-2"></v-icon>
            Confirmar rechazo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import ReservationSuppliersSection from '@/UI/components/reservation/ReservationSuppliersSection.vue';
import type { SupplierView } from '@/views/SupplierView';

// Props
const props = defineProps<{
  show: boolean;
  reservation: any;
}>();

// Eventos
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'approve', id: string): void;
  (e: 'reject', id: string): void;
}>();

// Computed para el v-model del dialog
const dialogModel = computed({
  get: () => props.show,
  set: (value: boolean) => {
    if (!value) {
      close();
    }
  }
});

// Estado
const approveLoading = ref(false);
const rejectLoading = ref(false);
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);
const approvalMessage = ref('');
const rejectMessage = ref('');
const rejectReason = ref('');
const sendApprovalEmail = ref(true);
const sendRejectEmail = ref(true);

// Opciones para el motivo de rechazo
const rejectReasons = [
  'Horario no disponible',
  'Servicio no disponible en la fecha solicitada',
  'Personal no disponible',
  'Solicitud duplicada',
  'Otro motivo'
];

// Mapeo de categorías a colores
const categoryColors = {
  'food-drinks': 'purple',
  'wellness': 'teal',
  'transportation': 'blue',
  'tours': 'amber',
  'leisure': 'indigo',
  'water-activities': 'light-blue'
};

// Mapeo de tipos de servicio a iconos
const serviceIcons = {
  'airportTransfer': 'mdi-airplane',
  'babysitter': 'mdi-baby',
  'customDecoration': 'mdi-party-popper',
  'grocery': 'mdi-cart',
  'yoga': 'mdi-yoga',
  'chef': 'mdi-chef-hat',
  'default': 'mdi-calendar-check'
};

// Watch para debug
watch(() => props.show, (newValue) => {
  console.log('🔍 ReservationDetailModal: show prop changed to:', newValue);
});

watch(() => props.reservation, (newValue) => {
  console.log('🔍 ReservationDetailModal: reservation prop changed to:', newValue);
});

// Computed properties
const getServiceColor = computed(() => {
  return categoryColors[props.reservation?.serviceCategory as keyof typeof categoryColors] || 'primary';
});

const getAvatarColor = computed(() => {
  const color = getServiceColor.value;
  return `${color}-lighten-1`;
});

const getServiceIcon = computed(() => {
  // Simplificado por ahora
  return serviceIcons.default;
});

// Métodos
function close() {
  console.log('🔍 ReservationDetailModal: close() called');
  emit('close');
}

function handleSupplierSelected(supplier: SupplierView) {
  console.log('🎯 Supplier selected for reservation:', {
    reservation: props.reservation?.bookingId || props.reservation?.id,
    supplier: supplier.name,
    service: supplier.service
  });

  // Por ahora solo loggeamos, en el siguiente paso implementaremos el envío
  alert(`Proveedor seleccionado: ${supplier.name}\nEmail: ${supplier.email}\nTeléfono: ${supplier.phone}`);
}

function getInitials(name: string): string {
  if (!name) return 'NN';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

async function approveReservation() {
  approveLoading.value = true;

  try {
    const reservationId = props.reservation?.bookingId || props.reservation?.id;
    emit('approve', reservationId);
    showApproveDialog.value = false;
  } finally {
    approveLoading.value = false;
  }
}

async function rejectReservation() {
  if (!rejectMessage.trim()) return;

  rejectLoading.value = true;

  try {
    const reservationId = props.reservation?.bookingId || props.reservation?.id;
    emit('reject', reservationId);
    showRejectDialog.value = false;
  } finally {
    rejectLoading.value = false;
  }
}
</script>

<style scoped>
.reservation-detail-dialog {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.reservation-details {
  margin-top: 16px;
}
</style>
