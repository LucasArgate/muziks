import { LandingDjSection } from "@/src/components/organisms/landing-dj-section";
import { LandingFeatureSection } from "@/src/components/organisms/landing-feature-section";
import { LandingFooter } from "@/src/components/organisms/landing-footer";
import { LandingHeader } from "@/src/components/organisms/landing-header";
import { LandingHero } from "@/src/components/organisms/landing-hero";

export function LandingPageTemplate() {
  return (
    <div className="min-h-screen bg-surface">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingFeatureSection />
        <LandingDjSection />
      </main>
      <LandingFooter />
    </div>
  );
}
