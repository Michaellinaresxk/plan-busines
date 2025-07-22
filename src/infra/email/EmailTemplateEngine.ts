// src/infra/email/EmailTemplateEngine.ts - SOLUCIÓN 2: TEMPLATE EMBEBIDO
import type { ReservationEmailData } from '@/types/email';

export class EmailTemplateEngineEmbedded {
  private templateHTML: string;

  constructor() {
    console.log('🎨 EmailTemplateEngine initialized - using embedded template');
    this.templateHTML = this.getEmbeddedTemplate();

    console.log('✅ Embedded template loaded:', {
      length: this.templateHTML.length,
      hasContent: this.templateHTML.includes('<html'),
      hasVariables: this.templateHTML.includes('{{clientName}}')
    });
  }

  /**
   * 🎨 Tu EmailTemplate.html embebido con variables dinámicas
   */
  private getEmbeddedTemplate(): string {
    // ✅ AQUÍ ESTÁ TU TEMPLATE COMPLETO CON VARIABLES DINÁMICAS
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
                right: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
                animation: pulse 4s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }

            .logo {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                position: relative;
                z-index: 2;
            }

            .header h1 {
                font-size: 32px;
                font-weight: 600;
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
                background: #ffffff;
            }

            .greeting {
                font-size: 24px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 16px;
            }

            .intro-text {
                font-size: 16px;
                color: #5a6c7d;
                margin-bottom: 30px;
                line-height: 1.7;
            }

            .status-badge {
                display: inline-flex;
                align-items: center;
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 30px;
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
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

            .price-section {
                text-align: center;
                margin: 30px 0;
                padding: 24px;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-radius: 12px;
                border: 2px solid #0ea5e9;
            }

            .price {
                font-size: 36px;
                font-weight: 700;
                color: #0369a1;
                margin-bottom: 8px;
            }

            .price-label {
                font-size: 14px;
                color: #0369a1;
                font-weight: 500;
            }

            .supplier-card {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                border: 1px solid #bbf7d0;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                position: relative;
            }

            .supplier-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #22c55e, #16a34a);
            }

            .next-steps {
                background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
                border-left: 4px solid #f59e0b;
                padding: 20px;
                border-radius: 0 8px 8px 0;
                margin: 24px 0;
            }

            .next-steps h4 {
                color: #92400e;
                font-size: 16px;
                margin-bottom: 8px;
            }

            .next-steps p {
                color: #a16207;
                font-size: 14px;
                margin: 0;
            }

            .service-specifics {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border: 1px solid #7dd3fc;
                border-radius: 8px;
                padding: 16px;
                margin: 16px 0;
            }

            .service-specifics h4 {
                color: #0369a1;
                font-size: 14px;
                margin-bottom: 8px;
            }

            .service-specifics p {
                color: #1e40af;
                font-size: 13px;
                margin: 0;
            }

            .footer {
                background: #f8fafc;
                padding: 30px;
                text-align: center;
                color: #64748b;
                font-size: 14px;
                border-top: 1px solid #e2e8f0;
            }

            .footer p {
                margin-bottom: 8px;
            }

            .company-name {
                font-weight: 600;
                color: #1e293b;
            }

            .contact-info {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #e2e8f0;
            }

            /* Responsive Design */
            @media (max-width: 600px) {
                .email-wrapper {
                    padding: 20px 10px;
                }

                .container {
                    border-radius: 8px;
                }

                .header, .content {
                    padding: 24px 20px;
                }

                .header h1 {
                    font-size: 24px;
                }

                .greeting {
                    font-size: 20px;
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
                    font-weight: 600;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="container">
                <div class="header">
                    <div class="logo">Plan Business</div>
                    <h1>🎉 ¡Reserva Confirmada!</h1>
                    <p>Tu servicio está listo y confirmado</p>
                </div>

                <div class="content">
                    <div class="greeting">¡Hola {{clientName}}!</div>

                    <div class="status-badge">
                        ✅ Confirmación exitosa
                    </div>

                    <p class="intro-text">
                        Tu reserva ha sido <strong>confirmada exitosamente</strong> y está lista para proceder.
                        A continuación encontrarás todos los detalles importantes de tu servicio.
                    </p>

                    <div class="reservation-card">
                        <h3 class="card-title">📋 Detalles de tu Reserva</h3>

                        <div class="detail-row">
                            <span class="detail-label">🎯 Servicio</span>
                            <span class="detail-value">{{serviceName}}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">📅 Fecha</span>
                            <span class="detail-value">{{serviceDate}}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">🕒 Hora</span>
                            <span class="detail-value">{{serviceTime}}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">📍 Ubicación</span>
                            <span class="detail-value">{{location}}</span>
                        </div>

                        <div class="detail-row">
                            <span class="detail-label">🔢 ID de Reserva</span>
                            <span class="detail-value">{{reservationId}}</span>
                        </div>
                    </div>

                    <div class="price-section">
                        <div class="price">{{formattedPrice}}</div>
                        <div class="price-label">💰 Total a pagar</div>
                    </div>

                    {{#if hasServiceDetails}}
                        {{serviceDetails}}
                    {{/if}}

                    {{#if supplierName}}
                    <div class="supplier-card">
                        <h3 class="card-title">👤 Tu Proveedor Asignado</h3>

                        <div class="detail-row">
                            <span class="detail-label">👨‍💼 Nombre</span>
                            <span class="detail-value">{{supplierName}}</span>
                        </div>

                        {{#if supplierPhone}}
                        <div class="detail-row">
                            <span class="detail-label">📞 Teléfono</span>
                            <span class="detail-value">{{supplierPhone}}</span>
                        </div>
                        {{/if}}
                    </div>
                    {{/if}}

                    <div class="next-steps">
                        <h4>📱 Próximo paso:</h4>
                        <p>Recibirás un enlace de pago seguro para completar tu reserva. Una vez procesado el pago, tu servicio estará 100% confirmado.</p>
                    </div>
                </div>

                <div class="footer">
                    <div class="contact-info">
                        <p>¿Tienes preguntas? Estamos aquí para ayudarte</p>
                        <p><strong>Responde a este email</strong> o contáctanos directamente</p>
                    </div>

                    <p class="company-name">Plan Business - {{year}}</p>
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
    console.log('🎨 Generating email HTML from embedded template for:', data.reservationId);

    try {
      // ✅ Crear el contexto de variables para el template
      const templateContext = this.createTemplateContext(data);

      console.log('📋 Template context created:', {
        clientName: templateContext.clientName,
        serviceName: templateContext.serviceName,
        hasSupplierInfo: templateContext.hasSupplierInfo,
        hasServiceDetails: templateContext.hasServiceDetails
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

      console.log('✅ Email HTML generated successfully from embedded template:', {
        originalLength: this.templateHTML.length,
        processedLength: processedHTML.length,
        hasClientName: processedHTML.includes(data.clientName),
        hasServiceName: processedHTML.includes(data.serviceName)
      });

      return processedHTML;
    } catch (error) {
      console.error('❌ Error generating email HTML from embedded template:', error);
      return this.getFallbackTemplate(data);
    }
  }

  /**
   * 📋 Crear contexto de variables para el template
   */
  private createTemplateContext(data: ReservationEmailData): Record<string, any> {
    const currentYear = new Date().getFullYear();
    const formattedPrice = `$${Number(data.totalPrice).toFixed(2)}`;

    const context = {
      // ✅ Variables principales del template
      clientName: data.clientName,
      serviceName: data.serviceName,
      serviceDate: data.serviceDate,
      serviceTime: data.serviceTime,
      location: data.location || 'Por confirmar',
      reservationId: data.reservationId,
      formattedPrice: formattedPrice,
      totalPrice: formattedPrice, // Alias para compatibilidad
      year: currentYear,

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
          detailsHTML = `<div class="service-specifics">
            <h4>✈️ Detalles del Transporte</h4>
            <p>${airportDetails.join(' • ')}</p>
          </div>`;
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
          detailsHTML = `<div class="service-specifics">
            <h4>👶 Detalles del Cuidado</h4>
            <p>${babysitterDetails.join(' • ')}</p>
          </div>`;
        }
        break;

      case 'custom-decoration':
        const decorationDetails: string[] = [];
        if (formData.occasion)
          decorationDetails.push(`<strong>Ocasión:</strong> ${formData.occasion}`);
        if (formData.colors)
          decorationDetails.push(`<strong>Colores:</strong> ${formData.colors.join(', ')}`);

        if (decorationDetails.length > 0) {
          detailsHTML = `<div class="service-specifics">
            <h4>🎨 Detalles de Decoración</h4>
            <p>${decorationDetails.join(' • ')}</p>
          </div>`;
        }
        break;

      case 'grocery-shopping':
        const groceryDetails: string[] = [];
        if (formData.deliveryAddress)
          groceryDetails.push(`<strong>Entrega:</strong> ${formData.deliveryAddress}`);
        if (formData.items && formData.items.length)
          groceryDetails.push(`<strong>Items:</strong> ${formData.items.length}`);

        if (groceryDetails.length > 0) {
          detailsHTML = `<div class="service-specifics">
            <h4>🛒 Detalles de Compras</h4>
            <p>${groceryDetails.join(' • ')}</p>
          </div>`;
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
                <p><strong>Hora:</strong> ${data.serviceTime}</p>
                <p><strong>Total:</strong> $${data.totalPrice.toFixed(2)}</p>
                <p><strong>ID:</strong> ${data.reservationId}</p>
            </div>

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

    console.log('👁️ Email preview opened in new window');

    // Limpiar URL después de un tiempo
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

// ✅ Export para compatibilidad con EmailJSCaller
export { EmailTemplateEngineEmbedded as EmailTemplateEngine };
