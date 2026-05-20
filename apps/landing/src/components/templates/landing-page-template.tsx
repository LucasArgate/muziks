import { LandingClosedBetaSection } from "@/src/components/organisms/landing-closed-beta-section";
import { LandingCreateSpaceSection } from "@/src/components/organisms/landing-create-space-section";
import { LandingFooter } from "@/src/components/organisms/landing-footer";
import { LandingForBarsSection } from "@/src/components/organisms/landing-for-bars-section";
import { LandingHeader } from "@/src/components/organisms/landing-header";
import { LandingHero } from "@/src/components/organisms/landing-hero";
import { LandingHowItWorksSection } from "@/src/components/organisms/landing-how-it-works-section";
import { LandingManifestoCtaSection } from "@/src/components/organisms/landing-manifesto-cta-section";
import { LandingQueuePreviewSection } from "@/src/components/organisms/landing-queue-preview-section";
import { LandingTestimonialSection } from "@/src/components/organisms/landing-testimonial-section";

export function LandingPageTemplate() {
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-surface text-on-surface">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingHowItWorksSection />
        <LandingQueuePreviewSection />
        <LandingForBarsSection />
        <LandingTestimonialSection />
        <LandingCreateSpaceSection />
        <LandingClosedBetaSection />
        <LandingManifestoCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
