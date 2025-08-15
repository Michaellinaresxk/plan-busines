// src/services/PaymentService.ts - FACTORY COMPLETA CON DEPENDENCIAS
import type { InjectionKey } from 'vue';
import { PaymentResource } from '../infra/payment/PaymentResource';
import { PaymentService } from '../primary/payment/useCases/index';
import { PaymentCaller } from '../infra/payment/PaymentCaller';
import { db } from '@/infra/api/FirebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  type CollectionReference,
  type DocumentData,
  type Query,
  type QuerySnapshot,
  type Firestore,
  type DocumentReference,
  type DocumentSnapshot
} from 'firebase/firestore';

console.log('🔧 Initializing PaymentService with complete Stripe + Firebase integration...');

// ✅ Crear PaymentCaller con TODAS las dependencias necesarias
const paymentCaller = new PaymentCaller(
  // Firebase dependencies for PaymentCaller constructor
  collection, // Para crear referencias de colección
  getDocs, // Para ejecutar queries
  db,
  addDoc,
  doc, // Para crear referencias de documento
  getDoc, // Para obtener documentos
  updateDoc, // Para actualizar documentos
  query, // Para crear queries
  where, // Para filtros where
  orderBy // Para ordenamiento
);

console.log('✅ PaymentCaller initialized with:', {
  hasFirestore: !!db,
  hasStripeConfig: !!import.meta.env.VITE_STRIPE_SECRET_KEY,
  allDependenciesProvided: true
});

// ✅ Crear PaymentResource con el PaymentCaller
const paymentResource = new PaymentResource(paymentCaller);

// ✅ Crear PaymentService con el PaymentResource
const paymentService = new PaymentService(paymentResource);

// ✅ Crear injection key para Vue DI
const paymentServiceKey = Symbol('PaymentService') as InjectionKey<PaymentService>;

console.log('✅ PaymentService factory initialization completed:', {
  paymentCaller: !!paymentCaller,
  paymentResource: !!paymentResource,
  paymentService: !!paymentService,
  injectionKey: !!paymentServiceKey,
  ready: true
});

// ✅ Verificar configuración al inicializar
(async () => {
  try {
    // Verificar configuración de Stripe
    const stripeConfigured = !!import.meta.env.VITE_STRIPE_SECRET_KEY;

    console.log('🔍 PaymentService Configuration Check:');
    console.log('=====================================');
    console.log(
      'Stripe Secret Key:',
      stripeConfigured ? '✅ Configured' : '❌ Missing VITE_STRIPE_SECRET_KEY'
    );
    console.log('Firebase Database:', !!db ? '✅ Connected' : '❌ Not connected');
    console.log('Payment Service:', !!paymentService ? '✅ Ready' : '❌ Not ready');

    if (!stripeConfigured) {
      console.warn('⚠️ Stripe configuration missing. Add VITE_STRIPE_SECRET_KEY to .env');
      console.warn('⚠️ Payment creation will fail until Stripe is configured');
    } else {
      console.log('✅ PaymentService ready for Stripe integration!');
    }

    // Test basic functionality (optional)
    if (import.meta.env.DEV) {
      console.log('🧪 Development mode: PaymentService ready for testing');
    }
  } catch (error) {
    console.error('❌ PaymentService initialization error:', error);
  }
})();

export { paymentService, paymentServiceKey };
