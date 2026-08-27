/**
 * Capacita' di Risparmio Media.
 *
 *   entrate_totali  = somma redditi da lavoro + somma rendite
 *   uscite_totali   = somma uscite
 *   crm_mensile     = entrate_totali - uscite_totali
 *   crm_annuale     = crm_mensile * 12
 *   crm_percentuale = crm_mensile / entrate_totali
 */

import { RENDITE_KEYS, USCITE_KEYS } from '@/lib/domain'
import type { Finances } from '@/lib/domain'
import type { FinancesInput } from '@/lib/db/types'

export interface RisultatoCrm {
  entrate_totali: number
  uscite_totali: number
  crm_mensile: number
  crm_annuale: number
  /** frazione delle entrate. 0 quando non entra nulla. */
  crm_percentuale: number
}

export function calcolaCrm(input: FinancesInput): RisultatoCrm {
  const redditi = input.redditi.reduce((tot, r) => tot + sano(r.importo), 0)
  const rendite = RENDITE_KEYS.reduce((tot, k) => tot + sano(input.rendite[k]), 0)
  const uscite = USCITE_KEYS.reduce((tot, k) => tot + sano(input.uscite[k]), 0)

  const entrate_totali = redditi + rendite
  const uscite_totali = uscite
  const crm_mensile = entrate_totali - uscite_totali

  return {
    entrate_totali,
    uscite_totali,
    crm_mensile,
    crm_annuale: crm_mensile * 12,
    crm_percentuale: entrate_totali > 0 ? crm_mensile / entrate_totali : 0,
  }
}

export function conCrm(sessionId: string, input: FinancesInput): Finances {
  const r = calcolaCrm(input)
  return {
    session_id: sessionId,
    redditi: input.redditi,
    rendite: input.rendite,
    uscite: input.uscite,
    crm_mensile: r.crm_mensile,
    crm_annuale: r.crm_annuale,
    crm_percentuale: r.crm_percentuale,
  }
}

/** Gli importi arrivano da input utente: niente NaN, niente negativi, niente decimali. */
function sano(v: number | undefined): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return 0
  return Math.round(v)
}

const formattatoreEuro = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

export function euro(v: number): string {
  return formattatoreEuro.format(Math.round(v))
}

export function percentuale(frazione: number): string {
  return `${Math.round(frazione * 100)}%`
}
