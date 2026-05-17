import type { SupabaseClient } from "@supabase/supabase-js";

export async function establishSupabaseSessionFromEmail(
  email: string,
  supabase: SupabaseClient,
  supabaseAdmin: SupabaseClient,
): Promise<void> {
  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (linkError) {
    throw new Error(`Supabase generateLink failed: ${linkError.message}`);
  }

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) {
    throw new Error("Supabase generateLink did not return hashed_token");
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: tokenHash,
  });

  if (verifyError) {
    throw verifyError;
  }
}
