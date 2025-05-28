<template>
  <component :is="detailsComponent" :reservation="reservationData" />
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue';
import { ServiceType, ReservationService } from '@/services/ReservationServiceFactory';

// Importar componentes de detalles específicos
import AirportTransferConfirmation from '@/UI/components/suppliers/confirmation/AirportTransferConfirmation.vue';
// import BabySitterConfirmation from '@/UI/components/suppliers/confirmation/BabysitterConfirmation.vue';
import CustomDecorationConfirmation from '@/UI/components/suppliers/confirmation/CustomDecorationConfirmation.vue';
import DefaultConfirmation from '@/UI/components/suppliers/confirmation/DefaultConfirmation.vue';
// import GroceryShopingConfirmation from '@/UI/components/suppliers/confirmation/GroceryShopingConfirmation.vue';

// Mapeo de tipos de servicio a componentes de detalles
const SERVICE_DETAILS_COMPONENTS = {
  [ServiceType.AIRPORT_TRANSFER]: markRaw(AirportTransferConfirmation),
  // [ServiceType.BABYSITTER]: markRaw(BabySitterConfirmation),
  // [ServiceType.GROCERY_SHOPPING]: markRaw(GroceryShopingConfirmation),
  [ServiceType.CUSTOM_DECORATION]: markRaw(CustomDecorationConfirmation),
};

// Props
const props = defineProps<{
  reservation: any;
}>();

// Convertir reservation a objeto plano si es necesario
const reservationData = computed(() => {
  if (props.reservation && typeof props.reservation.toPlainObject === 'function') {
    return props.reservation.toPlainObject();
  }
  return props.reservation;
});

// Determinar qué componente de detalles utilizar
const detailsComponent = computed(() => {
  const serviceType = ReservationService.detectServiceType(reservationData.value);

  const component = SERVICE_DETAILS_COMPONENTS[serviceType];

  if (component) {
    return component;
  } else {
    console.warn(`Tipo de reserva no reconocido: ${serviceType}`, reservationData.value);
    return DefaultConfirmation;
  }
});
</script>
