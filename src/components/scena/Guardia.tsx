import type { ReactNode } from 'react'

import { ProtezioneMancante } from '@/components/scena/ProtezioneMancante'
import { driverAttivo } from '@/lib/db'
import { verificaProtezione } from '@/lib/db/guardia-rls'

/**
 * Sta fra il layout e tutto il resto: se l'isolamento non regge, al posto
 * dell'applicazione compare la spiegazione di cosa manca.
 *
 * Col driver locale non c'e' Postgres e non c'e' niente da verificare.
 */
export async function Guardia({ children }: { children: ReactNode }) {
  if (driverAttivo() !== 'supabase') return <>{children}</>

  const verdetto = await verificaProtezione()
  if (!verdetto.protetto) return <ProtezioneMancante verdetto={verdetto} />

  return <>{children}</>
}
