import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function decrypt(encryptedText: string): Promise<string> {
  const { data, error } = await supabase.rpc('pgp_sym_decrypt', {
    encrypted_text: encryptedText,
    secret_key: process.env.AI_ENCRYPTION_KEY,
  });
  if (error) throw new Error('Decryption failed: ' + error.message);
  return data as string;
}

export async function encrypt(plainText: string): Promise<string> {
  const { data, error } = await supabase.rpc('pgp_sym_encrypt', {
    plaintext: plainText,
    secret_key: process.env.AI_ENCRYPTION_KEY,
  });
  if (error) throw new Error('Encryption failed: ' + error.message);
  return data as string;
}
