import { cn } from "@muziks/utils";

export type MuziksLogoProps = {
  className?: string;
  src?: string;
};

export function MuziksLogo({ className, src }: MuziksLogoProps) {
  if (src) {
    return (
      <img
        src={src}
        alt="Muziks"
        width={200}
        height={48}
        className={cn("h-10 w-auto md:h-12", className)}
      />
    );
  }

  return (
    <svg
      role="img"
      aria-label="Muziks"
      viewBox="0 0 200 48"
      className={cn("h-10 w-auto md:h-12", className)}
      fill="currentColor"
    >
      <rect x="0" y="8" width="6" height="32" rx="1" opacity="0.9" />
      <rect x="10" y="14" width="6" height="26" rx="1" opacity="0.7" />
      <rect x="20" y="4" width="6" height="36" rx="1" />
      <text
        x="36"
        y="34"
        fontSize="28"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
        letterSpacing="-0.02em"
      >
        muziks
      </text>
    </svg>
  );
}
