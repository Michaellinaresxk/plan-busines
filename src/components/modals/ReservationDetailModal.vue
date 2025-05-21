<template>
  <v-dialog v-model="show" max-width="850px" class="reservation-detail-dialog">
    <v-card class="rounded-lg">
      <v-toolbar color="primary" class="rounded-t-lg">
        <v-toolbar-title class="text-white">
          Detalle de Reserva #{{ reservation.id }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
      </v-toolbar>

      <v-card-text class="pa-6">
        <v-row>
          <!-- Columna izquierda: Información del cliente -->
          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-4">
              <v-avatar color="primary" size="64" class="mr-4">
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
                  <v-icon icon="mdi-email-outline" color="primary"></v-icon>
                </template>
                <v-list-item-title>{{ reservation.email }}</v-list-item-title>
                <v-list-item-subtitle>Email</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-phone" color="primary"></v-icon>
                </template>
                <v-list-item-title>{{ reservation.phone }}</v-list-item-title>
                <v-list-item-subtitle>Teléfono</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="reservation.address">
                <template v-slot:prepend>
                  <v-icon icon="mdi-map-marker-outline" color="primary"></v-icon>
                </template>
                <v-list-item-title>{{ reservation.address }}</v-list-item-title>
                <v-list-item-subtitle>Dirección</v-list-item-subtitle>
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
                  {{ reservation.previousReservations }} reservas completadas
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
                  {{ reservation.averageSpending }} € por visita
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
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="mb-4 rounded-lg">
              <v-card-item>
                <template v-slot:prepend>
                  <v-icon icon="mdi-calendar-check" size="large" color="primary"></v-icon>
                </template>
                <v-card-title>Detalles de la Reserva</v-card-title>
              </v-card-item>

              <v-divider></v-divider>

              <v-card-text class="pt-4">
                <div class="d-flex align-center mb-4">
                  <v-chip :color="getServiceColor(reservation.service)" variant="elevated" size="large" class="mr-2">
                    {{ reservation.service }}
                  </v-chip>
                  <v-chip v-if="reservation.isPriority" color="error" size="small">
                    Prioritario
                  </v-chip>
                </div>

                <v-row>
                  <v-col cols="6">
                    <div class="mb-3">
                      <div class="text-caption text-medium-emphasis">Fecha</div>
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-calendar" size="small" color="primary" class="mr-1"></v-icon>
                        <span class="text-subtitle-2 font-weight-medium">{{
                          reservation.date
                          }}</span>
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="6">
                    <div class="mb-3">
                      <div class="text-caption text-medium-emphasis">Hora</div>
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-clock-outline" size="small" color="primary" class="mr-1"></v-icon>
                        <span class="text-subtitle-2 font-weight-medium">{{
                          reservation.time
                          }}</span>
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="6">
                    <div class="mb-3">
                      <div class="text-caption text-medium-emphasis">Duración</div>
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-timer-outline" size="small" color="primary" class="mr-1"></v-icon>
                        <span class="text-subtitle-2 font-weight-medium">{{
                          reservation.duration || '1 hora'
                          }}</span>
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="6">
                    <div class="mb-3">
                      <div class="text-caption text-medium-emphasis">Precio</div>
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-cash-multiple" size="small" color="primary" class="mr-1"></v-icon>
                        <span class="text-subtitle-2 font-weight-medium">{{
                          reservation.price || '35 €'
                          }}</span>
                      </div>
                    </div>
                  </v-col>

                  <v-col cols="12" v-if="reservation.staff">
                    <div class="mb-3">
                      <div class="text-caption text-medium-emphasis">Profesional asignado</div>
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-account" size="small" color="primary" class="mr-1"></v-icon>
                        <span class="text-subtitle-2 font-weight-medium">{{
                          reservation.staff
                          }}</span>
                      </div>
                    </div>
                  </v-col>
                </v-row>

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
                  {{ reservation.createdAt || '23/05/2025, 08:32 AM' }}
                </div>
              </v-timeline-item>

              <v-timeline-item dot-color="warning" size="small">
                <div class="text-subtitle-2 font-weight-medium">Pendiente de aprobación</div>
                <div class="text-caption">Esperando su revisión</div>
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
        <v-btn prepend-icon="mdi-email" color="secondary" variant="text"> Contactar cliente </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="outlined" class="mr-2" @click="showRejectDialog = true">
          Rechazar
        </v-btn>
        <v-btn color="success" @click="showApproveDialog = true"> Aprobar reserva </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Diálogos de Aprobación y Rechazo -->
  <v-dialog v-model="showApproveDialog" max-width="500px">
    <v-card>
      <v-card-title class="text-h5 pt-5 pb-2 px-5">
        <v-icon icon="mdi-check-circle" color="success" class="mr-2"></v-icon>
        Aprobar Reserva
      </v-card-title>

      <v-card-text class="px-5 pt-2">
        <p class="mb-4">
          Estás a punto de aprobar la reserva de <strong>{{ reservation.clientName }}</strong> para
          el servicio <strong>{{ reservation.service }}</strong> el día
          <strong>{{ reservation.date }}</strong> a las <strong>{{ reservation.time }}</strong>.
        </p>

        <v-text-field label="Mensaje para el cliente (opcional)"
          placeholder="Añade un mensaje que se enviará junto con la confirmación" variant="outlined" rows="3"
          auto-grow></v-text-field>

        <v-checkbox label="Enviar email de confirmación al cliente" hide-details color="success"
          model-value="true"></v-checkbox>
      </v-card-text>

      <v-card-actions class="px-5 pb-5">
        <v-btn color="secondary" variant="text" @click="showApproveDialog = false">Cancelar</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" @click="approveReservation">
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
        <p class="mb-4">
          Estás a punto de rechazar la reserva de <strong>{{ reservation.clientName }}</strong> para
          el servicio <strong>{{ reservation.service }}</strong> el día
          <strong>{{ reservation.date }}</strong>.
        </p>

        <v-select label="Motivo del rechazo" :items="[
          'Horario no disponible',
          'Servicio no disponible en la fecha solicitada',
          'Personal no disponible',
          'Solicitud duplicada',
          'Otro motivo'
        ]" variant="outlined" class="mb-4"></v-select>

        <v-textarea label="Mensaje para el cliente" placeholder="Explica al cliente el motivo del rechazo"
          variant="outlined" rows="3" auto-grow required></v-textarea>

        <v-checkbox label="Enviar email de notificación al cliente" hide-details color="error"
          model-value="true"></v-checkbox>
      </v-card-text>

      <v-card-actions class="px-5 pb-5">
        <v-btn color="secondary" variant="text" @click="showRejectDialog = false">Cancelar</v-btn>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="rejectReservation">
          <v-icon icon="mdi-close" class="mr-2"></v-icon>
          Confirmar rechazo
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { getInitials, getServiceColor } from '@/utils/reservationUtils';

// Props
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  reservation: {

    required: true,
    default: () => ({
      id: 0,
      clientName: '',
      email: '',
      phone: '',
      service: '',
      date: '',
      time: '',
      notes: '',
      isPriority: false,
      isNewClient: false,
      previousReservations: 0,
      averageSpending: '0',
      lastVisit: null,
      address: '',
      staff: '',
      duration: '',
      price: '',
      timeAgo: ''
    })
  }
});

// Emits
const emit = defineEmits(['close', 'approve', 'reject']);

// Estado
const showApproveDialog = ref(false);
const showRejectDialog = ref(false);

// Métodos
const close = () => {
  emit('close');
};

const approveReservation = () => {
  showApproveDialog.value = false;
  emit('approve', props.reservation.id);
  close();
};

const rejectReservation = () => {
  showRejectDialog.value = false;
  emit('reject', props.reservation.id);
  close();
};
</script>

<style scoped>
.reservation-detail-dialog {
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}
</style>
