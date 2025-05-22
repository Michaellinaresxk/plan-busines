// src/components/reservation/ReservationCardFactory.vue
<template>
  <component :is="cardComponent" :reservation="reservation" :onApprove="onApprove" :onReject="onReject"
    @view-details="$emit('view-details', reservation)" />
</template>

<script setup lang="ts">
import { computed, markRaw } from 'vue';
import { ServiceType, ReservationService } from '@/services/ReservationService';

// Importar componentes de tarjetas
import AirportTransfer from '@/UI/components/cards/AirportTransfer.vue';
import BabySitter from '@/UI/components/cards/BabySitter.vue';
import CustomDecorationCard from '@/UI/components/cards/CustomDecorationCard.vue';
import GroceryShopping from '@/UI/components/cards/GroceryShopping.vue';
import BaseReservationCard from '@/UI/components/cards/BaseReservationCard.vue';

// Mapeo de tipos de servicio a componentes
// Esto hace más fácil añadir nuevos tipos de servicio en el futuro
const SERVICE_COMPONENTS = {
  [ServiceType.AIRPORT_TRANSFER]: markRaw(AirportTransfer),
  [ServiceType.BABYSITTER]: markRaw(BabySitter),
  [ServiceType.CUSTOM_DECORATION]: markRaw(CustomDecorationCard),
  [ServiceType.GROCERY_SHOPPING]: markRaw(GroceryShopping),
  // Añadir aquí nuevos componentes cuando estén disponibles
};

// Propiedades
const props = defineProps<{
  reservation: any;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
}>();

// Eventos
const emit = defineEmits<{
  (e: 'view-details', reservation: any): void;
}>();

// Determinar qué componente utilizar según el tipo de reservación
const cardComponent = computed(() => {
  const serviceType = ReservationService.detectServiceType(props.reservation);

  // Buscar el componente correspondiente en el mapeo
  const component = SERVICE_COMPONENTS[serviceType];

  if (component) {
    return component;
  } else {
    // Registrar advertencia para tipos desconocidos
    console.warn(`Tipo de reserva no reconocido: ${serviceType}`, props.reservation);

    // Devolver el componente base para tipos desconocidos
    return BaseReservationCard;
  }
});
</script>
