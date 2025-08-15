<template>
  <v-container class="payment-cancel-container">
    <v-row justify="center" class="mb-6">
      <v-col cols="auto">
        <v-icon
          icon="mdi-cancel"
          size="80"
          color="warning"
          class="cancel-icon"
        />
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="cancel-card" elevation="3">
          <v-card-title class="text-center cancel-title">
            Pago Cancelado
          </v-card-title>

          <v-card-text>
            <v-alert type="warning" class="mb-4">
              Tu pago ha sido cancelado y no se ha realizado ningún cargo.
            </v-alert>

            <div class="cancel-info text-center">
              <p class="mb-4">
                No se preocupe, su reserva sigue siendo válida.
                Puede intentar realizar el pago nuevamente cuando esté listo.
              </p>

              <div v-if="route.query.reservation_id" class="reservation-info">
                <h4>Información de tu Reserva:</h4>
                <p>
                  <strong>ID de Reserva:</strong>
                  {{ route.query.reservation_id }}
                </p>
                <p class="text-caption">
                  Guarda este ID para futuras referencias
                </p>
              </div>

              <v-divider class="my-4" />

              <div class="next-steps">
                <h4 class="mb-2">¿Qué puedes hacer ahora?</h4>
                <ul class="next-steps-list">
                  <li>Intentar el pago nuevamente</li>
                  <li>Contactar con nuestro soporte si necesitas ayuda</li>
                  <li>Revisar los detalles de tu reserva</li>
                </ul>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="justify-center pa-4">
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              @click="retryPayment"
              :prepend-icon="mdiCreditCard"
            >
              Intentar Pago Nuevamente
            </v-btn>

            <v-btn
              color="secondary"
              variant="outlined"
              size="large"
              @click="goToHome"
              :prepend-icon="mdiHome"
            >
              Ir al Inicio
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { createDebugLogger } from '@/utils/debugHelpers'
import {
  mdiCancel,
  mdiCreditCard,
  mdiHome
} from '@mdi/js'

const route = useRoute()
const router = useRouter()
const logger = createDebugLogger('PaymentCancelPage')

const retryPayment = () => {
  const reservationId = route.query.reservation_id
  if (reservationId) {
    // Navigate back to reservation with payment option
    router.push(`/reservations/${reservationId}/payment`)
  } else {
    router.push('/reservations')
  }
}

const goToHome = () => {
  router.push('/')
}

// Log cancellation for analytics
logger.log('Payment cancelled', {
  reservationId: route.query.reservation_id,
  sessionId: route.query.session_id,
  timestamp: new Date().toISOString()
})
</script>
