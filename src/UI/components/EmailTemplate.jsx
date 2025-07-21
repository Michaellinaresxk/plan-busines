<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .reservation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
        .price { font-size: 24px; font-weight: bold; color: #2196F3; text-align: center; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        .button { background: #2196F3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Reserva Confirmada</h1>
            <p>¡Tu servicio está listo!</p>
        </div>
        
        <div class="content">
            <h2>Hola {{clientName}},</h2>
            <p>Tu reserva ha sido <strong>confirmada</strong> y está lista para proceder con el pago.</p>
            
            <div class="reservation-details">
                <h3>📋 Detalles de la Reserva</h3>
                <div class="detail-row">
                    <span><strong>Servicio:</strong></span>
                    <span>{{serviceName}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Fecha:</strong></span>
                    <span>{{serviceDate}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Hora:</strong></span>
                    <span>{{serviceTime}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Ubicación:</strong></span>
                    <span>{{location}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>ID de Reserva:</strong></span>
                    <span>{{reservationId}}</span>
                </div>
            </div>
            
            <div class="price">
                💰 Total: {{formattedPrice}}
            </div>
            
            {{#if supplierName}}
            <div class="reservation-details">
                <h3>👤 Tu Proveedor Asignado</h3>
                <div class="detail-row">
                    <span><strong>Nombre:</strong></span>
                    <span>{{supplierName}}</span>
                </div>
                {{#if supplierPhone}}
                <div class="detail-row">
                    <span><strong>Teléfono:</strong></span>
                    <span>{{supplierPhone}}</span>
                </div>
                {{/if}}
            </div>
            {{/if}}
            
            <p><strong>Próximo paso:</strong> Recibirás un enlace de pago seguro para completar tu reserva.</p>
            
            <div class="footer">
                <p>¿Tienes preguntas? Contáctanos respondiendo a este email.</p>
                <p>Plan Business - {{year}}</p>
            </div>
        </div>
    </div>
</body>
</html>