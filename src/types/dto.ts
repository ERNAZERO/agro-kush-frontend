// TypeScript mirrors of the backend DTOs (com.example.agrokushproject.dto.*).
// Field names and optionality follow the Java classes exactly — do not rename.
import type { EquipmentStatus, Role, TaskStatus } from './enums';

// ---- Auth ----

export interface RegisterRequest {
  lastName: string;
  firstName: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthenticateRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
}

// ---- User ----

export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  taskIds: number[] | null;
}

// UserController's update endpoint takes the full DTO in the body (the {id} path
// variable is not actually read by the backend), so id must be included.
export type UserUpdateRequest = UserDto;

// ---- Location ----

export interface LocationDto {
  id: number;
  name: string;
  description?: string | null;
  address?: string | null;
  coordinates?: string | null;
  equipmentsId: number[];
  tasksId: number[];
}

// ---- Equipment ----

export interface EquipmentDto {
  id: number;
  equipmentName: string;
  model?: string | null;
  manufacturer?: string | null;
  installationDate?: string | null; // ISO LocalDateTime
  equipmentStatus?: EquipmentStatus | null;
  taskIds: number[] | null;
  sparePartIds: number[] | null;
  locationId?: number | null;
  techPassportId?: number | null;
  defectIds: number[] | null;
  meterIds: number[] | null;
}

// ---- Defect ----

export interface DefectDto {
  id: number;
  defectName: string;
  description?: string | null;
  equipmentId?: number | null;
  imageIds: number[] | null;
}

// ---- Material ----
// NB: the backend entity stores raw file bytes (`data: byte[]`) but MaterialDto never
// exposes them, and no controller endpoint accepts/streams the file bytes. `downloadUrl`
// is set on the DTO but nothing in MaterialServiceImpl populates it. Treat Materials as
// metadata-only records in this frontend — see README "Backend issues".
export interface MaterialDto {
  id: number;
  fileName: string;
  contentType: string;
  sizeBytes?: number | null;
  downloadUrl?: string | null;
  defectId?: number | null;
  equipmentId?: number | null;
}

// ---- Meter ----

export interface MeterDto {
  id: number;
  counterName: string;
  description?: string | null;
  currentValue: number;
  readingInterval: number;
  equipmentId?: number | null;
}

// ---- MeterReading ----

export interface MeterReadingDto {
  id: number;
  meterId: number;
  value: number;
  recordedAt?: string | null; // ISO LocalDateTime
  notes?: string | null;
}

// ---- SparePart ----

export interface SparePartDto {
  id: number;
  name: string;
  quantity?: number | null;
  equipmentIds: number[];
  equipmentNames: string[];
}

// ---- Task ----

export interface TaskDto {
  id: number;
  name: string;
  description?: string | null;
  startTime?: string | null; // ISO LocalDateTime
  endTime?: string | null; // ISO LocalDateTime
  taskStatus?: TaskStatus | null;
  userId?: number | null;
  equipmentIds: number[] | null;
  locationId?: number | null;
}
