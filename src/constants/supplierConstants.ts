// src/constants/supplierConstants.ts
import type { SupplierService, ServiceCategory } from '@/types/supplier';

/**
 * Configuraciones por defecto del sistema de proveedores
 */
export const SUPPLIER_DEFAULTS = {
  ITEMS_PER_PAGE: 12,
  MAX_ITEMS_PER_PAGE: 50,
  MIN_ITEMS_PER_PAGE: 6,
  DEFAULT_SORT: 'name' as const,
  DEFAULT_SORT_ORDER: 'asc' as const,
  SEARCH_MIN_LENGTH: 2,
  DEBOUNCE_DELAY: 300, // ms
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
} as const;

/**
 * Configuraciones de validación
 */
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/
  },
  CEDULA: {
    LENGTH: 11,
    PATTERN: /^\d{11}$/,
    FORMAT_PATTERN: /^\d{3}-\d{7}-\d{1}$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 255
  },
  PHONE: {
    LENGTH: 10,
    PATTERN: /^\d{10}$/,
    FORMAT_PATTERN: /^\d{3}-\d{3}-\d{4}$/
  },
  RATING: {
    MIN: 0,
    MAX: 5,
    DECIMALS: 1
  },
  ADDRESS: {
    MAX_LENGTH: 500
  }
} as const;

/**
 * Mensajes de error para validaciones
 */
export const VALIDATION_MESSAGES = {
  NAME: {
    REQUIRED: 'El nombre es requerido',
    MIN_LENGTH: `El nombre debe tener al menos ${VALIDATION_RULES.NAME.MIN_LENGTH} caracteres`,
    MAX_LENGTH: `El nombre no puede exceder ${VALIDATION_RULES.NAME.MAX_LENGTH} caracteres`,
    INVALID_FORMAT: 'El nombre solo puede contener letras y espacios'
  },
  CEDULA: {
    REQUIRED: 'La cédula es requerida',
    INVALID_LENGTH: `La cédula debe tener ${VALIDATION_RULES.CEDULA.LENGTH} dígitos`,
    INVALID_FORMAT: 'Formato de cédula inválido (debe ser 001-0000000-0)'
  },
  EMAIL: {
    REQUIRED: 'El email es requerido',
    INVALID_FORMAT: 'El formato del email es inválido',
    MAX_LENGTH: `El email no puede exceder ${VALIDATION_RULES.EMAIL.MAX_LENGTH} caracteres`
  },
  PHONE: {
    REQUIRED: 'El teléfono es requerido',
    INVALID_LENGTH: `El teléfono debe tener ${VALIDATION_RULES.PHONE.LENGTH} dígitos`,
    INVALID_FORMAT: 'Formato de teléfono inválido (debe ser 809-000-0000)'
  },
  SERVICE: {
    REQUIRED: 'Debe seleccionar un servicio'
  },
  RATING: {
    INVALID_RANGE: `La calificación debe estar entre ${VALIDATION_RULES.RATING.MIN} y ${VALIDATION_RULES.RATING.MAX}`,
    INVALID_FORMAT: 'La calificación debe ser un número válido'
  }
} as const;

/**
 * Estados de carga para UI
 */
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

/**
 * Tipos de notificaciones
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

/**
 * Duración de notificaciones (en ms)
 */
export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000,
  PERSISTENT: 0
} as const;

/**
 * Configuraciones de la tabla/lista
 */
export const TABLE_CONFIG = {
  MIN_COLUMN_WIDTH: 100,
  DEFAULT_COLUMN_WIDTH: 150,
  ACTIONS_COLUMN_WIDTH: 120,
  COMPACT_ROW_HEIGHT: 48,
  NORMAL_ROW_HEIGHT: 64,
  COMFORTABLE_ROW_HEIGHT: 80
} as const;

/**
 * Configuraciones de filtros
 */
export const FILTER_CONFIG = {
  DEBOUNCE_SEARCH: 300,
  MAX_RECENT_SEARCHES: 10,
  CLEAR_FILTERS_CONFIRM: false,
  REMEMBER_FILTERS: true,
  FILTER_STORAGE_KEY: 'supplier_filters'
} as const;

/**
 * Configuraciones de caché
 */
export const CACHE_CONFIG = {
  SUPPLIERS_KEY: 'suppliers_cache',
  STATS_KEY: 'supplier_stats_cache',
  TTL: 5 * 60 * 1000, // 5 minutos
  MAX_SIZE: 1000, // máximo número de proveedores en caché
  COMPRESS: true
} as const;

/**
 * Configuraciones de exportación
 */
export const EXPORT_CONFIG = {
  MAX_RECORDS: 10000,
  FORMATS: ['csv', 'xlsx', 'pdf'] as const,
  DEFAULT_FORMAT: 'csv' as const,
  FILENAME_PREFIX: 'proveedores',
  DATE_FORMAT: 'YYYY-MM-DD'
} as const;

/**
 * Configuraciones de importación
 */
export const IMPORT_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FORMATS: ['.csv', '.xlsx', '.xls'] as const,
  MAX_RECORDS_PER_BATCH: 100,
  REQUIRED_COLUMNS: ['name', 'cedula', 'email', 'phone', 'service'] as const,
  OPTIONAL_COLUMNS: ['address', 'featured', 'rating', 'status'] as const
} as const;

/**
 * Configuraciones de API
 */
export const API_CONFIG = {
  BASE_URL: '/api/suppliers',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    BURST_LIMIT: 10
  }
} as const;

/**
 * Configuraciones de Firebase (cuando se implemente)
 */
export const FIREBASE_CONFIG = {
  COLLECTION_NAME: 'suppliers',
  BATCH_SIZE: 500,
  CACHE_SIZE: 40 * 1024 * 1024, // 40MB
  OFFLINE_PERSISTENCE: true,
  REAL_TIME_UPDATES: true
} as const;

/**
 * Textos de interfaz de usuario
 */
export const UI_TEXTS = {
  TITLES: {
    MAIN: 'Lista de Proveedores',
    ADD: 'Agregar Proveedor',
    EDIT: 'Editar Proveedor',
    VIEW: 'Detalles del Proveedor',
    DELETE: 'Eliminar Proveedor',
    FILTERS: 'Filtrar Proveedores',
    EXPORT: 'Exportar Proveedores',
    IMPORT: 'Importar Proveedores'
  },
  BUTTONS: {
    ADD: 'Agregar Proveedor',
    EDIT: 'Editar',
    DELETE: 'Eliminar',
    SAVE: 'Guardar',
    CANCEL: 'Cancelar',
    SEARCH: 'Buscar',
    FILTER: 'Filtrar',
    CLEAR_FILTERS: 'Limpiar Filtros',
    EXPORT: 'Exportar',
    IMPORT: 'Importar',
    REFRESH: 'Actualizar',
    VIEW_DETAILS: 'Ver Detalles',
    CONTACT: 'Contactar',
    TOGGLE_FEATURED: 'Destacar/Quitar'
  },
  LABELS: {
    NAME: 'Nombre',
    CEDULA: 'Cédula',
    EMAIL: 'Email',
    PHONE: 'Teléfono',
    SERVICE: 'Servicio',
    CATEGORY: 'Categoría',
    ADDRESS: 'Dirección',
    RATING: 'Calificación',
    STATUS: 'Estado',
    FEATURED: 'Destacado',
    CREATED_AT: 'Fecha de Registro',
    UPDATED_AT: 'Última Actualización'
  },
  PLACEHOLDERS: {
    SEARCH: 'Buscar proveedores...',
    NAME: 'Ingrese el nombre completo',
    CEDULA: '001-0000000-0',
    EMAIL: 'ejemplo@email.com',
    PHONE: '809-000-0000',
    ADDRESS: 'Dirección completa'
  },
  EMPTY_STATES: {
    NO_SUPPLIERS: 'No hay proveedores registrados',
    NO_RESULTS: 'No se encontraron proveedores con los filtros aplicados',
    LOADING: 'Cargando proveedores...',
    ERROR: 'Error al cargar proveedores'
  },
  CONFIRMATIONS: {
    DELETE: '¿Está seguro de que desea eliminar este proveedor?',
    DELETE_MULTIPLE: '¿Está seguro de que desea eliminar los proveedores seleccionados?',
    CLEAR_FILTERS: '¿Desea limpiar todos los filtros aplicados?',
    UNSAVED_CHANGES: 'Tiene cambios sin guardar. ¿Desea continuar?'
  },
  SUCCESS_MESSAGES: {
    CREATED: 'Proveedor creado exitosamente',
    UPDATED: 'Proveedor actualizado exitosamente',
    DELETED: 'Proveedor eliminado exitosamente',
    FEATURED_ADDED: 'Proveedor marcado como destacado',
    FEATURED_REMOVED: 'Proveedor removido de destacados',
    EXPORTED: 'Datos exportados exitosamente',
    IMPORTED: 'Datos importados exitosamente'
  },
  ERROR_MESSAGES: {
    GENERIC: 'Ha ocurrido un error inesperado',
    NETWORK: 'Error de conexión. Verifique su conexión a internet',
    NOT_FOUND: 'Proveedor no encontrado',
    DUPLICATE: 'Ya existe un proveedor con esta información',
    VALIDATION: 'Por favor corrija los errores en el formulario',
    PERMISSION: 'No tiene permisos para realizar esta acción',
    FILE_TOO_LARGE: 'El archivo es demasiado grande',
    INVALID_FORMAT: 'Formato de archivo no válido',
    IMPORT_FAILED: 'Error al importar los datos'
  }
} as const;

/**
 * Configuraciones de animaciones
 */
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

/**
 * Breakpoints responsivos
 */
export const BREAKPOINTS = {
  XS: 600,
  SM: 960,
  MD: 1264,
  LG: 1904
} as const;

/**
 * Configuraciones de accesibilidad
 */
export const A11Y_CONFIG = {
  FOCUS_OUTLINE_WIDTH: 2,
  MIN_CONTRAST_RATIO: 4.5,
  MIN_TOUCH_TARGET: 44, // píxeles
  KEYBOARD_NAVIGATION: true,
  SCREEN_READER_ANNOUNCEMENTS: true,
  HIGH_CONTRAST_MODE: false
} as const;
