import { cn } from "@muziks/utils";

import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";

type PlayerSettingsViewProps = {
  slug: string;
};

type SettingsSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Card className="border-outline/40 bg-surface-container/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-on-surface">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function PocPlaceholder({ label }: { label: string }) {
  return (
    <p
      className={cn(
        "rounded-lg border border-dashed border-outline/50 px-4 py-6 text-center text-sm text-on-surface-variant",
      )}
    >
      {label} — em breve
    </p>
  );
}

export function PlayerSettingsView({ slug }: PlayerSettingsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-on-surface">Configurações</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Player <span className="font-medium text-on-surface">{slug}</span>
        </p>
      </div>

      <SettingsSection
        title="Pessoal"
        description="Perfil, e-mail e preferências da sua conta."
      >
        <PocPlaceholder label="Dados pessoais e avatar" />
      </SettingsSection>

      <SettingsSection
        title="Player"
        description="Nome público, aparência e comportamento do player."
      >
        <PocPlaceholder label="Configurações do player" />
      </SettingsSection>

      <SettingsSection
        title="Regras do player"
        description="Fila, votação, limites e moderação."
      >
        <PocPlaceholder label="Regras e políticas de fila" />
      </SettingsSection>

      <SettingsSection
        title="Estabelecimentos"
        description="Locais vinculados a este player e permissões."
      >
        <PocPlaceholder label="Estabelecimentos e vínculos" />
      </SettingsSection>

      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive">
            Zona de perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis ou que encerram sessões ativas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={`/api/spotify/logout?slug=${encodeURIComponent(slug)}`}
            method="post"
          >
            <Button
              type="submit"
              variant="outline"
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Desconectar Spotify
            </Button>
          </form>

          <Separator className="bg-destructive/20" />

          <form action="/logout" method="post">
            <Button type="submit" variant="destructive" className="w-full">
              Sair do Muziks
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
