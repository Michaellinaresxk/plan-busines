import type { InjectionKey } from 'vue';
import { EmailResource } from '@/infra/email/EmailResource';
import { EmailService } from '@/primary/email/useCase';

const emailResource = new EmailResource();

const emailService = new EmailService(emailResource);

const emailServiceKey = Symbol('EmailService') as InjectionKey<EmailService>;

export { emailService, emailServiceKey };
