// src/components/reservation/ReservationCardFactory.vue - Updated
<template>
  <component :is="cardComponent" :reservation="reservationData" :onApprove="onApprove" :onReject="onReject"
    @view-details="$emit('view-details', reservation)" />
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue';
import { ServiceType, ReservationService } from '@/services/ReservationServiceFactory';

// Importar componentes de tarjetas
import AirportTransfer from '@/UI/components/cards/AirportTransfer.vue';
import BabySitter from '@/UI/components/cards/BabySitter.vue';
import CustomDecorationCard from '@/UI/components/cards/CustomDecorationCard.vue';
import GroceryShopping from '@/UI/components/cards/GroceryShopping.vue';
import DefaultReservationCard from '@/UI/components/cards/DefaultReservationCard.vue';

// Mapeo de tipos de servicio a componentes
const SERVICE_COMPONENTS = {
  [ServiceType.AIRPORT_TRANSFER]: markRaw(AirportTransfer),
  [ServiceType.BABYSITTER]: markRaw(BabySitter),
  [ServiceType.CUSTOM_DECORATION]: markRaw(CustomDecorationCard),
  [ServiceType.GROCERY_SHOPPING]: markRaw(GroceryShopping),
};

// Propiedades - Puede recibir ReservationView o un objeto plano
const props = defineProps<{
  reservation: any;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
}>();

// Eventos
const emit = defineEmits<{
  (e: 'view-details', reservation: any): void;
}>();

// Convertir reservation a objeto plano si es una instancia de ReservationView
const reservationData = computed(() => {
  if (props.reservation && typeof props.reservation.toPlainObject === 'function') {
    // Es una instancia de ReservationView
    return props.reservation.toPlainObject();
  }
  // Ya es un objeto plano
  return props.reservation;
});

// Determinar qué componente utilizar según el tipo de reservación
const cardComponent = computed(() => {
  const serviceType = ReservationService.detectServiceType(reservationData.value);

  // Buscar el componente correspondiente en el mapeo
  const component = SERVICE_COMPONENTS[serviceType];

  if (component) {
    return component;
  } else {
    // Registrar advertencia para tipos desconocidos
    console.warn(`Tipo de reserva no reconocido: ${serviceType}`, reservationData.value);

    // Devolver el componente por defecto para tipos desconocidos
    return DefaultReservationCard;
  }
});
</script>
