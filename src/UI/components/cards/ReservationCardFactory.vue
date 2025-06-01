<template>
  <component :is="cardComponent" :reservation="reservationData" :on-approve="handleApproveAction"
    :on-reject="handleRejectAction" @view-details="handleViewDetails" @approve="handleApprove" @reject="handleReject" />
</template>

<script setup lang="ts">
import { computed, markRaw, type Component } from 'vue';
import { ServiceType, ReservationService } from '@/services/ReservationServiceFactory';
import type { ReservationView } from '@/types/reservations';

// Importar componentes de tarjetas
import AirportTransfer from '@/UI/components/cards/AirportTransfer.vue';
import BabySitter from '@/UI/components/cards/BabySitter.vue';
import CustomDecorationCard from '@/UI/components/cards/CustomDecorationCard.vue';
import GroceryShopping from '@/UI/components/cards/GroceryShopping.vue';
import DefaultReservationCard from '@/UI/components/cards/DefaultReservationCard.vue';

// Tipos
interface PlainReservation {
  bookingId?: string;
  id?: string;
  [key: string]: any;
}

type ReservationInput = ReservationView | PlainReservation;

interface Props {
  reservation: ReservationInput;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string) => Promise<boolean>;
}

interface Emits {
  'view-details': [reservation: ReservationInput];
  'approve': [id: string, reservation: ReservationInput];
  'reject': [id: string, reservation: ReservationInput];
}

// Props y eventos tipados
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Mapeo de tipos de servicio a componentes con mejor tipado
const SERVICE_COMPONENTS: Record<ServiceType, Component> = {
  [ServiceType.AIRPORT_TRANSFER]: markRaw(AirportTransfer),
  [ServiceType.BABYSITTER]: markRaw(BabySitter),
  [ServiceType.CUSTOM_DECORATION]: markRaw(CustomDecorationCard),
  [ServiceType.GROCERY_SHOPPING]: markRaw(GroceryShopping),
} as const;

// Utilitades
const isReservationView = (reservation: any): reservation is ReservationView => {
  return reservation && typeof reservation.toPlainObject === 'function';
};

const getReservationId = (reservation: PlainReservation): string => {
  return reservation.bookingId || reservation.id || '';
};

// Computed properties
const reservationData = computed((): PlainReservation => {
  if (isReservationView(props.reservation)) {
    return props.reservation.toPlainObject();
  }
  return props.reservation as PlainReservation;
});

const cardComponent = computed((): Component => {
  try {
    const serviceType = ReservationService.detectServiceType(reservationData.value);
    const component = SERVICE_COMPONENTS[serviceType];

    if (!component) {
      console.warn(`Tipo de reserva no reconocido: ${serviceType}`, {
        reservation: reservationData.value,
        availableTypes: Object.keys(SERVICE_COMPONENTS)
      });
      return markRaw(DefaultReservationCard);
    }

    return component;
  } catch (error) {
    console.error('Error detectando tipo de servicio:', error, reservationData.value);
    return markRaw(DefaultReservationCard);
  }
});

// Handlers con manejo de errores mejorado
const handleApproveAction = async (id: string): Promise<boolean> => {
  try {
    const result = await props.onApprove(id);
    if (result) {
      console.log(`✅ Reserva ${id} aprobada exitosamente`);
    }
    return result;
  } catch (error) {
    console.error(`❌ Error aprobando reserva ${id}:`, error);
    return false;
  }
};

const handleRejectAction = async (id: string): Promise<boolean> => {
  try {
    const result = await props.onReject(id);
    if (result) {
      console.log(`❌ Reserva ${id} rechazada exitosamente`);
    }
    return result;
  } catch (error) {
    console.error(`❌ Error rechazando reserva ${id}:`, error);
    return false;
  }
};

const handleApprove = (): void => {
  try {
    const id = getReservationId(reservationData.value);
    if (!id) {
      console.warn('⚠️ No se pudo obtener ID de la reserva para aprobar');
      return;
    }
    emit('approve', id, props.reservation);
  } catch (error) {
    console.error('Error en handleApprove:', error);
  }
};

const handleReject = (): void => {
  try {
    const id = getReservationId(reservationData.value);
    if (!id) {
      console.warn('⚠️ No se pudo obtener ID de la reserva para rechazar');
      return;
    }
    emit('reject', id, props.reservation);
  } catch (error) {
    console.error('Error en handleReject:', error);
  }
};

const handleViewDetails = (): void => {
  try {
    console.log('🔍 ReservationCardFactory: Visualizando detalles de reserva:', {
      id: getReservationId(reservationData.value),
      type: ReservationService.detectServiceType(reservationData.value)
    });
    emit('view-details', props.reservation);
  } catch (error) {
    console.error('Error en handleViewDetails:', error);
  }
};
</script>
