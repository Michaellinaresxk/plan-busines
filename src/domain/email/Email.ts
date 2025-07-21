import type { EmailProperties } from '@/types/properties';


class Email {
  private constructor(
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

  static fromProperties(properties: EmailProperties): Email {
    const {
      id,
      to,
      subject,
      templateType,
      status,
      sentAt,
      reservationId,
      messageId,
      error,
      deliveredAt,
      openedAt
    } = properties;

    return new Email(
      id,
      to,
      subject,
      templateType,
      status,
      sentAt,
      reservationId,
      messageId,
      error,
      deliveredAt,
      openedAt
    );
  }

}

export default Email;
