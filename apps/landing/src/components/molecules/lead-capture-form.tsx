import Link from "next/link";
import { GlassPanel } from "@muziks/ui";
import { cn } from "@muziks/utils";
import { LandingButton } from "@/src/components/atoms/landing-button";
import { LandingInput } from "@/src/components/atoms/landing-input";

export type LeadCaptureFormProps = {
  formId: string;
  ctaLabel: string;
  loginHref?: string;
  privacyHref?: string;
  className?: string;
};

const privacyCopy =
  "Ao continuar, eu concordo que o Muziks e seus representantes podem entrar em contato comigo por e-mail, telefone ou SMS (inclusive por sistemas automáticos) no endereço de e-mail ou número que eu forneci, inclusive para finalidades de marketing. Declaro que li e concordo com a Declaração de privacidade.";

export function LeadCaptureForm({
  formId,
  ctaLabel,
  loginHref = "/entrar",
  privacyHref = "/privacidade",
  className,
}: LeadCaptureFormProps) {
  return (
    <GlassPanel variant="liquid" className={cn("p-6 md:p-8", className)}>
      <form id={formId} className="space-y-4" action="#" method="post">
        <LandingInput
          name={`${formId}-email`}
          type="email"
          label="E-mail"
          autoComplete="email"
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <LandingInput
            name={`${formId}-first-name`}
            label="Nome"
            autoComplete="given-name"
            required
          />
          <LandingInput
            name={`${formId}-last-name`}
            label="Sobrenome"
            autoComplete="family-name"
            required
          />
        </div>
        <LandingButton>{ctaLabel}</LandingButton>
      </form>

      <p className="mt-4 text-center text-sm text-on-surface-variant">
        Tem uma conta?{" "}
        <Link href={loginHref} className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>

      <p className="mt-4 text-xs leading-relaxed text-on-surface-variant/90">
        {privacyCopy}{" "}
        <Link href={privacyHref} className="text-primary hover:underline">
          Declaração de privacidade
        </Link>
        .
      </p>
    </GlassPanel>
  );
}
