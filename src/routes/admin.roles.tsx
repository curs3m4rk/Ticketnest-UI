import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ApiErrorState } from "@/components/api-error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/endpoints";
import type { Permission, RoleResponse } from "@/lib/api/types";

export const Route = createFileRoute("/admin/roles")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Roles & permissions — TicketNest admin" },
      {
        name: "description",
        content: "Create roles and choose which permissions each role grants.",
      },
      { property: "og:title", content: "Roles & permissions — TicketNest admin" },
      {
        property: "og:description",
        content: "Create roles and choose which permissions each grants.",
      },
    ],
  }),
  component: AdminRolesPage,
});

function AdminRolesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoleResponse | null>(null);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    permissions: Permission[];
  }>({ name: "", description: "", permissions: [] });

  const roles = useQuery({ queryKey: ["roles"], queryFn: adminApi.roles });
  const permissions = useQuery({
    queryKey: ["permissions"],
    queryFn: adminApi.permissions,
  });

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name: form.name,
        description: form.description || undefined,
        permissions: form.permissions,
      };
      return editing ? adminApi.updateRole(editing.id, body) : adminApi.createRole(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(editing ? "Role updated" : "Role created");
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.removeRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", permissions: [] });
    setOpen(true);
  }

  function openEdit(role: RoleResponse) {
    setEditing(role);
    setForm({
      name: role.name,
      description: role.description ?? "",
      permissions: role.permissions ?? [],
    });
    setOpen(true);
  }

  function togglePermission(permission: Permission, checked: boolean) {
    setForm((f) => ({
      ...f,
      permissions: checked
        ? [...new Set([...f.permissions, permission])]
        : f.permissions.filter((p) => p !== permission),
    }));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Roles</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" /> New role
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {roles.isPending ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : roles.isError ? (
          <ApiErrorState error={roles.error} onRetry={() => roles.refetch()} />
        ) : roles.data?.length ? (
          roles.data.map((role) => (
            <div
              key={role.id}
              className="card-surface flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{role.name}</h2>
                  {role.systemRole ? (
                    <Badge variant="outline" className="text-[10px]">
                      System
                    </Badge>
                  ) : null}
                </div>
                {role.description ? (
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {role.permissions?.length ? (
                    role.permissions.map((permission) => (
                      <Badge
                        key={permission}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {permission}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No permissions</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {typeof role.assignmentCount === "number" ? (
                  <span className="text-xs text-muted-foreground">
                    {role.assignmentCount} users
                  </span>
                ) : null}
                <Button variant="ghost" size="icon" onClick={() => openEdit(role)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={role.systemRole}
                  onClick={() => remove.mutate(role.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="card-surface rounded-xl px-6 py-12 text-center text-sm text-muted-foreground">
            No roles yet.
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit role" : "New role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="role-name">Name</Label>
              <Input
                id="role-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              {(permissions.data ?? ["VENUE_MANAGE", "SHOW_MANAGE"]).map((permission) => (
                <label key={permission} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.permissions.includes(permission)}
                    onCheckedChange={(checked) =>
                      togglePermission(permission, checked === true)
                    }
                  />
                  {permission}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={form.name.trim().length < 2 || save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Saving…" : "Save role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
