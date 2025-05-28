// src/services/WhatsappService.ts
export interface ReservationSummary {
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  totalPrice: number;
  location?: string;
  notes?: string;
}

export interface SupplierInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
}

export interface WhatsAppConfig {
  baseUrl: string;
  confirmationBaseUrl: string;
}

export class WhatsappService {
  private config: WhatsAppConfig;

  constructor(config?: Partial<WhatsAppConfig>) {
    this.config = {
      baseUrl: 'https://wa.me/',
      confirmationBaseUrl: window.location.origin,
      ...config
    };
  }

  /**
   * 🎯 MÉTODO PRINCIPAL: Envía solicitud de confirmación al proveedor
   */
  async sendSupplierServiceRequest(
    supplier: SupplierInfo,
    reservation: ReservationSummary
  ): Promise<{ success: boolean; confirmationUrl: string; error?: string }> {
    try {
      // Validar datos requeridos
      const validation = this.validateRequestData(supplier, reservation);
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }

      // Generar URL de confirmación
      const confirmationUrl = this.generateConfirmationUrl(reservation.bookingId, supplier.id);

      // Formatear número de teléfono
      const formattedPhone = this.formatPhoneNumber(supplier.phone);

      // Generar mensaje personalizado
      const message = this.generateConfirmationMessage(supplier, reservation, confirmationUrl);

      // Enviar mensaje por WhatsApp
      this.sendWhatsAppMessage(formattedPhone, message);

      console.log('📱 WhatsApp message sent successfully', {
        supplier: supplier.name,
        phone: formattedPhone,
        bookingId: reservation.bookingId,
        confirmationUrl
      });

      return {
        success: true,
        confirmationUrl
      };
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      return {
        success: false,
        confirmationUrl: '',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Genera URL de confirmación dinámica
   */
  private generateConfirmationUrl(bookingId: string, supplierId: string): string {
    const params = new URLSearchParams({
      booking: bookingId,
      supplier: supplierId,
      action: 'confirm'
    });

    return `${this.config.confirmationBaseUrl}/supplier-confirmation?${params.toString()}`;
  }

  /**
   * Genera mensaje personalizado para WhatsApp
   */
  private generateConfirmationMessage(
    supplier: SupplierInfo,
    reservation: ReservationSummary,
    confirmationUrl: string
  ): string {
    const locationText = reservation.location || 'Por confirmar con el cliente';
    const notesText = reservation.notes ? `\n📝 *Notas:* ${reservation.notes}` : '';

    return `
🔔 *SOLICITUD DE SERVICIO*

Hola *${supplier.name}*,

Tenemos un cliente que necesita tu servicio:

📋 *DETALLES DE LA RESERVA:*
🏷️ *Servicio:* ${reservation.serviceName}
📅 *Fecha:* ${reservation.date}
⏰ *Hora:* ${reservation.time}
👤 *Cliente:* ${reservation.clientName}
📞 *Teléfono Cliente:* ${reservation.clientPhone}
📍 *Ubicación:* ${locationText}
💰 *Total:* $${reservation.totalPrice}${notesText}

❓ *¿PUEDES REALIZAR ESTE SERVICIO?*

👆 *HAZ CLIC AQUÍ PARA CONFIRMAR:*
${confirmationUrl}

En el enlace podrás:
✅ Ver información completa de la reserva
✅ Confirmar si puedes realizar el servicio
❌ Rechazar si no estás disponible
💬 Agregar comentarios adicionales

⏰ *Por favor responde en las próximas 24 horas*

Si tienes alguna pregunta, responde a este mensaje.

_Plan-Business_
    `.trim();
  }

  /**
   * Envía recordatorio al proveedor
   */
  async sendSupplierReminder(
    supplier: SupplierInfo,
    reservation: Pick<
      ReservationSummary,
      'bookingId' | 'serviceName' | 'date' | 'time' | 'clientName' | 'totalPrice'
    >,
    hoursLeft: number = 12
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const confirmationUrl = this.generateConfirmationUrl(reservation.bookingId, supplier.id);
      const formattedPhone = this.formatPhoneNumber(supplier.phone);

      const message = `
⏰ *RECORDATORIO URGENTE*

Hola *${supplier.name}*,

Aún no has confirmado esta solicitud de servicio:

🏷️ *${reservation.serviceName}*
📅 ${reservation.date} a las ${reservation.time}
👤 Cliente: ${reservation.clientName}
💰 $${reservation.totalPrice}

⚠️ *Te quedan solo ${hoursLeft} horas para confirmar*

👆 *CONFIRMA AQUÍ:*
${confirmationUrl}

Si no puedes realizar este servicio, por favor confirma para que podamos asignarlo a otro proveedor.

_Plan-Business_
      `.trim();

      this.sendWhatsAppMessage(formattedPhone, message);

      return { success: true };
    } catch (error) {
      console.error('❌ Error sending reminder:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Validar datos de la solicitud
   */
  private validateRequestData(
    supplier: SupplierInfo,
    reservation: ReservationSummary
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar proveedor
    if (!supplier.id) errors.push('ID del proveedor requerido');
    if (!supplier.name) errors.push('Nombre del proveedor requerido');
    if (!supplier.phone) errors.push('Teléfono del proveedor requerido');

    // Validar reserva
    if (!reservation.bookingId) errors.push('ID de reserva requerido');
    if (!reservation.serviceName) errors.push('Nombre del servicio requerido');
    if (!reservation.date) errors.push('Fecha de reserva requerida');
    if (!reservation.clientName) errors.push('Nombre del cliente requerido');

    // Validar formato de teléfono
    if (supplier.phone && !this.isValidPhoneNumber(supplier.phone)) {
      errors.push('Formato de teléfono del proveedor inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatear número de teléfono para República Dominicana
   */
  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    // Para República Dominicana - Código país: +1
    if (cleaned.length === 10) {
      return `1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return cleaned;
    } else if (cleaned.length === 7) {
      return `1809${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Validar formato de número de teléfono
   */
  private isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 11;
  }

  /**
   * Enviar mensaje por WhatsApp
   */
  private sendWhatsAppMessage(phone: string, message: string): void {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `${this.config.baseUrl}${phone}?text=${encodedMessage}`;

    console.log('📱 Opening WhatsApp URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Obtener URL de WhatsApp sin abrir (útil para debugging)
   */
  generateWhatsAppUrl(phone: string, message: string): string {
    const cleanPhone = this.formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    return `${this.config.baseUrl}${cleanPhone}?text=${encodedMessage}`;
  }
}
