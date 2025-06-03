// functions/src/index.ts
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import cors from 'cors';

// ✅ Configurar CORS correctamente
const corsHandler = cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://tu-dominio.web.app',
    'https://tu-dominio.firebaseapp.com'
  ],
  credentials: true
});

// Inicializar Firebase Admin
initializeApp();
const db = getFirestore();

// ✅ FUNCIÓN PARA CARGAR DATOS DE CONFIRMACIÓN
export const getSupplierConfirmation = onRequest(
  {
    cors: true,
    region: 'us-central1'
  },
  async (req, res) => {
    // ✅ Manejar CORS manualmente si es necesario
    corsHandler(req, res, async () => {
      try {
        console.log('🔍 Function called with query:', req.query);
        console.log('🌐 Origin:', req.headers.origin);

        const { booking, supplier } = req.query;

        if (!booking || !supplier) {
          return res.status(400).json({
            success: false,
            error: 'Parámetros booking y supplier son requeridos'
          });
        }

        console.log('📋 Loading confirmation data:', { booking, supplier });

        // Obtener reserva
        const reservationDoc = await db
          .collection('bookings')
          .doc(booking as string)
          .get();

        if (!reservationDoc.exists) {
          return res.status(404).json({
            success: false,
            error: 'Reserva no encontrada'
          });
        }

        // Obtener proveedor
        const supplierDoc = await db
          .collection('supliers')
          .doc(supplier as string)
          .get();

        if (!supplierDoc.exists) {
          return res.status(404).json({
            success: false,
            error: 'Proveedor no encontrado'
          });
        }

        const reservationData = {
          bookingId: reservationDoc.id,
          ...reservationDoc.data(),
          // Convertir Timestamp para serialización
          bookingDate: reservationDoc.data()?.bookingDate?.toDate?.()?.toISOString() || null
        };

        const supplierData = {
          id: supplierDoc.id,
          ...supplierDoc.data()
        };

        // Validar compatibilidad
        const isServiceMatch = validateServiceMatch(reservationData, supplierData);

        console.log('✅ Data loaded successfully');

        return res.json({
          success: true,
          data: {
            reservation: reservationData,
            supplier: supplierData,
            isValid: isServiceMatch,
            error: isServiceMatch ? null : 'El proveedor no está autorizado para este servicio'
          }
        });
      } catch (error) {
        console.error('❌ Error loading confirmation data:', error);
        return res.status(500).json({
          success: false,
          error: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }
);

// ✅ FUNCIÓN PARA PROCESAR CONFIRMACIÓN DEL PROVEEDOR
export const processSupplierConfirmation = onRequest(
  {
    cors: true,
    region: 'us-central1'
  },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        console.log('📝 Processing supplier confirmation');
        console.log('📋 Request body:', req.body);

        const { bookingId, supplierId, decision, message, estimatedArrival, additionalNotes } =
          req.body;

        // Validaciones
        if (!bookingId || !supplierId || !decision || !message) {
          return res.status(400).json({
            success: false,
            error: 'Faltan campos requeridos'
          });
        }

        if (!['accept', 'decline'].includes(decision)) {
          return res.status(400).json({
            success: false,
            error: 'Decisión inválida'
          });
        }

        if (message.trim().length < 10) {
          return res.status(400).json({
            success: false,
            error: 'El mensaje debe tener al menos 10 caracteres'
          });
        }

        // Verificar reserva
        const reservationRef = db.collection('bookings').doc(bookingId);
        const reservationDoc = await reservationRef.get();

        if (!reservationDoc.exists) {
          return res.status(404).json({
            success: false,
            error: 'Reserva no encontrada'
          });
        }

        const currentStatus = reservationDoc.data()?.status;
        if (currentStatus !== 'pending') {
          return res.status(409).json({
            success: false,
            error: `La reserva ya no está pendiente. Estado actual: ${currentStatus}`
          });
        }

        // Verificar proveedor
        const supplierDoc = await db.collection('supliers').doc(supplierId).get();
        if (!supplierDoc.exists) {
          return res.status(404).json({
            success: false,
            error: 'Proveedor no encontrado'
          });
        }

        // ✅ ACTUALIZAR ESTADO EN FIRESTORE
        const newStatus = decision === 'accept' ? 'approved' : 'rejected';
        const updateData = {
          status: newStatus,
          updatedAt: new Date(),
          supplierResponse: {
            supplierId,
            supplierName: supplierDoc.data()?.name,
            decision,
            message,
            estimatedArrival: estimatedArrival || null,
            additionalNotes: additionalNotes || null,
            responseDate: new Date()
          }
        };

        console.log('🔄 Updating reservation in Firestore:', {
          bookingId,
          newStatus,
          supplierName: supplierDoc.data()?.name
        });

        await reservationRef.update(updateData);

        console.log('✅ Firestore updated successfully');

        return res.json({
          success: true,
          message:
            decision === 'accept'
              ? 'Confirmación exitosa. Se ha notificado al cliente.'
              : 'Respuesta registrada. Se buscará otro proveedor.',
          data: {
            bookingId,
            newStatus,
            supplierName: supplierDoc.data()?.name,
            responseDate: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('❌ Error processing supplier confirmation:', error);
        return res.status(500).json({
          success: false,
          error: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }
);

// Helper function
function validateServiceMatch(reservation: any, supplier: any): boolean {
  const reservationService = reservation.serviceId || reservation.serviceName;
  const supplierService = supplier.service;

  if (!reservationService || !supplierService) {
    return false;
  }

  // Normalizar strings para comparación
  const normalizeService = (service: string) => service.toLowerCase().replace(/[-_\s]/g, '');

  const normalizedReservation = normalizeService(reservationService);
  const normalizedSupplier = normalizeService(supplierService);

  return (
    normalizedReservation === normalizedSupplier ||
    normalizedReservation.includes(normalizedSupplier) ||
    normalizedSupplier.includes(normalizedReservation)
  );
}
