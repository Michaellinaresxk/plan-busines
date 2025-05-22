<template>
  <!-- <v-dialog v-model="show" max-width="850px" class="reservation-detail-dialog" persistent> -->
  <v-dialog max-width="850px" class="reservation-detail-dialog" persistent>
    <v-card class="rounded-lg">
      <v-toolbar :color="getServiceColor" class="rounded-t-lg">
        <v-toolbar-title class="text-white">
          Reservación #{{ reservation.id.slice(0, 8) }} - {{ reservation.serviceName }}
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

            <h3 class="text-subtitle-1 font-weight-bold mb-3">Historial de cliente</h3>

            <v-list lines="two">
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="info" size="36">
                    <v-icon icon="mdi-history" size="small"></v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>Reservas anteriores</v-list-item-title>
                <v-list-item-subtitle>
                  {{ reservation.previousReservations || 0 }} reservas completadas
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="info" size="36">
                    <v-icon icon="mdi-currency-usd" size="small"></v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>Valor promedio</v-list-item-title>
                <v-list-item-subtitle>
                  {{ reservation.averageSpending || '$0.00' }} por visita
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="info" size="36">
                    <v-icon icon="mdi-calendar-clock" size="small"></v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>Última visita</v-list-item-title>
                <v-list-item-subtitle>
                  {{ reservation.lastVisit || 'Primera visita' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>

          <!-- Columna derecha: Detalles de la reserva -->
          <v-col cols="12" md="7">
            <v-card variant="outlined" class="mb-4 rounded-lg">
              <v-card-item>
                <template v-slot:prepend>
                  <v-icon :icon="getServiceIcon" size="large" :color="getServiceColor"></v-icon>
                </template>
                <v-card-title>Detalles de la Reserva</v-card-title>
                <v-card-subtitle>{{ getReservationTypeName }}</v-card-subtitle>
              </v-card-item>

              <v-divider></v-divider>

              <v-card-text class="pt-4">
                <div class="d-flex align-center mb-4">
                  <v-chip :color="getServiceColor" variant="elevated" size="large" class="mr-2">
                    {{ reservation.serviceName }}
                  </v-chip>
                  <v-chip v-if="reservation.isPriority" color="error" size="small">
                    Prioritario
                  </v-chip>
                </div>

                <!-- Componente dinámico según el tipo de reservación -->
                <component :is="detailComponent" :reservation="reservation" class="reservation-details"></component>

                <v-alert v-if="reservation.notes" density="compact" type="info" variant="tonal" class="mt-3">
                  <p class="text-body-2 mb-1 font-weight-medium">Notas:</p>
                  <p class="text-body-2">{{ reservation.notes }}</p>
                </v-alert>
              </v-card-text>
            </v-card>

            <v-timeline density="compact" class="mb-0">
              <v-timeline-item dot-color="primary" size="small">
                <div class="text-subtitle-2 font-weight-medium">Solicitud recibida</div>
                <div class="text-caption">
                  {{ formatDateTime(reservation.createdAt) }}
                </div>
              </v-timeline-item>

              <v-timeline-item dot-color="warning" size="small">
                <div class="text-subtitle-2 font-weight-medium">Pendiente de aprobación</div>
                <div class="text-caption">
                  Esperando su revisión
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-6">
        <v-btn prepend-icon="mdi-calendar-edit" color="info" variant="text" class="mr-2">
          Modificar
        </v-btn>
        <v-btn prepend-icon="mdi-email" color="secondary" variant="text">
          Contactar cliente
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="outlined" class="mr-2" @click="showRejectDialog = true" :loading="rejectLoading">
          Rechazar
        </v-btn>
        <v-btn color="success" @click="showApproveDialog = true" :loading="approveLoading">
          Aprobar reserva
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
import { ref, computed } from 'vue';


// Props
const props = defineProps<{
  show: boolean;
  reservation,
}>();

// Eventos
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'approve', id: string): void;
  (e: 'reject', id: string): void;
}>();

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

// Mapeo de tipos de servicio a nombres legibles
const serviceTypeNames = {
  'airportTransfer': 'Transferencia Aeroportuaria',
  'babysitter': 'Servicio de Niñera',
  'customDecoration': 'Decoraciones Personalizadas',
  'grocery': 'Compras de Supermercado',
  'yoga': 'Sesión de Yoga',
  'chef': 'Chef Privado',
  'default': 'Servicio Estándar'
};

// Obtener color basado en la categoría del servicio
const getServiceColor = computed(() => {
  return categoryColors[props.reservation.serviceCategory as keyof typeof categoryColors] || 'primary';
});

// Obtener color para el avatar
const getAvatarColor = computed(() => {
  const color = getServiceColor.value;
  return `${color}-lighten-1`;
});

// Obtener icono basado en el tipo de servicio
const getServiceIcon = computed(() => {
  const type = getReservationType(props.reservation.serviceId);
  return serviceIcons[type as keyof typeof serviceIcons] || serviceIcons.default;
});

// Obtener nombre legible del tipo de servicio
const getReservationTypeName = computed(() => {
  const type = getReservationType(props.reservation.serviceId);
  return serviceTypeNames[type as keyof typeof serviceTypeNames] || serviceTypeNames.default;
});

// Determinar qué componente de detalle utilizar
const detailComponent = computed(() => {
  if (isAirportTransferReservation(props.reservation)) {
    return AirportTransferDetails;
  } else if (isBabysitterReservation(props.reservation)) {
    return BabysitterDetails;
  } else if (isCustomDecorationReservation(props.reservation)) {
    return CustomDecorationDetails;
  } else if (isGroceryReservation(props.reservation)) {
    return GroceryDetails;
  } else if (isYogaReservation(props.reservation)) {
    return YogaDetails;
  } else if (isChefReservation(props.reservation)) {
    return ChefDetails;
  } else {
    return DefaultReservationDetails;
  }
});

// Métodos
function close() {
  emit('close');
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

function formatDateTime(date: Date): string {
  if (!date) return '';

  try {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return String(date);
  }
}

async function approveReservation() {
  approveLoading.value = true;

  try {
    // Aquí podrías agregar código para enviar mensajes por email si sendApprovalEmail está activo
    emit('approve', props.reservation.id);
    showApproveDialog.value = false;
  } finally {
    approveLoading.value = false;
  }
}

async function rejectReservation() {
  if (!rejectMessage.trim()) return;

  rejectLoading.value = true;

  try {
    // Aquí podrías agregar código para enviar mensajes por email si sendRejectEmail está activo
    emit('reject', props.reservation.id);
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
