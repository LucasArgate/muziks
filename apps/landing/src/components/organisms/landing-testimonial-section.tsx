import { testimonialContent } from "@/src/config/landing-content";

export function LandingTestimonialSection() {
  const { quote, author, role } = testimonialContent;

  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="muziks-liquid-glass relative p-8 sm:p-12">
          <svg
            aria-hidden
            className="absolute -top-4 left-8 h-10 w-10 text-primary/70"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M7 7h4v4H7c0 2 1 4 3 5l-1 2c-3-1-5-4-5-7V7zm9 0h4v4h-4c0 2 1 4 3 5l-1 2c-3-1-5-4-5-7V7z" />
          </svg>
          <blockquote className="text-balance text-xl leading-relaxed text-on-surface/90 md:text-2xl">
            {quote}
          </blockquote>
          <footer className="mt-8 flex items-center gap-4">
            <span
              className="inline-block h-12 w-12 rounded-full border border-white/15"
              style={{
                background: "linear-gradient(135deg,#0066B2 0%, #1a1a1a 100%)",
              }}
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold text-on-surface">{author}</p>
              <p className="text-xs text-on-surface-variant">{role}</p>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
