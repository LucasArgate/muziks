import { LandingPageTemplate } from "@/src/components/templates/landing-page-template";
import { createLandingMetadata } from "@/src/config/landing-metadata";
import { LANDING_SITE } from "@/src/config/landing-site";

export const dynamic = "force-static";

export const metadata = createLandingMetadata({
  title: `${LANDING_SITE.name} — ${LANDING_SITE.tagline}`,
  description: LANDING_SITE.description,
  path: "/",
  keywords: [
    "música compartilhada",
    "regras claras fila",
    "player.muziks.app",
    "muziks.app",
  ],
});

export default function HomePage() {
  return <LandingPageTemplate />;
}
