"use client";

import { useActionState } from "react";

import {
  createPlayerAction,
  type CreatePlayerResult,
} from "@/src/lib/auth/create-player";

const initialState: CreatePlayerResult = { ok: true };

export function CreatePlayerForm() {
  const [state, formAction, pending] = useActionState(
    createPlayerAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="displayName"
          className="mb-1 block text-sm font-medium text-on-surface"
        >
          Nome do espaço
        </label>
        <input
          id="displayName"
          name="displayName"
          required
          maxLength={120}
          className="w-full rounded-lg border border-outline/60 bg-surface/40 px-3 py-2 text-on-surface"
          placeholder="Bar do Zé"
        />
      </div>
      <div>
        <label
          htmlFor="slug"
          className="mb-1 block text-sm font-medium text-on-surface"
        >
          Slug (URL)
        </label>
        <input
          id="slug"
          name="slug"
          required
          minLength={3}
          maxLength={50}
          pattern="[a-z0-9][a-z0-9-]{1,48}[a-z0-9]"
          className="w-full rounded-lg border border-outline/60 bg-surface/40 px-3 py-2 font-mono text-sm text-on-surface"
          placeholder="bar-do-ze"
        />
        <p className="mt-1 text-xs text-on-surface-variant">
          Letras minúsculas, números e hífens. Reservados: login, logout, create,
          register, forget.
        </p>
      </div>

      {state.ok === false ? (
        <p className="text-sm text-red-300" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-on-primary transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Criando…" : "Criar player"}
      </button>
    </form>
  );
}
