import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/lib/api/endpoints";
import { initials } from "@/lib/format";
import type { AdminUserResponse } from "@/lib/api/types";

export const Route = createFileRoute("/admin/users")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Users — TicketNest admin" },
      {
        name: "description",
        content: "Review registered TicketNest users and assign their roles.",
      },
      { property: "og:title", content: "Users — TicketNest admin" },
      {
        property: "og:description",
        content: "Review registered users and assign their roles.",
      },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<AdminUserResponse | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const users = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => adminApi.users(page, 20),
  });
  const roles = useQuery({ queryKey: ["roles"], queryFn: adminApi.roles });

  const save = useMutation({
    mutationFn: () => adminApi.replaceRoles(editing!.id, selected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Roles updated");
      setEditing(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function openEdit(user: AdminUserResponse) {
    setEditing(user);
    setSelected((user.roles ?? []).map((role) => role.id));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Users</h1>

      <div className="mt-4 space-y-3">
        {users.isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : users.isError ? (
          <ApiErrorState error={users.error} onRetry={() => users.refetch()} />
        ) : users.data?.content.length ? (
          users.data.content.map((user) => (
            <div
              key={user.id}
              className="card-surface flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                {initials(user.firstName, user.lastName, user.email)}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email}
                </h2>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {user.roles?.length ? (
                    user.roles.map((role) => (
                      <Badge key={role.id} variant="secondary" className="text-[10px]">
                        {role.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No roles</span>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => openEdit(user)}>
                Manage roles
              </Button>
            </div>
          ))
        ) : (
          <p className="card-surface rounded-xl px-6 py-12 text-center text-sm text-muted-foreground">
            No users found.
          </p>
        )}
      </div>

      {users.data && users.data.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {users.data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= users.data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      <Dialog open={!!editing} onOpenChange={(next) => !next && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage roles</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Assigned roles</Label>
            {(roles.data ?? []).map((role) => (
              <label key={role.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selected.includes(role.id)}
                  onCheckedChange={(checked) =>
                    setSelected((prev) =>
                      checked === true
                        ? [...new Set([...prev, role.id])]
                        : prev.filter((id) => id !== role.id),
                    )
                  }
                />
                {role.name}
              </label>
            ))}
            {!roles.data?.length ? (
              <p className="text-sm text-muted-foreground">No roles available yet.</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving…" : "Save roles"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
