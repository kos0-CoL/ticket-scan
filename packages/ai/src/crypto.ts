import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente perezoso: crearlo a nivel de módulo rompe `next build` si las env vars aún no existen.
let supabase: SupabaseClient | undefined;
function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

export async function decrypt(encryptedText: string): Promise<string> {
  const { data, error } = await getSupabase().rpc('pgp_sym_decrypt', {
    encrypted_text: encryptedText,
    secret_key: process.env.AI_ENCRYPTION_KEY,
  });
  if (error) throw new Error('Decryption failed: ' + error.message);
  return data as string;
}

export async function encrypt(plainText: string): Promise<string> {
  const { data, error } = await getSupabase().rpc('pgp_sym_encrypt', {
    plaintext: plainText,
    secret_key: process.env.AI_ENCRYPTION_KEY,
  });
  if (error) throw new Error('Encryption failed: ' + error.message);
  return data as string;
}
