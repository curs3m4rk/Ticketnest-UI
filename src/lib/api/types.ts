// Types mirrored from the TicketNest OpenAPI document.

export type UUID = string;

export interface RoleSummary {
  id: UUID;
  name: string;
}

export type Permission = "VENUE_MANAGE" | "SHOW_MANAGE";

export interface RoleResponse {
  id: UUID;
  name: string;
  description?: string;
  systemRole?: boolean;
  permissions: Permission[];
  assignmentCount?: number;
}

export interface RoleRequest {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface AdminUserResponse {
  id: UUID;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  active?: boolean;
  roles: RoleSummary[];
}

export interface VenueRequest {
  name: string;
  city: string;
  address: string;
}

export interface VenueResponse {
  id: UUID;
  name: string;
  city: string;
  address: string;
  active?: boolean;
  seatTiers?: string[];
}

export interface VenueSummary {
  id: UUID;
  name: string;
  city: string;
  address: string;
  seatTiers?: string[];
}

export interface ShowRequest {
  venueId: UUID;
  title: string;
  genre: string;
  startTime: string;
  status: string;
}

export interface ShowResponse {
  id: UUID;
  title: string;
  genre: string;
  startTime: string;
  status: string;
  venue?: VenueSummary;
}

export interface SeatResponse {
  id: UUID;
  row: string;
  number: string;
  tier: string;
}

export interface SeatRangeRequest {
  row: string;
  startNumber: number;
  endNumber: number;
  tier: string;
}

export interface SeatBatchCreateRequest {
  ranges: SeatRangeRequest[];
}

export interface SeatBatchCreateResponse {
  venueId: UUID;
  createdCount: number;
}

export interface ShowFilter {
  city?: string;
  genre?: string;
  from?: string;
  to?: string;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface RegisterResponse {
  id: UUID;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles?: RoleSummary[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  id: UUID;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles?: RoleSummary[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SessionUser {
  id: UUID;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles: RoleSummary[];
}
