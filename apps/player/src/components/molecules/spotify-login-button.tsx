type SpotifyLoginButtonProps = {
  label?: string;
  slug?: string;
};

export function SpotifyLoginButton({
  label = "Entrar com Spotify",
  slug,
}: SpotifyLoginButtonProps) {
  const params = slug ? `?slug=${encodeURIComponent(slug)}` : "";
  const href = `/api/spotify/login${params}`;

  return (
    <a
      href={href}
      className="inline-flex w-full items-center justify-center rounded-xl bg-[#1DB954] px-6 py-3 text-base font-semibold text-black transition hover:bg-[#1ed760] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DB954]"
    >
      {label}
    </a>
  );
}
