<template>
  <v-container class="payment-success-container">
    <!-- Loading State -->
    <div v-if="isProcessing" class="loading-section">
      <v-row justify="center" class="mb-4">
        <v-col cols="auto">
          <v-progress-circular
            indeterminate
            size="64"
            color="success"
            width="6"
          />
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center">
          <h2>Procesando tu pago...</h2>
          <p class="text-medium-emphasis">
            Estamos confirmando tu pago y actualizando tu reserva.
            Este proceso puede tomar unos segundos.
          </p>
        </v-col>
      </v-row>
    </div>

    <!-- Success State -->
    <div v-else-if="!hasError" class="success-section">
      <v-row justify="center" class="mb-6">
        <v-col cols="auto">
          <v-icon
            icon="mdi-check-circle"
            size="80"
            color="success"
            class="success-icon"
          />
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="success-card" elevation="3">
            <v-card-title class="text-center success-title">
              ¡Pago Completado Exitosamente!
            </v-card-title>

            <v-card-text>
              <div class="payment-details">
                <h3 class="mb-3">Detalles de tu Pago</h3>

                <v-row v-if="paymentDetails" class="mb-2">
                  <v-col cols="5">
                    <strong>ID de Reserva:</strong>
                  </v-col>
                  <v-col cols="7">
                    {{ paymentDetails.reservationId }}
                  </v-col>
                </v-row>

                <v-row v-if="paymentDetails" class="mb-2">
                  <v-col cols="5">
                    <strong>Monto Pagado:</strong>
                  </v-col>
                  <v-col cols="7">
                    {{ formatCurrency(paymentDetails.amount) }}
                  </v-col>
                </v-row>

                <v-row v-if="paymentDetails" class="mb-2">
                  <v-col cols="5">
                    <strong>Fecha de Pago:</strong>
                  </v-col>
                  <v-col cols="7">
                    {{ formatDate(paymentDetails.completedAt) }}
                  </v-col>
                </v-row>

                <v-row v-if="reservationDetails" class="mb-2">
                  <v-col cols="5">
                    <strong>Servicio:</strong>
                  </v-col>
                  <v-col cols="7">
                    {{ reservationDetails.serviceName }}
                  </v-col>
                </v-row>

                <v-divider class="my-4" />

                <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-4"
                >
                  <v-icon icon="mdi-email-outline" class="me-2" />
                  Se ha enviado una confirmación de pago a tu email
                </v-alert>

                <div class="next-steps">
                  <h4 class="mb-2">Próximos Pasos:</h4>
                  <ul class="next-steps-list">
                    <li>Recibirás un email de confirmación con todos los detalles</li>
                    <li>Nuestro equipo se pondrá en contacto contigo para coordinar el servicio</li>
                    <li>Mantén a la mano tu ID de reserva para cualquier consulta</li>
                  </ul>
                </div>
              </div>
            </v-card-text>

            <v-card-actions class="justify-center pa-4">
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                @click="goToHome"
                :prepend-icon="mdiHome"
              >
                Ir al Inicio
              </v-btn>

              <v-btn
                color="secondary"
                variant="outlined"
                size="large"
                @click="viewReservation"
                :prepend-icon="mdiEye"
                :disabled="!reservationDetails"
              >
                Ver Reserva
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Error State -->
    <div v-else class="error-section">
      <v-row justify="center" class="mb-6">
        <v-col cols="auto">
          <v-icon
            icon="mdi-alert-circle"
            size="80"
            color="error"
            class="error-icon"
          />
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="error-card" elevation="3">
            <v-card-title class="text-center error-title">
              Error al Procesar el Pago
            </v-card-title>

            <v-card-text>
              <v-alert type="error" class="mb-4">
                {{ errorMessage }}
              </v-alert>

              <p class="text-center mb-4">
                No te preocupes, tu pago puede haber sido procesado correctamente.
                Por favor, contacta con nuestro soporte para verificar el estado.
              </p>

              <div class="support-info text-center">
                <h4>Información de Soporte:</h4>
                <p>Email: soporte@tuempresa.com</p>
                <p>Teléfono: +34 900 123 456</p>
                <p class="text-caption">
                  Menciona tu ID de reserva: {{ route.query.reservation_id }}
                </p>
              </div>
            </v-card-text>

            <v-card-actions class="justify-center pa-4">
              <v-btn
                color="primary"
                variant="flat"
                size="large"
                @click="goToHome"
                :prepend-icon="mdiHome"
              >
                Ir al Inicio
              </v-btn>

              <v-btn
                color="warning"
                variant="outlined"
                size="large"
                @click="retryPaymentCheck"
                :loading="isRetrying"
                :prepend-icon="mdiRefresh"
              >
                Reintentar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaymentFlow } from '@/composables/usePaymentFlow'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { createDebugLogger } from '@/utils/debugHelpers'
import {
  mdiCheckCircle,
  mdiAlertCircle,
  mdiHome,
  mdiEye,
  mdiRefresh
} from '@mdi/js'

// ===================================================================
// COMPOSABLES & DEPENDENCIES
// ===================================================================

const route = useRoute()
const router = useRouter()
const paymentFlow = usePaymentFlow()
const errorHandler = useErrorHandler()
const logger = createDebugLogger('PaymentSuccessPage')

// ===================================================================
// REACTIVE STATE
// ===================================================================

const isProcessing = ref(true)
const isRetrying = ref(false)
const paymentDetails = ref<any>(null)
const reservationDetails = ref<any>(null)

// ===================================================================
// COMPUTED PROPERTIES
// ===================================================================

const hasError = computed(() =>
  !!paymentFlow.state.error || !!errorHandler.errors.value.length
)

const errorMessage = computed(() =>
  paymentFlow.state.error ||
  errorHandler.errors.value[0]?.message ||
  'Error desconocido al procesar el pago'
)

// ===================================================================
// METHODS
// ===================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const processPaymentSuccess = async () => {
  const sessionId = route.query.session_id as string
  const paymentId = route.query.payment_id as string
  const reservationId = route.query.reservation_id as string

  if (!sessionId && !paymentId) {
    errorHandler.addError(
      'Faltan parámetros de pago en la URL',
      'PaymentSuccess'
    )
    isProcessing.value = false
    return
  }

  try {
    logger.log('Processing payment success...', {
      sessionId,
      paymentId,
      reservationId
    })

    // 1. Verificar estado del pago
    if (paymentId) {
      const payment = await paymentFlow.checkPaymentStatus(paymentId)
      paymentDetails.value = payment
      logger.success('Payment verified successfully', payment)
    }

    // 2. Obtener detalles de la reserva (si tienes un ReservationService)
    if (reservationId) {
      // const reservation = await reservationService.getReservation(reservationId)
      // reservationDetails.value = reservation
      logger.log('Reservation details would be loaded here')
    }

    // 3. Enviar email de confirmación (opcional)
    // await emailService.sendPaymentConfirmation(...)

    logger.success('Payment success processing completed')

  } catch (error) {
    logger.error('Failed to process payment success', error)
    errorHandler.addError(
      error instanceof Error ? error.message : 'Error procesando el pago',
      'PaymentSuccess'
    )
  } finally {
    isProcessing.value = false
  }
}

const retryPaymentCheck = async () => {
  isRetrying.value = true
  errorHandler.clearAllErrors()
  paymentFlow.clearError()

  try {
    await processPaymentSuccess()
  } catch (error) {
    logger.error('Retry failed', error)
  } finally {
    isRetrying.value = false
  }
}

const goToHome = () => {
  router.push('/')
}

const viewReservation = () => {
  if (reservationDetails.value?.id) {
    router.push(`/reservations/${reservationDetails.value.id}`)
  }
}

// ===================================================================
// LIFECYCLE
// ===================================================================

onMounted(() => {
  logger.log('PaymentSuccessPage mounted', route.query)
  processPaymentSuccess()
})
</script>
