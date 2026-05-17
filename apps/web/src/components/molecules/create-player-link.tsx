import { getPlayerAppUrl } from "@/src/config/env";

export function CreatePlayerLink() {
  const playerUrl = getPlayerAppUrl();

  return (
    <p className="text-sm text-on-surface-variant">
      ou{" "}
      <a
        href={playerUrl}
        className="font-medium text-primary hover:underline"
      >
        crie o seu player
      </a>
    </p>
  );
}
