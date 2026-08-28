/**
 * Guardia sull'isolamento.
 *
 * Le query del driver Supabase non filtrano per agency_id: lo fa Postgres con
 * le policy RLS (vedi DECISIONI.md, D2). E' la scelta giusta, ma ha un fianco
 * scoperto: se qualcuno collega le credenziali Supabase senza aver eseguito
 * 0001_init.sql, l'applicazione gira senza alcun isolamento, in silenzio.
 *
 * Questa guardia chiude quel fianco. Gira una volta per processo, prima di
 * qualunque accesso ai dati, e se manca anche una sola condizione l'applicazione
 * non parte.
 */

import { clientSupabase } from '@/lib/db/supabase-client'

/** Le tabelle del modello e la policy che ciascuna deve avere. */
const PROTEZIONE_ATTESA: Record<string, string> = {
  agencies: 'agencies_select',
  advisors: 'advisors_select',
  clients: 'clients_rw',
  sessions: 'sessions_rw',
  family_members: 'family_members_rw',
  finances: 'finances_rw',
  fortress_items: 'fortress_items_rw',
  emotions: 'emotions_rw',
}

export interface Mancanza {
  tabella: string
  motivo: 'tabella assente' | 'RLS spenta' | 'policy mancante'
  dettaglio: string
}

export type Verdetto =
  | { protetto: true }
  | { protetto: false; causa: 'migration' | 'policy'; mancanze: Mancanza[]; messaggio: string }

interface RigaStato {
  tabella: string
  rls_attiva: boolean
  policy_presenti: string[]
}

/**
 * Una sola verifica per processo.
 *
 * Nota: in sviluppo Next.js puo' caricare questo modulo in piu' grafi, quindi
 * la verifica puo' ripetersi una volta per grafo. Resta comunque lontanissima
 * dall'essere per query, che era il punto.
 */
let inCorso: Promise<Verdetto> | null = null

export function verificaProtezione(): Promise<Verdetto> {
  inCorso ??= esegui()
  return inCorso
}

/** Solo per i test: fa ripetere la verifica. */
export function dimenticaVerifica(): void {
  inCorso = null
}

async function esegui(): Promise<Verdetto> {
  const sb = await clientSupabase()
  const { data, error } = await sb.rpc('stato_protezione')

  if (error) {
    // la funzione non esiste: la migration non e' mai stata eseguita
    return {
      protetto: false,
      causa: 'migration',
      mancanze: Object.keys(PROTEZIONE_ATTESA).map((tabella) => ({
        tabella,
        motivo: 'tabella assente' as const,
        dettaglio: 'lo schema non e’ stato creato',
      })),
      messaggio: error.message,
    }
  }

  const righe = (data ?? []) as RigaStato[]
  const perTabella = new Map(righe.map((r) => [r.tabella, r]))
  const mancanze: Mancanza[] = []

  for (const [tabella, policyAttesa] of Object.entries(PROTEZIONE_ATTESA)) {
    const riga = perTabella.get(tabella)

    if (!riga) {
      mancanze.push({
        tabella,
        motivo: 'tabella assente',
        dettaglio: 'la tabella non esiste nello schema public',
      })
      continue
    }

    if (!riga.rls_attiva) {
      mancanze.push({
        tabella,
        motivo: 'RLS spenta',
        dettaglio: 'row level security non e’ attiva: chiunque leggerebbe tutto',
      })
      continue
    }

    if (!riga.policy_presenti.includes(policyAttesa)) {
      mancanze.push({
        tabella,
        motivo: 'policy mancante',
        dettaglio:
          riga.policy_presenti.length > 0
            ? `manca ${policyAttesa}; presenti: ${riga.policy_presenti.join(', ')}`
            : `manca ${policyAttesa}; nessuna policy sulla tabella`,
      })
    }
  }

  if (mancanze.length === 0) return { protetto: true }

  const tutteAssenti = mancanze.every((m) => m.motivo === 'tabella assente')
  return {
    protetto: false,
    causa: tutteAssenti ? 'migration' : 'policy',
    mancanze,
    messaggio: `${mancanze.length} tabelle su ${Object.keys(PROTEZIONE_ATTESA).length} non sono protette`,
  }
}
