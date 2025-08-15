// src/infra/payment/PaymentCaller.ts - ARCHIVO COMPLETO CON STRIPE
import {
  Timestamp,
  type Firestore,
  CollectionReference,
  type DocumentData,
  Query,
  QuerySnapshot,
  DocumentReference,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  DocumentSnapshot
} from 'firebase/firestore';
import type { ApiPayment } from './ApiPayment';

interface CreatePaymentData {
  reservationId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description: string;
  provider: string;
  expirationHours?: number;
  metadata?: Record<string, any>;
}

interface UpdatePaymentData {
  status?: string;
  paymentUrl?: string;
  providerPaymentId?: string;
  completedAt?: Timestamp;
  failureReason?: string;
  webhookData?: Record<string, any>;
}

export class PaymentCaller {
  private readonly COLLECTION_NAME = 'payments';
  private readonly stripeSecretKey: string;

  constructor(
    public readonly collection: (
      firestore: Firestore,
      path: string,
      ...pathSegments: string[]
    ) => CollectionReference<DocumentData>,
    public readonly getDocs: (query: Query<DocumentData>) => Promise<QuerySnapshot<DocumentData>>,
    public readonly db: Firestore,
    public readonly addDoc: (
      reference: CollectionReference<DocumentData>,
      data: DocumentData
    ) => Promise<DocumentReference<DocumentData>>,
    public readonly doc: (
      firestore: Firestore,
      path: string,
      ...pathSegments: string[]
    ) => DocumentReference<DocumentData>,
    public readonly getDoc: (
      reference: DocumentReference<DocumentData>
    ) => Promise<DocumentSnapshot<DocumentData>>,
    public readonly updateDoc: (
      reference: DocumentReference<DocumentData>,
      data: Partial<DocumentData>
    ) => Promise<void>,
    public readonly query: (
      query: Query<DocumentData>,
      ...queryConstraints: any[]
    ) => Query<DocumentData>,
    public readonly where: (fieldPath: string, opStr: any, value: any) => any,
    public readonly orderBy: (fieldPath: string, directionStr?: 'asc' | 'desc') => any
  ) {
    this.stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY || '';

    if (!this.stripeSecretKey) {
      console.warn('⚠️ Stripe secret key not configured');
    } else {
      console.log('✅ PaymentCaller initialized with Stripe integration');
    }
  }

  // ============================================================================
  // 💳 STRIPE INTEGRATION METHODS
  // ============================================================================

  async createPayment(data: CreatePaymentData): Promise<ApiPayment> {
    try {
      console.log(`💳 Creating payment with Stripe for reservation: ${data.reservationId}`);

      // 1. Create Stripe checkout session
      const stripeSession = await this.createStripeCheckoutSession(data);

      // 2. Prepare Firebase data
      const now = Timestamp.now();
      const expirationHours = data.expirationHours || 48;
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + expirationHours * 60 * 60 * 1000));

      const paymentData = {
        reservationId: data.reservationId,
        amount: data.amount,
        currency: data.currency,
        status: 'pending',
        provider: data.provider,
        paymentUrl: stripeSession.url,
        expiresAt: expiresAt,
        createdAt: now,
        updatedAt: now,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        description: data.description,
        metadata: {
          ...data.metadata,
          stripeSessionId: stripeSession.id
        },
        providerPaymentId: stripeSession.id
      };

      // 3. Save to Firebase
      const paymentsRef = this.collection(this.db, this.COLLECTION_NAME);
      const docRef = await this.addDoc(paymentsRef, paymentData);

      console.log(`✅ Payment created successfully: ${docRef.id}`);

      return {
        id: docRef.id,
        ...paymentData
      } as ApiPayment;
    } catch (error) {
      console.error('❌ Error creating payment:', error);
      throw error;
    }
  }

  private async createStripeCheckoutSession(data: CreatePaymentData): Promise<any> {
    try {
      const baseUrl = window.location.origin;

      const lineItems = [
        {
          price_data: {
            currency: data.currency.toLowerCase(),
            product_data: {
              name: data.description,
              description: `Reserva #${data.reservationId}`
            },
            unit_amount: data.amount * 100 // Stripe uses cents
          },
          quantity: 1
        }
      ];

      const sessionData = {
        mode: 'payment',
        line_items: lineItems,
        customer_email: data.customerEmail,
        metadata: {
          reservationId: data.reservationId,
          customerName: data.customerName,
          ...data.metadata
        },
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
        expires_at: Math.floor(Date.now() / 1000) + (data.expirationHours || 48) * 3600
      };

      const formData = new FormData();
      formData.append('mode', sessionData.mode);
      formData.append(
        'line_items[0][price_data][currency]',
        sessionData.line_items[0].price_data.currency
      );
      formData.append(
        'line_items[0][price_data][product_data][name]',
        sessionData.line_items[0].price_data.product_data.name
      );
      formData.append(
        'line_items[0][price_data][product_data][description]',
        sessionData.line_items[0].price_data.product_data.description
      );
      formData.append(
        'line_items[0][price_data][unit_amount]',
        sessionData.line_items[0].price_data.unit_amount.toString()
      );
      formData.append('line_items[0][quantity]', sessionData.line_items[0].quantity.toString());
      formData.append('customer_email', sessionData.customer_email);
      formData.append('success_url', sessionData.success_url);
      formData.append('cancel_url', sessionData.cancel_url);
      formData.append('expires_at', sessionData.expires_at.toString());

      Object.entries(sessionData.metadata).forEach(([key, value]) => {
        formData.append(`metadata[${key}]`, String(value));
      });

      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.stripeSecretKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Stripe API error: ${error.error?.message || 'Unknown error'}`);
      }

      const session = await response.json();

      console.log('✅ Stripe checkout session created:', {
        id: session.id,
        url: session.url,
        amount: session.amount_total
      });

      return session;
    } catch (error) {
      console.error('❌ Error creating Stripe checkout session:', error);
      throw error;
    }
  }

  async processStripeWebhook(event: any): Promise<void> {
    try {
      console.log(`🔄 Processing Stripe webhook: ${event.type}`);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handlePaymentCompleted(event.data.object);
          break;
        case 'checkout.session.expired':
          await this.handlePaymentExpired(event.data.object);
          break;
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      console.error('❌ Error processing Stripe webhook:', error);
      throw error;
    }
  }

  private async handlePaymentCompleted(session: any): Promise<void> {
    try {
      const reservationId = session.metadata.reservationId;
      const sessionId = session.id;

      console.log(`✅ Payment completed for reservation: ${reservationId}`);

      const paymentsRef = this.collection(this.db, this.COLLECTION_NAME);
      const q = this.query(paymentsRef, this.where('providerPaymentId', '==', sessionId));
      const querySnapshot = await this.getDocs(q);

      if (!querySnapshot.empty) {
        const paymentDoc = querySnapshot.docs[0];
        const paymentRef = this.doc(this.db, this.COLLECTION_NAME, paymentDoc.id);

        await this.updateDoc(paymentRef, {
          status: 'completed',
          completedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          webhookData: session
        });

        console.log(`✅ Payment ${paymentDoc.id} marked as completed`);
      } else {
        console.warn(`⚠️ Payment not found for session ID: ${sessionId}`);
      }
    } catch (error) {
      console.error('❌ Error handling payment completion:', error);
      throw error;
    }
  }

  private async handlePaymentExpired(session: any): Promise<void> {
    try {
      const sessionId = session.id;
      console.log(`⏰ Payment expired for session: ${sessionId}`);

      const paymentsRef = this.collection(this.db, this.COLLECTION_NAME);
      const q = this.query(paymentsRef, this.where('providerPaymentId', '==', sessionId));
      const querySnapshot = await this.getDocs(q);

      if (!querySnapshot.empty) {
        const paymentDoc = querySnapshot.docs[0];
        const paymentRef = this.doc(this.db, this.COLLECTION_NAME, paymentDoc.id);

        await this.updateDoc(paymentRef, {
          status: 'expired',
          updatedAt: Timestamp.now(),
          failureReason: 'Payment session expired'
        });

        console.log(`⏰ Payment ${paymentDoc.id} marked as expired`);
      }
    } catch (error) {
      console.error('❌ Error handling payment expiration:', error);
      throw error;
    }
  }

  // ============================================================================
  // 📁 EXISTING FIREBASE METHODS (UNCHANGED)
  // ============================================================================

  async getAllPayments(): Promise<ApiPayment[]> {
    try {
      const paymentsRef = this.collection(this.db, this.COLLECTION_NAME);
      const q = this.query(paymentsRef, this.orderBy('createdAt', 'desc'));
      const querySnapshot = await this.getDocs(q);

      return querySnapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data()
          }) as ApiPayment
      );
    } catch (error) {
      console.error('Error fetching all payments:', error);
      throw error;
    }
  }

  async getPaymentById(paymentId: string): Promise<ApiPayment | null> {
    try {
      const docRef = this.doc(this.db, this.COLLECTION_NAME, paymentId);
      const docSnap = await this.getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as ApiPayment;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching payment ${paymentId}:`, error);
      throw error;
    }
  }

  async getPaymentsByReservation(reservationId: string): Promise<ApiPayment[]> {
    try {
      const paymentsRef = this.collection(this.db, this.COLLECTION_NAME);
      const q = this.query(
        paymentsRef,
        this.where('reservationId', '==', reservationId),
        this.orderBy('createdAt', 'desc')
      );
      const querySnapshot = await this.getDocs(q);

      return querySnapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data()
          }) as ApiPayment
      );
    } catch (error) {
      console.error(`Error fetching payments for reservation ${reservationId}:`, error);
      throw error;
    }
  }

  async getPaymentsByStatus(status: string): Promise<ApiPayment[]> {
    try {
      const paymentsRef = this.collection(this.db, this.COLLECTION_NAME);
      const q = this.query(paymentsRef, this.where('status', '==', status));
      const querySnapshot = await this.getDocs(q);

      const payments = querySnapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data()
          }) as ApiPayment
      );

      return payments.sort((a, b) => {
        const dateA = a.createdAt.toDate().getTime();
        const dateB = b.createdAt.toDate().getTime();
        return dateB - dateA;
      });
    } catch (error) {
      console.error(`Error fetching payments by status ${status}:`, error);
      throw error;
    }
  }

  async getPaymentsByCustomer(customerEmail: string): Promise<ApiPayment[]> {
    try {
      const paymentsRef = this.collection(this.db, this.COLLECTION_NAME);
      const q = this.query(
        paymentsRef,
        this.where('customerEmail', '==', customerEmail),
        this.orderBy('createdAt', 'desc')
      );
      const querySnapshot = await this.getDocs(q);

      return querySnapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data()
          }) as ApiPayment
      );
    } catch (error) {
      console.error(`Error fetching payments for customer ${customerEmail}:`, error);
      throw error;
    }
  }

  async updatePayment(paymentId: string, updateData: UpdatePaymentData): Promise<ApiPayment> {
    try {
      const paymentRef = this.doc(this.db, this.COLLECTION_NAME, paymentId);

      const updatePayload = {
        ...updateData,
        updatedAt: Timestamp.now()
      };

      await this.updateDoc(paymentRef, updatePayload);

      const updatedDoc = await this.getDoc(paymentRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as ApiPayment;
    } catch (error) {
      console.error(`Error updating payment ${paymentId}:`, error);
      throw error;
    }
  }

  async updatePaymentStatus(
    paymentId: string,
    status: string,
    failureReason?: string
  ): Promise<ApiPayment> {
    try {
      const updateData: UpdatePaymentData = {
        status,
        updatedAt: Timestamp.now()
      };

      if (status === 'completed') {
        updateData.completedAt = Timestamp.now();
      }

      if (failureReason) {
        updateData.failureReason = failureReason;
      }

      return await this.updatePayment(paymentId, updateData);
    } catch (error) {
      console.error(`Error updating payment ${paymentId} status:`, error);
      throw error;
    }
  }

  async updatePaymentUrl(
    paymentId: string,
    paymentUrl: string,
    providerPaymentId?: string
  ): Promise<ApiPayment> {
    const updateData: UpdatePaymentData = {
      paymentUrl,
      providerPaymentId
    };

    return this.updatePayment(paymentId, updateData);
  }

  async getPaymentStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    expired: number;
    totalAmount: number;
    completedAmount: number;
  }> {
    try {
      const paymentsRef = this.collection(this.db, this.COLLECTION_NAME);
      const querySnapshot = await this.getDocs(paymentsRef);

      const stats = {
        total: 0,
        pending: 0,
        completed: 0,
        failed: 0,
        expired: 0,
        totalAmount: 0,
        completedAmount: 0
      };

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        stats.total++;
        stats.totalAmount += data.amount;

        switch (data.status) {
          case 'pending':
            stats.pending++;
            break;
          case 'completed':
            stats.completed++;
            stats.completedAmount += data.amount;
            break;
          case 'failed':
            stats.failed++;
            break;
          case 'expired':
            stats.expired++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }
}
