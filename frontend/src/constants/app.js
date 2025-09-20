// Application constants

export const PRIORITY_LEVELS = {
  CRITICA: 'critica',
  ALTA: 'alta',
  MEDIA: 'media',
  BAJA: 'baja'
};

export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.CRITICA]: 'Crítica',
  [PRIORITY_LEVELS.ALTA]: 'Alta',
  [PRIORITY_LEVELS.MEDIA]: 'Media',
  [PRIORITY_LEVELS.BAJA]: 'Baja'
};

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.CRITICA]: 'text-red-600 bg-red-100',
  [PRIORITY_LEVELS.ALTA]: 'text-orange-600 bg-orange-100',
  [PRIORITY_LEVELS.MEDIA]: 'text-yellow-600 bg-yellow-100',
  [PRIORITY_LEVELS.BAJA]: 'text-green-600 bg-green-100'
};

export const REPORT_STATUS = {
  ABIERTO: 'abierto',
  EN_PROCESO: 'en_proceso',
  RESUELTO: 'resuelto',
  CERRADO: 'cerrado',
  CANCELADO: 'cancelado'
};

export const REPORT_STATUS_LABELS = {
  [REPORT_STATUS.ABIERTO]: 'Abierto',
  [REPORT_STATUS.EN_PROCESO]: 'En Proceso',
  [REPORT_STATUS.RESUELTO]: 'Resuelto',
  [REPORT_STATUS.CERRADO]: 'Cerrado',
  [REPORT_STATUS.CANCELADO]: 'Cancelado'
};

export const REPORT_STATUS_COLORS = {
  [REPORT_STATUS.ABIERTO]: 'text-yellow-600 bg-yellow-100',
  [REPORT_STATUS.EN_PROCESO]: 'text-blue-600 bg-blue-100',
  [REPORT_STATUS.RESUELTO]: 'text-green-600 bg-green-100',
  [REPORT_STATUS.CERRADO]: 'text-gray-600 bg-gray-100',
  [REPORT_STATUS.CANCELADO]: 'text-red-600 bg-red-100'
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  REJECTED: 'rejected'
};

export const ISSUE_TYPES = {
  PREVENTIVO: 'preventivo',
  CORRECTIVO: 'correctivo',
  INSPECCION: 'inspeccion',
  EMERGENCIA: 'emergencia',
  MEJORA: 'mejora',
  OTRO: 'otro'
};

export const ISSUE_TYPE_LABELS = {
  [ISSUE_TYPES.PREVENTIVO]: 'Preventivo',
  [ISSUE_TYPES.CORRECTIVO]: 'Correctivo',
  [ISSUE_TYPES.INSPECCION]: 'Inspección',
  [ISSUE_TYPES.EMERGENCIA]: 'Emergencia',
  [ISSUE_TYPES.MEJORA]: 'Mejora',
  [ISSUE_TYPES.OTRO]: 'Otro'
};

export const DATE_FORMATS = {
  DEFAULT: 'es-ES',
  DATE_TIME: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  DATE: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
};