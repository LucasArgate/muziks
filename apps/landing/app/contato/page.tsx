import { LandingContactPage } from "@/src/components/organisms/landing-contact-page";
import { createLandingMetadata } from "@/src/config/landing-metadata";

export const dynamic = "force-static";

export const metadata = createLandingMetadata({
  title: "Contato",
  description:
    "Fale com o time do Muziks. Quer o player democrático no seu bar? Beta fechado, parcerias e suporte para espaços.",
  path: "/contato",
  keywords: ["contato muziks", "parceria bar", "beta fechado"],
});

export default function ContatoPage() {
  return <LandingContactPage />;
}
