import { apiRequest } from "./client";
import type {
  AdminUserResponse,
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
  ShowRequest,
  ShowResponse,
  UUID,
  VenueRequest,
  VenueResponse,
} from "./types";

export const authApi = {
  login: (body: LoginRequest) =>
    apiRequest<LoginResponse>("/auth/login", { method: "POST", body, auth: false }),
  register: (body: RegisterRequest) =>
    apiRequest<RegisterResponse>("/auth/register", {
      method: "POST",
      body,
      auth: false,
    }),
  logout: (refreshToken: string) =>
    apiRequest<void>("/auth/logout", { method: "POST", body: { refreshToken } }),
};

export const venuesApi = {
  list: () => apiRequest<VenueResponse[]>("/api/venues"),
  get: (id: UUID) => apiRequest<VenueResponse>(`/api/venues/${id}`),
  create: (body: VenueRequest) =>
    apiRequest<VenueResponse>("/api/venues", { method: "POST", body }),
  update: (id: UUID, body: VenueRequest) =>
    apiRequest<VenueResponse>(`/api/venues/${id}`, { method: "PUT", body }),
  remove: (id: UUID) => apiRequest<void>(`/api/venues/${id}`, { method: "DELETE" }),
  seats: (id: UUID) => apiRequest<SeatResponse[]>(`/api/venues/${id}/seats`),
  createSeats: (id: UUID, body: SeatBatchCreateRequest) =>
    apiRequest<SeatBatchCreateResponse>(`/api/venues/${id}/seats`, {
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
    apiRequest<PageResponse<ShowResponse>>("/api/shows", {
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
  get: (id: UUID) => apiRequest<ShowResponse>(`/api/shows/${id}`),
  create: (body: ShowRequest) =>
    apiRequest<ShowResponse>("/api/shows", { method: "POST", body }),
  update: (id: UUID, body: ShowRequest) =>
    apiRequest<ShowResponse>(`/api/shows/${id}`, { method: "PUT", body }),
  remove: (id: UUID) => apiRequest<void>(`/api/shows/${id}`, { method: "DELETE" }),
};

export const adminApi = {
  roles: () => apiRequest<RoleResponse[]>("/api/admin/roles"),
  role: (id: UUID) => apiRequest<RoleResponse>(`/api/admin/roles/${id}`),
  createRole: (body: RoleRequest) =>
    apiRequest<RoleResponse>("/api/admin/roles", { method: "POST", body }),
  updateRole: (id: UUID, body: RoleRequest) =>
    apiRequest<RoleResponse>(`/api/admin/roles/${id}`, { method: "PUT", body }),
  removeRole: (id: UUID) =>
    apiRequest<void>(`/api/admin/roles/${id}`, { method: "DELETE" }),
  permissions: () => apiRequest<Permission[]>("/api/admin/permissions"),
  users: (page = 0, size = 20) =>
    apiRequest<PageResponse<AdminUserResponse>>("/api/admin/users", {
      query: { page, size },
    }),
  replaceRoles: (userId: UUID, roleIds: UUID[]) =>
    apiRequest<AdminUserResponse>(`/api/admin/users/${userId}/roles`, {
      method: "PUT",
      body: { roleIds },
    }),
};
