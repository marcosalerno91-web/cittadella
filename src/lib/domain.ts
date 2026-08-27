/**
 * Tipi di dominio condivisi fra client, server e motori.
 * Nessun accesso a rete o database qui dentro: solo forma dei dati.
 */

// ---------------------------------------------------------------- anagrafica

export type RuoloFamiglia =
  | 'intestatario'
  | 'partner'
  | 'figlio'
  | 'genitore'
  | 'altro'

export const RUOLI_FAMIGLIA: readonly RuoloFamiglia[] = [
  'intestatario',
  'partner',
  'figlio',
  'genitore',
  'altro',
] as const

/** Le 21 professioni v1 + il fallback neutro. */
export type ProfessioneKey =
  | 'studente'
  | 'bambino'
  | 'medico'
  | 'infermiere'
  | 'insegnante'
  | 'impiegato'
  | 'operaio'
  | 'artigiano'
  | 'agricoltore'
  | 'commerciante'
  | 'ristoratore'
  | 'avvocato'
  | 'commercialista'
  | 'tecnico_progettista'
  | 'forze_ordine'
  | 'autotrasportatore'
  | 'benessere'
  | 'informatico'
  | 'sport'
  | 'cura_casa'
  | 'tempo_libero'
  | 'casual'

export const PROFESSIONI: readonly ProfessioneKey[] = [
  'bambino',
  'studente',
  'medico',
  'infermiere',
  'insegnante',
  'impiegato',
  'operaio',
  'artigiano',
  'agricoltore',
  'commerciante',
  'ristoratore',
  'avvocato',
  'commercialista',
  'tecnico_progettista',
  'forze_ordine',
  'autotrasportatore',
  'benessere',
  'informatico',
  'sport',
  'cura_casa',
  'tempo_libero',
  'casual',
] as const

export function isProfessioneKey(v: string): v is ProfessioneKey {
  return (PROFESSIONI as readonly string[]).includes(v)
}

/** Semi deterministici per l'aspetto dell'avatar. */
export interface AvatarSeed {
  /** indice 0-5 nella palette pelle */
  pelle: number
  /** indice 0-5 nella palette capelli */
  capelli: number
  /** indice 0-5 nei tagli disponibili */
  taglio: number
}

export interface FamilyMember {
  id: string
  session_id: string
  nome: string
  eta: number
  professione_key: ProfessioneKey
  /** testo libero digitato dal consulente quando la professione non e' in elenco */
  professione_libera: string | null
  ruolo_famiglia: RuoloFamiglia
  avatar_seed: AvatarSeed
  ordine: number
}

// ---------------------------------------------------------------- finanze

/** Reddito da lavoro, agganciato a un membro del nucleo. */
export interface VoceReddito {
  member_id: string
  importo: number
}

/** Rendite passive e uscite: chiavi fisse, importi mensili medi. */
export type RenditaKey = 'affitti' | 'cedole_dividendi' | 'altre_rendite'
export type UscitaKey = 'casa' | 'auto' | 'finanziamenti' | 'vita'

export const RENDITE_KEYS: readonly RenditaKey[] = [
  'affitti',
  'cedole_dividendi',
  'altre_rendite',
] as const
export const USCITE_KEYS: readonly UscitaKey[] = [
  'casa',
  'auto',
  'finanziamenti',
  'vita',
] as const

export interface Finances {
  session_id: string
  redditi: VoceReddito[]
  rendite: Record<RenditaKey, number>
  uscite: Record<UscitaKey, number>
  crm_mensile: number
  crm_annuale: number
  /** frazione, non percentuale: 0.12 = 12% */
  crm_percentuale: number
}

// ---------------------------------------------------------------- fortezza

export type BloccoKey = 'mastio' | 'salute' | 'risparmio' | 'perimetro'

export const BLOCCHI: readonly BloccoKey[] = [
  'mastio',
  'salute',
  'risparmio',
  'perimetro',
] as const

export type StatoVoce = 'presente' | 'assente' | 'non_so'

export interface FortressItem {
  id: string
  session_id: string
  blocco: BloccoKey
  voce_key: string
  stato: StatoVoce | null
  nota: string | null
}

// ---------------------------------------------------------------- emozioni

export interface Emotions {
  session_id: string
  sentire_attuale: string
  sentire_desiderato: string
  emozioni_scelte: string[]
  emozioni_desiderate: string[]
  priorita_dichiarate: string[]
}

// ---------------------------------------------------------------- sessione

export type StatoSessione = 'bozza' | 'in_corso' | 'conclusa'

export type FaseKey =
  | 'nucleo'
  | 'ciclo_vita'
  | 'finanze'
  | 'fortezza'
  | 'situazione_oggi'
  | 'cittadella_completa'
  | 'desiderato'
  | 'chiusura'

export const FASI: readonly FaseKey[] = [
  'nucleo',
  'ciclo_vita',
  'finanze',
  'fortezza',
  'situazione_oggi',
  'cittadella_completa',
  'desiderato',
  'chiusura',
] as const

export interface Agency {
  id: string
  nome: string
  created_at: string
}

export interface Advisor {
  id: string
  agency_id: string
  nome: string
  email: string
  ruolo: 'advisor' | 'titolare'
}

export interface Client {
  id: string
  agency_id: string
  advisor_id: string
  etichetta: string
  note: string | null
  created_at: string
}

export interface Session {
  id: string
  client_id: string
  advisor_id: string
  agency_id: string
  stato: StatoSessione
  fase_corrente: FaseKey
  created_at: string
  updated_at: string
  conclusa_at: string | null
}

/** Tutto cio' che serve per disegnare una sessione, in un colpo solo. */
export interface SessionBundle {
  session: Session
  client: Client
  members: FamilyMember[]
  finances: Finances
  fortress: FortressItem[]
  emotions: Emotions
}
