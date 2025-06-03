// src/services/ReservationService.ts - Enhanced
import type { InjectionKey } from 'vue';
import { ReservationResource } from '@/infra/reservation/RervationResource';
import { ReservationService } from '@/primary/reservation/useCases/index';
import { ReservationCaller } from '@/infra/reservation/ReservationCaller';
import { ReservationSupplierService } from '@/services/ReservationSupplierService';
import { WhatsappService } from '@/services/whatsapp/WhatsappService';
import { supplierService } from '@/services/SupplierService'; // Import existing supplier service
import { db } from '@/infra/api/FirebaseConfig';

// Crear la cadena de dependencias existente
const reservationCaller = new ReservationCaller(db);
const reservationResource = new ReservationResource(reservationCaller);
const reservationService = new ReservationService(reservationResource);

// ✅ Crear instancia de WhatsApp service
const whatsappService = new WhatsappService({
  confirmationBaseUrl: window.location.origin
});

// ✅ Crear instancia del servicio integrador
const reservationSupplierService = new ReservationSupplierService(
  reservationService,
  supplierService,
  whatsappService
  // Note: Calendar service can be added here when available
);

// Claves de inyección para Vue
const reservationServiceKey = Symbol() as InjectionKey<ReservationService>;
const whatsappServiceKey = Symbol() as InjectionKey<WhatsappService>;
const reservationSupplierServiceKey = Symbol() as InjectionKey<ReservationSupplierService>;

export {
  reservationService,
  reservationServiceKey,
  whatsappService,
  whatsappServiceKey,
  reservationSupplierService,
  reservationSupplierServiceKey
};
