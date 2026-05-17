import { AuthPageShell } from "@/src/components/molecules/auth-page-shell";
import { CreatePlayerForm } from "@/src/components/molecules/create-player-form";
import { requireMuziksSession } from "@/src/lib/auth/require-session";

export default async function CreatePlayerPage() {
  const session = await requireMuziksSession();

  if (session.status === "authenticated") {
    const { redirect } = await import("next/navigation");
    redirect(`/${session.player.slug}`);
  }

  return (
    <AuthPageShell
      title="Criar seu player"
      subtitle="Escolha um slug único para o link do seu espaço (ex.: bar-do-ze)."
    >
      <CreatePlayerForm />
    </AuthPageShell>
  );
}
