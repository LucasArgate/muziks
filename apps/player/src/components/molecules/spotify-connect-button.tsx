"use client";

import { Button } from "@/src/components/ui/button";

type SpotifyConnectButtonProps = {
  slug: string;
};

export function SpotifyConnectButton({ slug }: SpotifyConnectButtonProps) {
  const href = `/api/spotify/login?slug=${encodeURIComponent(slug)}`;

  return (
    <Button
      asChild
      className="h-auto w-full rounded-xl bg-[#1DB954] px-6 py-3 text-base font-semibold text-black hover:bg-[#1ed760]"
    >
      <a
        href={href}
        onClick={(event) => {
          event.preventDefault();
          window.location.assign(href);
        }}
      >
        Conectar conta Spotify
      </a>
    </Button>
  );
}
