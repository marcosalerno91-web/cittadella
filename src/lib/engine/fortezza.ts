/**
 * Livello di completamento delle mura.
 *
 * Questi numeri NON vengono mai mostrati al cliente: servono al dossier del
 * consulente e a decidere quali sagome proporre nella fase delle priorita'.
 */

import { BLOCCHI_FORTEZZA } from '@/config/engine'
import type { BloccoKey, FortressItem, StatoVoce } from '@/lib/domain'

export interface StatoBlocco {
  blocco: BloccoKey
  presenti: number
  assenti: number
  non_so: number
  senza_risposta: number
  totale: number
  /** frazione 0..1 delle voci con stato 'presente' */
  completamento: number
  /** true quando ogni voce della cinta ha una risposta */
  completata: boolean
}

export function statoBlocco(items: FortressItem[], blocco: BloccoKey): StatoBlocco {
  const definizione = BLOCCHI_FORTEZZA.find((b) => b.key === blocco)
  const voci = definizione ? definizione.voci : []
  const perVoce = new Map(items.filter((i) => i.blocco === blocco).map((i) => [i.voce_key, i.stato]))

  let presenti = 0
  let assenti = 0
  let non_so = 0
  let senza_risposta = 0

  for (const voce of voci) {
    const stato = perVoce.get(voce) ?? null
    if (stato === 'presente') presenti += 1
    else if (stato === 'assente') assenti += 1
    else if (stato === 'non_so') non_so += 1
    else senza_risposta += 1
  }

  const totale = voci.length
  return {
    blocco,
    presenti,
    assenti,
    non_so,
    senza_risposta,
    totale,
    completamento: totale > 0 ? presenti / totale : 0,
    completata: senza_risposta === 0 && totale > 0,
  }
}

export function statoTutteLeCinte(items: FortressItem[]): StatoBlocco[] {
  return BLOCCHI_FORTEZZA.map((b) => statoBlocco(items, b.key))
}

/** Completamento complessivo, pesato per importanza della cinta. */
export function completamentoPesato(items: FortressItem[]): number {
  const pesoTotale = BLOCCHI_FORTEZZA.reduce((t, b) => t + b.peso, 0)
  if (pesoTotale === 0) return 0
  const somma = BLOCCHI_FORTEZZA.reduce(
    (t, b) => t + b.peso * statoBlocco(items, b.key).completamento,
    0,
  )
  return somma / pesoTotale
}

export function statoDiVoce(items: FortressItem[], voceKey: string): StatoVoce | null {
  return items.find((i) => i.voce_key === voceKey)?.stato ?? null
}


