import { cn, getDisplayInitials } from "@muziks/utils";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";

type UserAvatarProps = {
  displayName: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
};

export function UserAvatar({
  displayName,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const initials = getDisplayInitials(displayName);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
