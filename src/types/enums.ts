// Enums mirrored exactly from the backend (com.example.agrokushproject.entity.enums.*)
// Do not rename values — they are serialized as-is in JSON request/response bodies.

export const DefectStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type DefectStatus = (typeof DefectStatus)[keyof typeof DefectStatus];
export const DEFECT_STATUS_VALUES = Object.values(DefectStatus);

export const EquipmentStatus = {
  READY_FOR_OPERATION: 'READY_FOR_OPERATION',
  FUNCTIONAL: 'FUNCTIONAL',
  // NB: "IN_MINTENANCE" is a typo in the backend enum (should be IN_MAINTENANCE).
  // Preserved verbatim because it is the literal value serialized over the wire.
  IN_MINTENANCE: 'IN_MINTENANCE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
} as const;
export type EquipmentStatus = (typeof EquipmentStatus)[keyof typeof EquipmentStatus];
export const EQUIPMENT_STATUS_VALUES = Object.values(EquipmentStatus);

export const TaskStatus = {
  MAJOR_REPAIRS: 'MAJOR_REPAIRS',
  CURRENT_REPAIRS: 'CURRENT_REPAIRS',
  EMERGENCY_RECOVERY_REPAIRS: 'EMERGENCY_RECOVERY_REPAIRS',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export const TASK_STATUS_VALUES = Object.values(TaskStatus);

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];
export const ROLE_VALUES = Object.values(Role);

// Human-readable labels for the UI (backend values are the source of truth for the wire format).
export const DEFECT_STATUS_LABELS: Record<DefectStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  READY_FOR_OPERATION: 'Ready for operation',
  FUNCTIONAL: 'Functional',
  IN_MINTENANCE: 'In maintenance',
  OUT_OF_SERVICE: 'Out of service',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  MAJOR_REPAIRS: 'Major repairs',
  CURRENT_REPAIRS: 'Current repairs',
  EMERGENCY_RECOVERY_REPAIRS: 'Emergency recovery repairs',
};

export const ROLE_LABELS: Record<Role, string> = {
  USER: 'User',
  ADMIN: 'Admin',
};
