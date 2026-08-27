import type {
  Advisor,
  Client,
  Emotions,
  FamilyMember,
  FaseKey,
  Finances,
  FortressItem,
  Session,
  SessionBundle,
  StatoSessione,
} from '@/lib/domain'

/** Identita' di chi sta chiamando. Ogni metodo del repository la riceve. */
export interface Caller {
  advisor: Advisor
}

export interface NuovoCliente {
  etichetta: string
  note?: string | null
}

export interface PatchSessione {
  stato?: StatoSessione
  fase_corrente?: FaseKey
}

/** Membro cosi' come arriva dal client: senza id se e' nuovo. */
export type MemberInput = Omit<FamilyMember, 'id' | 'session_id'> & { id?: string }

export type FinancesInput = Omit<
  Finances,
  'session_id' | 'crm_mensile' | 'crm_annuale' | 'crm_percentuale'
>

export type EmotionsInput = Omit<Emotions, 'session_id'>

export interface FortressInput {
  voce_key: string
  stato: FortressItem['stato']
  nota: string | null
}

/**
 * Unico punto di accesso ai dati. Le due implementazioni (Supabase e locale)
 * rispettano lo stesso contratto, incluso l'isolamento fra agenzie.
 */
export interface Repository {
  listClients(c: Caller): Promise<Client[]>
  createClient(c: Caller, input: NuovoCliente): Promise<Client>
  getClient(c: Caller, clientId: string): Promise<Client | null>

  listSessionsForClient(c: Caller, clientId: string): Promise<Session[]>
  listRecentSessions(c: Caller): Promise<Session[]>
  createSession(c: Caller, clientId: string): Promise<Session>
  getBundle(c: Caller, sessionId: string): Promise<SessionBundle | null>
  patchSession(c: Caller, sessionId: string, patch: PatchSessione): Promise<Session>

  saveMembers(c: Caller, sessionId: string, members: MemberInput[]): Promise<FamilyMember[]>
  saveFinances(c: Caller, sessionId: string, input: FinancesInput): Promise<Finances>
  saveFortress(c: Caller, sessionId: string, items: FortressInput[]): Promise<FortressItem[]>
  saveEmotions(c: Caller, sessionId: string, input: EmotionsInput): Promise<Emotions>
}

/** Errore sollevato quando la riga esiste ma non appartiene al chiamante. */
export class NonAutorizzato extends Error {
  constructor(dettaglio = 'Risorsa non accessibile') {
    super(dettaglio)
    this.name = 'NonAutorizzato'
  }
}

export class NonTrovato extends Error {
  constructor(dettaglio = 'Risorsa non trovata') {
    super(dettaglio)
    this.name = 'NonTrovato'
  }
}

export interface AuthAdapter {
  currentAdvisor(): Promise<Advisor | null>
  signIn(email: string, password: string): Promise<Advisor>
  signUp(input: {
    email: string
    password: string
    nome: string
    agenzia: string
  }): Promise<Advisor>
  signOut(): Promise<void>
}
