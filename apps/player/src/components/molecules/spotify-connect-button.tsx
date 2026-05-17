"use client";

type SpotifyConnectButtonProps = {
  slug: string;
};

export function SpotifyConnectButton({ slug }: SpotifyConnectButtonProps) {
  const href = `/api/spotify/login?slug=${encodeURIComponent(slug)}`;

  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        window.location.assign(href);
      }}
      className="inline-flex w-full items-center justify-center rounded-xl bg-[#1DB954] px-6 py-3 text-base font-semibold text-black transition hover:bg-[#1ed760] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DB954]"
    >
      Conectar conta Spotify
    </a>
  );
}
