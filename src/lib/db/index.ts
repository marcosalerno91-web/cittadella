/**
 * Scelta del driver.
 *
 * Con le variabili Supabase impostate si usa Postgres con RLS. Senza, l'app
 * parte comunque su file locale: e' la modalita' di sviluppo, documentata in
 * DECISIONI.md (D1). Il resto del codice non sa quale dei due sta usando.
 */

import { localAuth, localRepository } from '@/lib/db/local'
import { supabaseConfigurato } from '@/lib/db/supabase-client'
import type { AuthAdapter, Repository } from '@/lib/db/types'

export function driverAttivo(): 'supabase' | 'locale' {
  return supabaseConfigurato() ? 'supabase' : 'locale'
}

export async function repository(): Promise<Repository> {
  if (supabaseConfigurato()) {
    const { supabaseRepository } = await import('@/lib/db/supabase')
    return supabaseRepository
  }
  return localRepository
}

export async function auth(): Promise<AuthAdapter> {
  if (supabaseConfigurato()) {
    const { supabaseAuth } = await import('@/lib/db/supabase')
    return supabaseAuth
  }
  return localAuth
}
