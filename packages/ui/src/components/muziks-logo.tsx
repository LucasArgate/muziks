import { cn } from "@muziks/utils";

export type MuziksLogoProps = {
  className?: string;
  src?: string;
};

export function MuziksLogo({
  className,
  src = "/brand/muziks-white.png",
}: MuziksLogoProps) {
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
