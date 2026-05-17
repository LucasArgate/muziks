import type { ProfileSummary } from "@muziks/types";
import { cn } from "@muziks/utils";

import { UserAvatar } from "./user-avatar";

type OwnerProfileBlockProps = {
  profile: ProfileSummary | null;
  className?: string;
};

export function OwnerProfileBlock({ profile, className }: OwnerProfileBlockProps) {
  if (!profile) {
    return null;
  }

  const label = profile.displayName ?? "Conta Spotify";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <UserAvatar
        displayName={profile.displayName}
        avatarUrl={profile.avatarUrl}
        size="md"
      />
      <p className="min-w-0 truncate text-sm font-medium text-on-surface">
        {label}
      </p>
    </div>
  );
}
