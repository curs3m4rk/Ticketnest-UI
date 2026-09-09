import { apiRequest } from "./client";
import type {
  AdminUserResponse,
  BookingCreateRequest,
  BookingResponse,
  BookingStatus,
  LoginRequest,
  LoginResponse,
  PageResponse,
  Permission,
  RegisterRequest,
  RegisterResponse,
  RoleRequest,
  RoleResponse,
  SeatBatchCreateRequest,
  SeatBatchCreateResponse,
  SeatResponse,
  ShowFilter,
  ShowInventoryRequest,
  ShowInventoryResponse,
  ShowRequest,
  ShowResponse,
  ShowSeatResponse,
  UUID,
  VenueRequest,
  VenueResponse,
} from "./types";

const API = "/api/v1";

export const authApi = {
  login: (body: LoginRequest) =>
    apiRequest<LoginResponse>(`${API}/auth/login`, { method: "POST", body, auth: false }),
  register: (body: RegisterRequest) =>
    apiRequest<RegisterResponse>(`${API}/auth/register`, {
      method: "POST",
      body,
      auth: false,
    }),
  logout: (refreshToken: string) =>
    apiRequest<void>(`${API}/auth/logout`, { method: "POST", body: { refreshToken } }),
};

export const venuesApi = {
  list: () => apiRequest<VenueResponse[]>(`${API}/venues`),
  get: (id: UUID) => apiRequest<VenueResponse>(`${API}/venues/${id}`),
  create: (body: VenueRequest) =>
    apiRequest<VenueResponse>(`${API}/venues`, { method: "POST", body }),
  update: (id: UUID, body: VenueRequest) =>
    apiRequest<VenueResponse>(`${API}/venues/${id}`, { method: "PUT", body }),
  remove: (id: UUID) => apiRequest<void>(`${API}/venues/${id}`, { method: "DELETE" }),
  seats: (id: UUID) => apiRequest<SeatResponse[]>(`${API}/venues/${id}/seats`),
  createSeats: (id: UUID, body: SeatBatchCreateRequest) =>
    apiRequest<SeatBatchCreateResponse>(`${API}/venues/${id}/seats`, {
      method: "POST",
      body,
    }),
};

export interface ShowsQuery extends ShowFilter {
  page?: number;
  size?: number;
  sort?: string;
}

export const showsApi = {
  list: ({ city, genre, from, to, page = 0, size = 12, sort }: ShowsQuery = {}) =>
    apiRequest<PageResponse<ShowResponse>>(`${API}/shows`, {
      query: {
        city,
        genre,
        from,
        to,
        page,
        size,
        ...(sort ? { sort } : {}),
      },
    }),
  get: (id: UUID) => apiRequest<ShowResponse>(`${API}/shows/${id}`),
  create: (body: ShowRequest) => apiRequest<ShowResponse>(`${API}/shows`, { method: "POST", body }),
  update: (id: UUID, body: ShowRequest) =>
    apiRequest<ShowResponse>(`${API}/shows/${id}`, { method: "PUT", body }),
  remove: (id: UUID) => apiRequest<void>(`${API}/shows/${id}`, { method: "DELETE" }),
  seats: (id: UUID) => apiRequest<ShowSeatResponse[]>(`${API}/shows/${id}/seats`),
  initializeInventory: (id: UUID, body: ShowInventoryRequest) =>
    apiRequest<ShowInventoryResponse>(`${API}/shows/${id}/inventory`, {
      method: "POST",
      body,
    }),
};

export const bookingsApi = {
  create: (body: BookingCreateRequest, idempotencyKey: string) =>
    apiRequest<BookingResponse>(`${API}/bookings`, {
      method: "POST",
      body,
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  get: (id: UUID) => apiRequest<BookingResponse>(`${API}/bookings/${id}`),
  list: (status?: BookingStatus, page = 0, size = 20) =>
    apiRequest<PageResponse<BookingResponse>>(`${API}/bookings`, {
      query: { status, page, size },
    }),
  cancel: (id: UUID) =>
    apiRequest<BookingResponse>(`${API}/bookings/${id}/cancel`, { method: "POST" }),
};

export const adminApi = {
  roles: () => apiRequest<RoleResponse[]>(`${API}/admin/roles`),
  role: (id: UUID) => apiRequest<RoleResponse>(`${API}/admin/roles/${id}`),
  createRole: (body: RoleRequest) =>
    apiRequest<RoleResponse>(`${API}/admin/roles`, { method: "POST", body }),
  updateRole: (id: UUID, body: RoleRequest) =>
    apiRequest<RoleResponse>(`${API}/admin/roles/${id}`, { method: "PUT", body }),
  removeRole: (id: UUID) => apiRequest<void>(`${API}/admin/roles/${id}`, { method: "DELETE" }),
  permissions: () => apiRequest<Permission[]>(`${API}/admin/permissions`),
  users: (page = 0, size = 20) =>
    apiRequest<PageResponse<AdminUserResponse>>(`${API}/admin/users`, {
      query: { page, size },
    }),
  replaceRoles: (userId: UUID, roleIds: UUID[]) =>
    apiRequest<AdminUserResponse>(`${API}/admin/users/${userId}/roles`, {
      method: "PUT",
      body: { roleIds },
    }),
};
