import type { InjectionKey } from 'vue';
import { EmailCaller } from '@/infra/email/EmailCaller';
import { EmailResource } from '@/infra/email/EmailResource';
import { EmailService } from '@/primary/email/useCase';


const emailCaller = new EmailCaller();
const emailResource = new EmailResource(emailCaller);
const emailService = new EmailService(emailResource);


const emailServiceKey = Symbol() as InjectionKey<EmailService>;
export { emailService, emailServiceKey };
