import { VOCI_FORTEZZA } from '@/config/engine'
import type { Emotions, Finances, FortressItem } from '@/lib/domain'

export function financesVuote(sessionId: string): Finances {
  return {
    session_id: sessionId,
    redditi: [],
    rendite: { affitti: 0, cedole_dividendi: 0, altre_rendite: 0 },
    uscite: { casa: 0, auto: 0, finanziamenti: 0, vita: 0 },
    crm_mensile: 0,
    crm_annuale: 0,
    crm_percentuale: 0,
  }
}

export function emotionsVuote(sessionId: string): Emotions {
  return {
    session_id: sessionId,
    sentire_attuale: '',
    sentire_desiderato: '',
    emozioni_scelte: [],
    emozioni_desiderate: [],
    priorita_dichiarate: [],
  }
}

/** Una riga per ogni voce prevista, tutte senza risposta. */
export function fortezzaVuota(sessionId: string): FortressItem[] {
  return VOCI_FORTEZZA.map((v) => ({
    id: `${sessionId}:${v.key}`,
    session_id: sessionId,
    blocco: v.blocco,
    voce_key: v.key,
    stato: null,
    nota: null,
    desiderata: false,
  }))
}

/**
 * Allinea le righe salvate all'elenco voci corrente: se una voce e' stata
 * aggiunta a engine.ts dopo la creazione della sessione, compare vuota;
 * se e' stata tolta, sparisce dalla scena ma resta nel database.
 */
export function fortezzaAllineata(sessionId: string, salvate: FortressItem[]): FortressItem[] {
  const perChiave = new Map(salvate.map((i) => [i.voce_key, i]))
  return VOCI_FORTEZZA.map((v) => {
    const esistente = perChiave.get(v.key)
    if (esistente) return { ...esistente, blocco: v.blocco, desiderata: esistente.desiderata ?? false }
    return {
      id: `${sessionId}:${v.key}`,
      session_id: sessionId,
      blocco: v.blocco,
      voce_key: v.key,
      stato: null,
      nota: null,
      desiderata: false,
    }
  })
}
