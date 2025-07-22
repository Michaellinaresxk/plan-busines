import type { EmailResult, ReservationEmailData } from '@/types/email';
import Email from './Email';


export default interface EmailRepository {
  sendReservationConfirmation(data: ReservationEmailData): Promise<EmailResult>;
  getEmailById(id: string): Promise<Email | null>;
  saveEmail(email: Email): Promise<Email>;
  updateEmailStatus(id: string, status: string, messageId?: string): Promise<Email>;
}
