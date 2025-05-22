import type { InjectionKey } from 'vue';
import { ReservationResource } from '@/infra/reservation/RervationResource';
import { ReservationService } from '@/primary/reservation/useCases/index';
import { ReservationCaller } from '@/infra/reservation/ReservationCaller';
import { db } from '@/infra/api/FirebaseConfig';

// Crear la cadena de dependencias
const reservationCaller = new ReservationCaller(db);
const reservationResource = new ReservationResource(reservationCaller);
const reservationService = new ReservationService(reservationResource);

// Clave de inyección para Vue
const reservationServiceKey = Symbol() as InjectionKey<ReservationService>;

export { reservationService, reservationServiceKey };
