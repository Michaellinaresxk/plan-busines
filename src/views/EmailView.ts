import type Email from '@/domain/email/Email';

export class EmailView {
  constructor(
    public readonly id: string,
    public readonly to: string,
    public readonly subject: string,
    public readonly templateType: string,
    public readonly status: string,
    public readonly sentAt: Date,
    public readonly reservationId?: string,
    public readonly messageId?: string,
    public readonly error?: string,
    public readonly deliveredAt?: Date,
    public readonly openedAt?: Date
  ) {}

  static fromDomain(email: Email): EmailView {
    return new EmailView(
      email.id,
      email.to,
      email.subject,
      email.templateType,
      email.status,
      email.sentAt,
      email.reservationId,
      email.messageId,
      email.error,
      email.deliveredAt,
      email.openedAt
    );
  }

}
