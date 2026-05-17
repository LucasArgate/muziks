"use client";

import { useState } from "react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

type IdentityGateStep = "value" | "why" | "login";

type IdentityGateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  returnTo: string;
};

export function IdentityGateDialog({
  open,
  onOpenChange,
  slug,
  returnTo,
}: IdentityGateDialogProps) {
  const [step, setStep] = useState<IdentityGateStep>("value");

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setStep("value");
    }
    onOpenChange(next);
  };

  const loginUrl = `/api/auth/spotify/login?slug=${encodeURIComponent(slug)}&returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "value" ? (
          <>
            <DialogHeader>
              <DialogTitle>Seu voto conta de verdade</DialogTitle>
              <DialogDescription>
                Você está prestes a influenciar a fila deste espaço. Cada voto
                ajuda a música que a galera quer ouvir a subir.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                Agora não
              </Button>
              <Button onClick={() => setStep("why")}>Continuar</Button>
            </DialogFooter>
          </>
        ) : null}

        {step === "why" ? (
          <>
            <DialogHeader>
              <DialogTitle>Por que pedimos identificação?</DialogTitle>
              <DialogDescription>
                Assim o espaço sabe que não é a mesma pessoa votando dezenas de
                vezes — a fila fica justa para quem está aqui. Não é sobre
                Premium nem tocar música no seu celular; é só para participar
                com responsabilidade.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep("value")}>
                Voltar
              </Button>
              <Button onClick={() => setStep("login")}>Entendi</Button>
            </DialogFooter>
          </>
        ) : null}

        {step === "login" ? (
          <>
            <DialogHeader>
              <DialogTitle>Continuar com Spotify</DialogTitle>
              <DialogDescription>
                Usamos o Spotify só para confirmar quem você é — rápido e
                seguro. Você não precisa ser Premium.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep("why")}>
                Voltar
              </Button>
              <Button asChild>
                <a href={loginUrl}>Continuar com Spotify</a>
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
