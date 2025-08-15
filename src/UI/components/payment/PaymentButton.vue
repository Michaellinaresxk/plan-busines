<template>
  <div class="payment-button-container">
    <!-- Loading State -->
    <v-btn
      v-if="paymentFlow.state.isCreating"
      loading
      disabled
      color="primary"
      size="large"
      class="payment-btn"
    >
      Creando enlace de pago...
    </v-btn>

    <!-- Ready to Create Payment -->
    <v-btn
      v-else-if="paymentFlow.canCreatePayment"
      @click="handleCreatePayment"
      color="primary"
      size="large"
      class="payment-btn"
      :prepend-icon="mdiCreditCard"
    >
      Enviar Enlace de Pago
    </v-btn>

    <!-- Payment Link Ready -->
    <div v-else-if="paymentFlow.isReady" class="payment-ready">
      <v-btn
        @click="handleSendEmail"
        color="success"
        size="large"
        class="payment-btn"
        :loading="emailSender.isSending"
        :prepend-icon="mdiEmail"
      >
        {{ emailSender.isSending ? 'Enviando...' : 'Enviar Email con Pago' }}
      </v-btn>

      <v-chip class="mt-2" color="success" variant="tonal">
        Enlace de pago creado ✓
      </v-chip>
    </div>

    <!-- Error State -->
    <v-alert
      v-if="paymentFlow.hasError || emailSender.error"
      type="error"
      class="mt-3"
      closable
      @click:close="clearErrors"
    >
      {{ paymentFlow.state.error || emailSender.error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { mdiCreditCard, mdiEmail } from '@mdi/js'
import { usePaymentFlow } from '@/composables/usePaymentFlow'
import { useEmailSender } from '@/composables/useEmailSender'

interface Props {
  reservationId: string
  amount: number
  customerEmail: string
  customerName: string
  description: string
  serviceDetails: any // Your service-specific data
}

const props = defineProps<Props>()

const paymentFlow = usePaymentFlow()
const emailSender = useEmailSender()

const handleCreatePayment = async () => {
  try {
    await paymentFlow.createPaymentLink(
      props.reservationId,
      props.amount,
      props.customerEmail,
      props.customerName,
      props.description
    )
  } catch (error) {
    // Error is already handled in composable
    console.error('Payment creation failed:', error)
  }
}

const handleSendEmail = async () => {
  if (!paymentFlow.state.paymentUrl) {
    console.error('No payment URL available')
    return
  }

  const emailData = {
    clientName: props.customerName,
    clientEmail: props.customerEmail,
    reservationId: props.reservationId,
    serviceName: props.description,
    serviceDetails: props.serviceDetails,
    paymentLink: paymentFlow.state.paymentUrl, // ✅ Include payment link
    companyName: 'Your Company'
  }

  try {
    await emailSender.sendPaymentEmail(emailData)
  } catch (error) {
    console.error('Email sending failed:', error)
  }
}

const clearErrors = () => {
  paymentFlow.clearError()
  emailSender.clearError()
}
</script>
