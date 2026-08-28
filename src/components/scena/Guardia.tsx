import type { ReactNode } from 'react'

import { ConfigurazioneMancante } from '@/components/scena/ConfigurazioneMancante'
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
  if (driverAttivo() !== 'supabase') {
    // Il driver a file e' per lo sviluppo. In produzione girerebbe su un disco
    // effimero e perderebbe le consulenze in silenzio: meglio non partire.
    if (process.env.NODE_ENV === 'production') return <ConfigurazioneMancante />
    return <>{children}</>
  }

  const verdetto = await verificaProtezione()
  if (!verdetto.protetto) return <ProtezioneMancante verdetto={verdetto} />

  return <>{children}</>
}
