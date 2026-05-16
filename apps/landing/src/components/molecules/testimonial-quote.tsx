import { GlassPanel } from "@muziks/ui";
import { cn } from "@muziks/utils";

export type TestimonialQuoteProps = {
  quote: string;
  author: string;
  role: string;
  className?: string;
};

export function TestimonialQuote({
  quote,
  author,
  role,
  className,
}: TestimonialQuoteProps) {
  return (
    <GlassPanel variant="functional" className={cn("p-6 md:p-8", className)}>
      <blockquote className="text-base leading-relaxed text-on-surface md:text-lg">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <footer className="mt-4 border-t border-white/10 pt-4">
        <cite className="not-italic">
          <span className="block font-semibold text-on-surface">{author}</span>
          <span className="mt-1 block text-sm text-on-surface-variant">{role}</span>
        </cite>
      </footer>
    </GlassPanel>
  );
}
