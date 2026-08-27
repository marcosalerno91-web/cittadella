import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function supabaseConfigurato(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

/** Client legato ai cookie della richiesta: eredita l'utente collegato e quindi la RLS. */
export async function clientSupabase() {
  const jar = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return jar.getAll()
        },
        setAll(cookiesDaScrivere) {
          try {
            for (const { name, value, options } of cookiesDaScrivere) {
              jar.set(name, value, options)
            }
          } catch {
            // chiamato da un Server Component: il refresh del token lo fa il middleware
          }
        },
      },
    },
  )
}
