/**
 * Parametri del motore.
 *
 * Tutto quello che si puo' voler tarare senza toccare la logica vive qui:
 * eta' di confine del ciclo di vita, soglie della scorta, ordine e peso delle
 * cinte, elenco delle voci della fortezza, tempi delle animazioni.
 *
 * Regola: qui NON si scrive testo destinato allo schermo. Quello sta in
 * src/content/copy.ts.
 */

import type { BloccoKey, ProfessioneKey } from '@/lib/domain'

// ---------------------------------------------------------------- ciclo vita

export type FaseVita = 'studio' | 'lavoro' | 'tempo_libero'

export const CICLO_VITA = {
  /** estremi dell'asse X della scena */
  eta_minima: 0,
  eta_massima: 90,
  /** confini fra le tre campiture */
  fine_studio: 25,
  fine_lavoro: 67,
} as const

export function faseVita(eta: number): FaseVita {
  if (eta < CICLO_VITA.fine_studio) return 'studio'
  if (eta < CICLO_VITA.fine_lavoro) return 'lavoro'
  return 'tempo_libero'
}

// ---------------------------------------------------------------- avatar

export const AVATAR = {
  /** sotto questa eta' la professione viene auto-suggerita come 'bambino' */
  eta_bambino: 6,
  /** sotto questa eta' la professione viene auto-suggerita come 'studente' */
  eta_studente: 19,
  /** fasce di silhouette */
  fascia_bambino: 11,
  fascia_ragazzo: 19,
  fascia_senior: 66,
  /** professione suggerita per chi ha superato l'eta' di lavoro */
  professione_pensione: 'tempo_libero' as ProfessioneKey,
} as const

// ---------------------------------------------------------------- CRM

/**
 * Soglie sulla capacita' di risparmio media, espresse come frazione delle
 * entrate totali. La scena della scorta si legge su queste.
 */
export const CRM_SOGLIE = {
  esile: 0.05,
  solida: 0.15,
} as const

export type LivelloScorta = 'impegnata' | 'esile' | 'solida' | 'abbondante'

export function livelloScorta(crmPercentuale: number, crmMensile: number): LivelloScorta {
  if (crmMensile <= 0) return 'impegnata'
  if (crmPercentuale < CRM_SOGLIE.esile) return 'esile'
  if (crmPercentuale < CRM_SOGLIE.solida) return 'solida'
  return 'abbondante'
}

/** Riempimento del granaio, 0..1. Oltre il 25% di CRM il granaio e' pieno. */
export const SCORTA_RIEMPIMENTO_PIENO = 0.25

// ---------------------------------------------------------------- fortezza

export interface VoceFortezza {
  key: string
  blocco: BloccoKey
}

export interface DefinizioneBlocco {
  key: BloccoKey
  /** ordine di costruzione, dal centro verso l'esterno */
  ordine: number
  /**
   * Peso relativo della cinta nel calcolo del livello di completamento.
   * Non viene mai mostrato al cliente: serve solo ai PDF del consulente.
   */
  peso: number
  voci: readonly string[]
}

export const BLOCCHI_FORTEZZA: readonly DefinizioneBlocco[] = [
  {
    key: 'mastio',
    ordine: 1,
    peso: 4,
    voci: ['tcm', 'ltc', 'critical_illness', 'invalidita_permanente_grave'],
  },
  {
    key: 'salute',
    ordine: 2,
    peso: 3,
    voci: ['rimborso_spese_mediche', 'grandi_interventi', 'ipi_infortunio', 'assistenza'],
  },
  {
    key: 'risparmio',
    ordine: 3,
    peso: 2,
    voci: ['pip', 'pac', 'premi_unici'],
  },
  {
    key: 'perimetro',
    ordine: 4,
    peso: 1,
    voci: ['rc_capofamiglia', 'casa', 'tutela_legale'],
  },
] as const

/** Elenco piatto di tutte le voci, nell'ordine in cui si affrontano. */
export const VOCI_FORTEZZA: readonly VoceFortezza[] = BLOCCHI_FORTEZZA.flatMap((b) =>
  b.voci.map((key) => ({ key, blocco: b.key })),
)

export function bloccoDiVoce(voceKey: string): BloccoKey | null {
  return VOCI_FORTEZZA.find((v) => v.key === voceKey)?.blocco ?? null
}

export function definizioneBlocco(blocco: BloccoKey): DefinizioneBlocco {
  const trovato = BLOCCHI_FORTEZZA.find((b) => b.key === blocco)
  if (!trovato) throw new Error(`Blocco sconosciuto: ${blocco}`)
  return trovato
}

// ---------------------------------------------------------------- fase 5

/** Numero massimo di emozioni selezionabili per ciascuna delle due domande. */
export const MAX_EMOZIONI = 3

// ---------------------------------------------------------------- tempi

export const TEMPI = {
  /** transizione fra una fase e l'altra */
  transizione_fase_ms: 520,
  /** sfalsamento fra un avatar e il successivo quando volano sulla curva */
  stagger_avatar_ms: 150,
  /** posa di un mattone sulla cinta */
  posa_mattone_ms: 460,
  /** attesa prima di salvare su rete dopo l'ultima digitazione */
  autosave_debounce_ms: 700,
} as const
