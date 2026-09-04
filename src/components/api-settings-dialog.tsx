import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_API_BASE_URL,
  getApiBaseUrl,
  setApiBaseUrl,
} from "@/lib/api/config";

export function ApiSettingsDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const queryClient = useQueryClient();

  function onOpenChange(next: boolean) {
    if (next) setValue(getApiBaseUrl());
    setOpen(next);
  }

  function save() {
    setApiBaseUrl(value);
    queryClient.invalidateQueries();
    toast.success("API address saved", {
      description: value.trim() || DEFAULT_API_BASE_URL,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" aria-label="API connection settings">
            <Settings2 className="size-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API connection</DialogTitle>
          <DialogDescription>
            TicketNest talks to your own server. Point it at wherever your API is
            running.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="api-base-url">API address</Label>
          <Input
            id="api-base-url"
            value={value}
            placeholder={DEFAULT_API_BASE_URL}
            onChange={(e) => setValue(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your server must allow requests from this site (CORS). While it is on
            your own machine, open this app locally so the address is reachable.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setValue(DEFAULT_API_BASE_URL)}
            type="button"
          >
            Reset
          </Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
