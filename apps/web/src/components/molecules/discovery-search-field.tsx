"use client";

import { Search } from "lucide-react";
import type { FormEvent } from "react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

type DiscoverySearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function DiscoverySearchField({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: DiscoverySearchFieldProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nome do espaço ou @slug"
          className="pl-9"
          disabled={disabled}
        />
      </div>
      <Button type="submit" disabled={disabled || !value.trim()}>
        Buscar
      </Button>
    </form>
  );
}
