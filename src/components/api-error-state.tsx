import { AlertTriangle } from "lucide-react";

import { ApiSettingsDialog } from "@/components/api-settings-dialog";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/config";

export function ApiErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const apiError = error instanceof ApiError ? error : null;
  const offline = apiError?.offline ?? true;
  const message =
    apiError?.message ??
    (error instanceof Error ? error.message : "Something went wrong.");

  return (
    <div className="card-surface flex flex-col items-center gap-3 rounded-xl px-6 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <AlertTriangle className="size-5" />
      </span>
      <h3 className="text-base font-semibold">
        {offline ? "Can't reach your server" : "That didn't work"}
      </h3>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {offline ? (
        <p className="text-xs text-muted-foreground">
          Currently trying <code className="font-mono">{getApiBaseUrl()}</code>
        </p>
      ) : null}
      <div className="mt-2 flex gap-2">
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        <ApiSettingsDialog trigger={<Button>Change API address</Button>} />
      </div>
    </div>
  );
}
