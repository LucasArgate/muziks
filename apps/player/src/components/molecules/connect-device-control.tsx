"use client";

import type { PlaybackSyncMode } from "@muziks/types";
import { cn } from "@muziks/utils";
import { ChevronRight, Speaker } from "lucide-react";
import { useState } from "react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

import { DeviceSelector } from "@/src/features/playback/components/DeviceSelector";

const modeLabels: Record<PlaybackSyncMode, string> = {
  api_device: "Spotify Connect",
  sdk: "Navegador",
  hybrid: "Híbrido",
};

type ConnectDeviceControlProps = {
  syncMode: PlaybackSyncMode;
  deviceName?: string | null;
  onSelectDevice: (deviceId: string, deviceName: string) => Promise<void>;
  className?: string;
};

export function ConnectDeviceControl({
  syncMode,
  deviceName,
  onSelectDevice,
  className,
}: ConnectDeviceControlProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-auto w-full justify-start gap-3 rounded-lg border-primary/50 bg-primary/10 px-3 py-2.5 text-left hover:bg-primary/15",
            className,
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <Speaker className="h-4 w-4 text-primary" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold uppercase tracking-wide text-primary">
              {modeLabels[syncMode]}
            </span>
            <span className="block truncate text-sm font-medium text-on-surface">
              {deviceName ?? "Escolher dispositivo"}
            </span>
          </span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-on-surface-variant"
            aria-hidden
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-outline/40 bg-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-on-surface">
            Dispositivo de reprodução
          </DialogTitle>
          <DialogDescription>
            O áudio toca no aparelho escolhido. Este painel controla a sessão.
          </DialogDescription>
        </DialogHeader>
        <DeviceSelector
          embedded
          onSelect={async (deviceId, name) => {
            await onSelectDevice(deviceId, name);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
