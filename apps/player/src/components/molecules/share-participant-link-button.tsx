"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/src/components/ui/button";
import { tryGetParticipantPlayerUrl } from "@/src/config/app-urls";

type ShareParticipantLinkButtonProps = {
  slug: string;
  className?: string;
};

export function ShareParticipantLinkButton({
  slug,
  className,
}: ShareParticipantLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = tryGetParticipantPlayerUrl(slug);

  if (!shareUrl) {
    return null;
  }

  const share = async () => {
    const url = shareUrl;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Muziks — ${slug}`,
          text: "Entre na fila e vote na música do espaço.",
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={() => void share()}
      aria-label={copied ? "Link copiado" : "Compartilhar link da fila"}
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <Share2 className="h-4 w-4" aria-hidden />
      )}
      {copied ? "Link copiado" : "Compartilhar fila"}
    </Button>
  );
}
