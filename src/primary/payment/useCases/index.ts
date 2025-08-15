import { PaymentResource } from '@/infra/payment/PaymentResource';
import { CreatePaymentLinkUseCase } from './CreatePaymentLinkUseCase';
import { GetPaymentByIdUseCase } from './GetPaymentByIdUseCase.ts';
import { GetPaymentsByReservationUseCase } from './GetPaymentsByReservationUseCase';
import { GetAllPaymentsUseCase } from './GetAllPaymentsUseCase';
import { UpdatePaymentStatusUseCase } from './UpdatePaymentStatusUseCase';
import { UpdatePaymentUrlUseCase } from './UpdatePaymentUrlUseCase';
import { GetPaymentStatsUseCase } from './GetPaymentStatsUseCase';
import type { PaymentProvider, PaymentStatus } from '@/domain/payment/Payment';

export class PaymentService {
  // Use Cases
  private createPaymentUseCase: CreatePaymentLinkUseCase;
  private getPaymentByIdUseCase: GetPaymentByIdUseCase;
  private getPaymentsByReservationUseCase: GetPaymentsByReservationUseCase;
  private getAllPaymentsUseCase: GetAllPaymentsUseCase;
  private updatePaymentStatusUseCase: UpdatePaymentStatusUseCase;
  private updatePaymentUrlUseCase: UpdatePaymentUrlUseCase;
  private getPaymentStatsUseCase: GetPaymentStatsUseCase;

  constructor(private readonly paymentResource: PaymentResource) {
    // Inicializar todos los use cases
    this.createPaymentUseCase = new CreatePaymentLinkUseCase(paymentResource);
    this.getPaymentByIdUseCase = new GetPaymentByIdUseCase(paymentResource);
    this.getPaymentsByReservationUseCase = new GetPaymentsByReservationUseCase(paymentResource);
    this.getAllPaymentsUseCase = new GetAllPaymentsUseCase(paymentResource);
    this.updatePaymentStatusUseCase = new UpdatePaymentStatusUseCase(paymentResource);
    this.updatePaymentUrlUseCase = new UpdatePaymentUrlUseCase(paymentResource);
    this.getPaymentStatsUseCase = new GetPaymentStatsUseCase(paymentResource);
  }

  // Métodos públicos que delegan a los use cases
  async createPayment(
    reservationId: string,
    amount: number,
    currency: string,
    customerEmail: string,
    customerName: string,
    description: string,
    provider: PaymentProvider,
    expirationHours?: number,
    metadata?: Record<string, any>
  ) {
    return await this.createPaymentUseCase.execute(
      reservationId,
      amount,
      currency,
      customerEmail,
      customerName,
      description,
      provider,
      expirationHours,
      metadata
    );
  }

  async getPaymentById(paymentId: string) {
    return await this.getPaymentByIdUseCase.execute(paymentId);
  }

  async getPaymentsByReservation(reservationId: string) {
    return await this.getPaymentsByReservationUseCase.execute(reservationId);
  }

  async getAllPayments() {
    return await this.getAllPaymentsUseCase.execute();
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    return await this.updatePaymentStatusUseCase.execute(paymentId, status);
  }

  async updatePaymentUrl(paymentId: string, paymentUrl: string, providerPaymentId?: string) {
    return await this.updatePaymentUrlUseCase.execute(paymentId, paymentUrl, providerPaymentId);
  }

  async getPaymentStats() {
    return await this.getPaymentStatsUseCase.execute();
  }

  async markExpiredPayments() {
    return await this.paymentResource.markExpiredPayments();
  }
}
