// src/infra/email/EmailTemplateEngine.ts - ACTUALIZADO CON BOTÓN DE PAGO
import type { ReservationEmailData } from '@/types/email';

export class EmailTemplateEngineEmbedded {
  private templateHTML: string;

  constructor() {
    console.log('🎨 EmailTemplateEngine initialized - using embedded template with payment button');
    this.templateHTML = this.getEmbeddedTemplate();

    console.log('✅ Embedded template loaded with payment features:', {
      length: this.templateHTML.length,
      hasContent: this.templateHTML.includes('<html'),
      hasVariables: this.templateHTML.includes('{{clientName}}'),
      hasPaymentSection: this.templateHTML.includes('payment-section')
    });
  }

  /**
   * 🎨 Template HTML completo con botón de pago
   */
  private getEmbeddedTemplate(): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Reserva - Plan Business</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #2c3e50;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px 0;
            }

            .email-wrapper {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 40px 20px;
            }

            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
            }

            .header {
                background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: float 6s ease-in-out infinite;
            }

            @keyframes float {
                0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
                50% { transform: translate(-50%, -50%) rotate(180deg); }
            }

            .header h1 {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                position: relative;
                z-index: 2;
            }

            .header p {
                font-size: 16px;
                opacity: 0.9;
                position: relative;
                z-index: 2;
            }

            .content {
                padding: 40px 30px;
            }

            .greeting {
                font-size: 18px;
                margin-bottom: 24px;
                color: #1e293b;
            }

            .greeting strong {
                color: #2196F3;
            }

            .reservation-card {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 24px;
                margin: 24px 0;
                position: relative;
                overflow: hidden;
            }

            .reservation-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #2196F3, #1976D2);
            }

            .card-title {
                font-size: 18px;
                font-weight: 600;
                color: #1e293b;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
            }

            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding: 12px 0;
                border-bottom: 1px solid #e2e8f0;
            }

            .detail-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }

            .detail-label {
                font-weight: 600;
                color: #475569;
                font-size: 14px;
            }

            .detail-value {
                font-weight: 500;
                color: #1e293b;
                font-size: 14px;
                text-align: right;
            }

            /* ✅ NUEVA SECCIÓN DE PAGO */
            .payment-section {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 2px solid #22c55e;
                border-radius: 16px;
                padding: 32px;
                margin: 32px 0;
                text-align: center;
                position: relative;
                overflow: hidden;
            }

            .payment-section::before {
                content: '💳';
                position: absolute;
                top: -10px;
                right: -10px;
                font-size: 60px;
                opacity: 0.1;
                transform: rotate(15deg);
            }

            .payment-title {
                font-size: 24px;
                font-weight: 700;
                color: #15803d;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .payment-subtitle {
                font-size: 16px;
                color: #166534;
                margin-bottom: 24px;
                opacity: 0.9;
            }

            .price-display {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
            }

            .price {
                font-size: 36px;
                font-weight: 700;
                color: #15803d;
                margin-bottom: 4px;
            }

            .price-label {
                font-size: 14px;
                color: #16a34a;
                font-weight: 500;
            }

            .payment-button {
                display: inline-block;
                background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                color: white;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 18px;
                transition: all 0.3s ease;
                box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
                position: relative;
                overflow: hidden;
                margin: 16px 0;
            }

            .payment-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 24px rgba(34, 197, 94, 0.4);
            }

            .payment-button::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }

            .payment-button:hover::before {
                left: 100%;
            }

            .payment-note {
                font-size: 14px;
                color: #16a34a;
                margin-top: 16px;
                padding: 12px;
                background: rgba(34, 197, 94, 0.1);
                border-radius: 8px;
            }

            .security-badges {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 16px;
                margin-top: 20px;
                padding: 16px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 8px;
            }

            .security-badge {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #166534;
                font-weight: 500;
            }

            /* ✅ SUPPLIER INFO STYLING */
            .supplier-section {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 1px solid #f59e0b;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
            }

            .supplier-title {
                font-size: 16px;
                font-weight: 600;
                color: #92400e;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .supplier-info {
                color: #b45309;
                font-size: 14px;
                line-height: 1.6;
            }

            /* ✅ SERVICE DETAILS STYLING */
            .service-details {
                background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
                border: 1px solid #8b5cf6;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
            }

            .service-details h4 {
                color: #6b21a8;
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .service-details p {
                color: #7c3aed;
                font-size: 14px;
                line-height: 1.6;
            }

            .footer {
                background: #f8fafc;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }

            .contact-info {
                margin-bottom: 20px;
            }

            .contact-info p {
                color: #64748b;
                font-size: 14px;
                margin-bottom: 8px;
            }

            .company-name {
                font-size: 18px;
                font-weight: 700;
                color: #2196F3;
                margin-bottom: 8px;
            }

            .footer p:last-child {
                color: #94a3b8;
                font-size: 13px;
            }

            /* ✅ RESPONSIVE DESIGN */
            @media (max-width: 640px) {
                .email-wrapper {
                    padding: 20px 10px;
                }

                .container {
                    border-radius: 8px;
                }

                .content, .header {
                    padding: 24px 20px;
                }

                .payment-section {
                    padding: 24px 20px;
                }

                .payment-button {
                    padding: 14px 24px;
                    font-size: 16px;
                }

                .price {
                    font-size: 28px;
                }

                .detail-row {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 4px;
                }

                .detail-value {
                    text-align: left;
                }

                .security-badges {
                    flex-direction: column;
                    gap: 8px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="container">
                <div class="header">
                    <h1>🎉 ¡Reserva Confirmada!</h1>
                    <p>Tu servicio ha sido confirmado exitosamente</p>
                </div>

                <div class="content">
                    <div class="greeting">
                        ¡Hola <strong>{{clientName}}</strong>! 👋
                    </div>

                    <p>Nos complace confirmar tu reserva para <strong>{{serviceName}}</strong>. A continuación encontrarás todos los detalles:</p>

                    <div class="reservation-card">
                        <div class="card-title">
                            📋 Detalles de la Reserva
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">📅 Fecha</span>
                            <span class="detail-value">{{serviceDate}}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">⏰ Hora</span>
                            <span class="detail-value">{{serviceTime}}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">📍 Ubicación</span>
                            <span class="detail-value">{{location}}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">🎫 Reserva #</span>
                            <span class="detail-value">{{reservationId}}</span>
                        </div>
                    </div>

                    {{#if hasSupplierInfo}}
                    <div class="supplier-section">
                        <div class="supplier-title">
                            👤 Tu Proveedor de Servicio
                        </div>
                        <div class="supplier-info">
                            <strong>{{supplierName}}</strong><br>
                            📞 {{supplierPhone}}
                        </div>
                    </div>
                    {{/if}}

                    {{#if hasServiceDetails}}
                    <div class="service-details">
                        {{serviceDetails}}
                    </div>
                    {{/if}}

                    {{#if hasPaymentLink}}
                    <!-- ✅ SECCIÓN DE PAGO CONDICIONAL -->
                    <div class="payment-section">
                        <div class="payment-title">
                            💳 Completar Pago
                        </div>
                        <div class="payment-subtitle">
                            Para confirmar definitivamente tu reserva, procesa tu pago de forma segura
                        </div>

                        <div class="price-display">
                            <div class="price">{{formattedPrice}}</div>
                            <div class="price-label">Total a pagar</div>
                        </div>

                        <a href="{{paymentLink}}" class="payment-button">
                            🔒 Pagar Ahora de Forma Segura
                        </a>

                        <div class="payment-note">
                            <strong>Enlace válido por 48 horas</strong><br>
                            Procesado de forma segura por Stripe
                        </div>

                        <div class="security-badges">
                            <div class="security-badge">
                                🔒 <span>SSL Seguro</span>
                            </div>
                            <div class="security-badge">
                                ✅ <span>PCI Compliant</span>
                            </div>
                            <div class="security-badge">
                                🛡️ <span>Stripe Secure</span>
                            </div>
                        </div>
                    </div>
                    {{/if}}

                    {{#if noPaymentLink}}
                    <!-- ✅ MENSAJE CUANDO NO HAY PAGO -->
                    <div class="reservation-card">
                        <div class="card-title">
                            ✅ Estado de la Reserva
                        </div>
                        <p style="color: #16a34a; font-weight: 500; text-align: center; padding: 20px;">
                            Tu reserva está confirmada y lista. Nos pondremos en contacto contigo pronto para coordinar los detalles finales.
                        </p>
                    </div>
                    {{/if}}

                    <p style="margin-top: 32px; color: #64748b;">
                        Si tienes alguna pregunta o necesitas hacer cambios, no dudes en contactarnos respondiendo a este email.
                    </p>
                </div>

                <div class="footer">
                    <div class="contact-info">
                        <p>¿Tienes preguntas? Estamos aquí para ayudarte</p>
                        <p><strong>Responde a este email</strong> o contáctanos directamente</p>
                    </div>

                    <p class="company-name">{{companyName}} - {{year}}</p>
                    <p>Conectando clientes con los mejores servicios</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * 🎨 Generar email HTML usando el template embebido
   */
  generateEmailHTML(data: ReservationEmailData): string {
    console.log('🎨 Generating email HTML with payment support for:', data.reservationId);

    try {
      // ✅ Crear el contexto de variables para el template
      const templateContext = this.createTemplateContext(data);

      console.log('📋 Template context created:', {
        clientName: templateContext.clientName,
        serviceName: templateContext.serviceName,
        hasSupplierInfo: templateContext.hasSupplierInfo,
        hasServiceDetails: templateContext.hasServiceDetails,
        hasPaymentLink: templateContext.hasPaymentLink,
        paymentLink: templateContext.paymentLink ? 'Present' : 'Missing'
      });

      // ✅ Reemplazar variables en el template HTML
      let processedHTML = this.templateHTML;

      // Reemplazar todas las variables {{variable}} con sus valores
      Object.entries(templateContext).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedHTML = processedHTML.replace(regex, String(value));
      });

      // ✅ Procesar condicionales {{#if variable}} ... {{/if}}
      processedHTML = this.processConditionals(processedHTML, templateContext);

      // ✅ Limpiar variables no utilizadas
      processedHTML = this.cleanUnusedVariables(processedHTML);

      console.log('✅ Email HTML generated successfully with payment features:', {
        originalLength: this.templateHTML.length,
        processedLength: processedHTML.length,
        hasClientName: processedHTML.includes(data.clientName),
        hasServiceName: processedHTML.includes(data.serviceName),
        hasPaymentSection: processedHTML.includes('payment-section'),
        hasPaymentButton: templateContext.hasPaymentLink && processedHTML.includes('Pagar Ahora')
      });

      return processedHTML;
    } catch (error) {
      console.error('❌ Error generating email HTML with payment features:', error);
      return this.getFallbackTemplate(data);
    }
  }

  /**
   * 📋 Crear contexto de variables para el template (ACTUALIZADO)
   */
  private createTemplateContext(data: ReservationEmailData): Record<string, any> {
    const currentYear = new Date().getFullYear();
    const formattedPrice = `$${Number(data.totalPrice || 0).toFixed(2)}`;

    const context = {
      // ✅ Variables principales del template
      clientName: data.clientName,
      serviceName: data.serviceName,
      serviceDate: data.serviceDate,
      serviceTime: data.serviceTime || 'Por confirmar',
      location: data.location || 'Por confirmar',
      reservationId: data.reservationId,
      formattedPrice: formattedPrice,
      totalPrice: formattedPrice, // Alias para compatibilidad
      year: currentYear,

      // ✅ NUEVAS VARIABLES DE PAGO
      paymentLink: data.paymentLink || '',
      hasPaymentLink: !!(data.paymentLink && data.paymentLink.trim()),
      noPaymentLink: !(data.paymentLink && data.paymentLink.trim()),

      // ✅ Información del proveedor
      supplierName: data.supplierName || '',
      supplierPhone: data.supplierPhone || '',
      hasSupplierInfo: !!(data.supplierName || data.supplierPhone),

      // ✅ Detalles específicos del servicio
      serviceDetails: this.generateServiceDetails(data),
      hasServiceDetails: !!this.generateServiceDetails(data),

      // ✅ Variables de la empresa
      companyName: 'Plan Business',
      companyEmail: 'noreply@luxpuntacana.com',

      // ✅ Variables adicionales para condicionales
      showSupplierInfo: !!(data.supplierName || data.supplierPhone),
      showServiceDetails: !!data.additionalDetails?.formData
    };

    return context;
  }

  /**
   * 🔧 Generar detalles específicos del servicio como HTML
   */
  private generateServiceDetails(data: ReservationEmailData): string {
    if (!data.additionalDetails || !data.additionalDetails.formData) {
      return '';
    }

    const formData = data.additionalDetails.formData;
    const serviceType = this.detectServiceType(data.serviceName);

    let detailsHTML = '';

    switch (serviceType) {
      case 'airport-transfer':
        const airportDetails: string[] = [];
        if (formData.flightNumber)
          airportDetails.push(`<strong>Vuelo:</strong> ${formData.flightNumber}`);
        if (formData.vehicleType)
          airportDetails.push(`<strong>Vehículo:</strong> ${formData.vehicleType}`);
        if (formData.passengerCount)
          airportDetails.push(`<strong>Pasajeros:</strong> ${formData.passengerCount}`);
        if (formData.needsCarSeat)
          airportDetails.push(`<strong>Asiento bebé:</strong> ${formData.carSeatCount || 1}`);

        if (airportDetails.length > 0) {
          detailsHTML = `
            <h4>✈️ Detalles del Transporte</h4>
            <p>${airportDetails.join(' • ')}</p>
          `;
        }
        break;

      case 'babysitter':
        const babysitterDetails: string[] = [];
        if (formData.childrenCount)
          babysitterDetails.push(`<strong>Niños:</strong> ${formData.childrenCount}`);
        if (formData.childrenAges)
          babysitterDetails.push(
            `<strong>Edades:</strong> ${formData.childrenAges.join(', ')} años`
          );
        if (formData.startTime && formData.endTime)
          babysitterDetails.push(
            `<strong>Horario:</strong> ${formData.startTime} - ${formData.endTime}`
          );

        if (babysitterDetails.length > 0) {
          detailsHTML = `
            <h4>👶 Detalles del Cuidado</h4>
            <p>${babysitterDetails.join(' • ')}</p>
          `;
        }
        break;

      case 'custom-decoration':
        const decorationDetails: string[] = [];
        if (formData.occasion)
          decorationDetails.push(`<strong>Ocasión:</strong> ${formData.occasion}`);
        if (formData.colors)
          decorationDetails.push(`<strong>Colores:</strong> ${formData.colors.join(', ')}`);

        if (decorationDetails.length > 0) {
          detailsHTML = `
            <h4>🎨 Detalles de Decoración</h4>
            <p>${decorationDetails.join(' • ')}</p>
          `;
        }
        break;

      case 'grocery-shopping':
        const groceryDetails: string[] = [];
        if (formData.deliveryAddress)
          groceryDetails.push(`<strong>Entrega:</strong> ${formData.deliveryAddress}`);
        if (formData.items && formData.items.length)
          groceryDetails.push(`<strong>Items:</strong> ${formData.items.length}`);

        if (groceryDetails.length > 0) {
          detailsHTML = `
            <h4>🛒 Detalles de Compras</h4>
            <p>${groceryDetails.join(' • ')}</p>
          `;
        }
        break;
    }

    return detailsHTML;
  }

  /**
   * 🔧 Procesar condicionales {{#if variable}} ... {{/if}}
   */
  private processConditionals(html: string, context: Record<string, any>): string {
    const conditionalPattern = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    return html.replace(conditionalPattern, (match, variable, content) => {
      const value = context[variable];

      // ✅ Mostrar contenido solo si la variable es truthy
      if (value && value !== '' && value !== 0) {
        // ✅ Procesar variables dentro del contenido condicional
        let processedContent = content;
        Object.entries(context).forEach(([key, val]) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          processedContent = processedContent.replace(regex, String(val));
        });
        return processedContent;
      }

      return ''; // No mostrar si la condición es falsa
    });
  }

  /**
   * 🧹 Limpiar variables no utilizadas del template
   */
  private cleanUnusedVariables(html: string): string {
    return html.replace(/\{\{\w+\}\}/g, '');
  }

  /**
   * 🔍 Detectar tipo de servicio
   */
  private detectServiceType(serviceName: string): string {
    const name = serviceName.toLowerCase();
    if (name.includes('airport') || name.includes('aeropuerto')) return 'airport-transfer';
    if (name.includes('babysitter') || name.includes('niñera')) return 'babysitter';
    if (name.includes('decoration') || name.includes('decoración')) return 'custom-decoration';
    if (name.includes('grocery') || name.includes('compras')) return 'grocery-shopping';
    return 'other';
  }

  /**
   * 🆘 Template de fallback en caso de error
   */
  private getFallbackTemplate(data: ReservationEmailData): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Confirmación de Reserva</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; margin: -30px -30px 20px -30px; }
            .details { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .payment-btn { background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 ¡Reserva Confirmada!</h1>
            </div>
            <p>Estimado/a <strong>${data.clientName}</strong>,</p>
            <p>Su reserva ha sido confirmada exitosamente.</p>

            <div class="details">
                <h3>📋 Detalles de la Reserva</h3>
                <p><strong>Servicio:</strong> ${data.serviceName}</p>
                <p><strong>Fecha:</strong> ${data.serviceDate}</p>
                <p><strong>Hora:</strong> ${data.serviceTime || 'Por confirmar'}</p>
                <p><strong>Total:</strong> $${Number(data.totalPrice || 0).toFixed(2)}</p>
                <p><strong>ID:</strong> ${data.reservationId}</p>
            </div>

            ${
              data.paymentLink
                ? `
            <div style="text-align: center; margin: 30px 0;">
                <h3>💳 Completar Pago</h3>
                <p>Para confirmar tu reserva, procesa el pago:</p>
                <a href="${data.paymentLink}" class="payment-btn">🔒 Pagar Ahora</a>
            </div>
            `
                : ''
            }

            <p>Gracias por confiar en nosotros.</p>
            <p><strong>Plan Business - ${new Date().getFullYear()}</strong></p>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * 🧪 Preview del HTML generado (solo desarrollo)
   */
  previewHTML(data: ReservationEmailData): void {
    if (!import.meta.env.DEV) return;

    const html = this.generateEmailHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

    console.log('👁️ Email preview opened in new window with payment features');

    // Limpiar URL después de un tiempo
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

// ✅ Export para compatibilidad con EmailJSCaller
export { EmailTemplateEngineEmbedded as EmailTemplateEngine };
