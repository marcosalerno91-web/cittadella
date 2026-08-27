/**
 * Implementazione locale di Repository e AuthAdapter.
 *
 * L'isolamento fra agenzie qui e' applicato a mano, riga per riga, con le
 * stesse regole della policy RLS di Postgres: agency_id del chiamante e, per i
 * clienti, advisor_id del chiamante.
 */

import { cookies } from 'next/headers'

import { conCrm } from '@/lib/engine/crm'
import { emotionsVuote, financesVuote, fortezzaAllineata, fortezzaVuota } from '@/lib/db/defaults'
import { bloccoDiVoce } from '@/config/engine'
import type {
  Advisor,
  Client,
  Emotions,
  FamilyMember,
  Finances,
  FortressItem,
  Session,
} from '@/lib/domain'
import type {
  AuthAdapter,
  Caller,
  EmotionsInput,
  FinancesInput,
  FortressInput,
  MemberInput,
  NuovoCliente,
  PatchSessione,
  Repository,
} from '@/lib/db/types'
import { NonAutorizzato, NonTrovato } from '@/lib/db/types'
import {
  adesso,
  hashPassword,
  leggi,
  muta,
  nuovoId,
  nuovoToken,
  verificaPassword,
  type AdvisorRecord,
  type Database,
} from '@/lib/db/local-store'

const COOKIE_SESSIONE = 'cittadella_sessione'

// ---------------------------------------------------------------- auth

function pubblico(a: AdvisorRecord): Advisor {
  return { id: a.id, agency_id: a.agency_id, nome: a.nome, email: a.email, ruolo: a.ruolo }
}

export const localAuth: AuthAdapter = {
  async currentAdvisor() {
    const token = (await cookies()).get(COOKIE_SESSIONE)?.value
    if (!token) return null
    const db = await leggi()
    const advisorId = db.tokens[token]
    if (!advisorId) return null
    const advisor = db.advisors.find((a) => a.id === advisorId)
    return advisor ? pubblico(advisor) : null
  },

  async signIn(email, password) {
    const db = await leggi()
    const advisor = db.advisors.find((a) => a.email === email.trim().toLowerCase())
    if (!advisor || !verificaPassword(password, advisor.password_hash, advisor.password_salt)) {
      throw new NonAutorizzato('Credenziali non valide')
    }
    await apriCookie(advisor.id)
    return pubblico(advisor)
  },

  async signUp({ email, password, nome, agenzia }) {
    const normalizzata = email.trim().toLowerCase()
    const creato = await muta((db) => {
      if (db.advisors.some((a) => a.email === normalizzata)) {
        throw new NonAutorizzato('Esiste gia’ un accesso con questa email')
      }
      const agency = {
        id: nuovoId(),
        nome: agenzia.trim() || 'La mia agenzia',
        created_at: adesso(),
      }
      db.agencies.push(agency)
      const { hash, salt } = hashPassword(password)
      const advisor: AdvisorRecord = {
        id: nuovoId(),
        agency_id: agency.id,
        nome: nome.trim(),
        email: normalizzata,
        ruolo: 'titolare',
        password_hash: hash,
        password_salt: salt,
      }
      db.advisors.push(advisor)
      return advisor
    })
    await apriCookie(creato.id)
    return pubblico(creato)
  },

  async signOut() {
    const jar = await cookies()
    const token = jar.get(COOKIE_SESSIONE)?.value
    if (token) {
      await muta((db) => {
        delete db.tokens[token]
      })
    }
    jar.delete(COOKIE_SESSIONE)
  },
}

async function apriCookie(advisorId: string): Promise<void> {
  const token = nuovoToken()
  await muta((db) => {
    db.tokens[token] = advisorId
  })
  ;(await cookies()).set(COOKIE_SESSIONE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  })
}

// ---------------------------------------------------------------- accessi

/** Stesse condizioni della policy RLS: agenzia del chiamante + suo cliente. */
function clienteVisibile(db: Database, c: Caller, clientId: string): Client {
  const riga = db.clients.find((x) => x.id === clientId)
  if (!riga) throw new NonTrovato('Cliente non trovato')
  if (riga.agency_id !== c.advisor.agency_id || riga.advisor_id !== c.advisor.id) {
    throw new NonAutorizzato('Cliente di un altro consulente')
  }
  return riga
}

function sessioneVisibile(db: Database, c: Caller, sessionId: string): Session {
  const riga = db.sessions.find((x) => x.id === sessionId)
  if (!riga) throw new NonTrovato('Sessione non trovata')
  if (riga.agency_id !== c.advisor.agency_id || riga.advisor_id !== c.advisor.id) {
    throw new NonAutorizzato('Sessione di un altro consulente')
  }
  return riga
}

function tocca(sessione: Session): void {
  sessione.updated_at = adesso()
  if (sessione.stato === 'bozza') sessione.stato = 'in_corso'
}

// ---------------------------------------------------------------- repository

export const localRepository: Repository = {
  async listClients(c) {
    const db = await leggi()
    return db.clients
      .filter((x) => x.agency_id === c.advisor.agency_id && x.advisor_id === c.advisor.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  },

  async createClient(c, input: NuovoCliente) {
    return muta((db) => {
      const riga: Client = {
        id: nuovoId(),
        agency_id: c.advisor.agency_id,
        advisor_id: c.advisor.id,
        etichetta: input.etichetta.trim(),
        note: input.note?.trim() || null,
        created_at: adesso(),
      }
      db.clients.push(riga)
      return riga
    })
  },

  async getClient(c, clientId) {
    const db = await leggi()
    try {
      return clienteVisibile(db, c, clientId)
    } catch {
      return null
    }
  },

  async listSessionsForClient(c, clientId) {
    const db = await leggi()
    clienteVisibile(db, c, clientId)
    return db.sessions
      .filter((s) => s.client_id === clientId && s.advisor_id === c.advisor.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  },

  async listRecentSessions(c) {
    const db = await leggi()
    return db.sessions
      .filter((s) => s.agency_id === c.advisor.agency_id && s.advisor_id === c.advisor.id)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  },

  async createSession(c, clientId) {
    return muta((db) => {
      clienteVisibile(db, c, clientId)
      const id = nuovoId()
      const ora = adesso()
      const sessione: Session = {
        id,
        client_id: clientId,
        advisor_id: c.advisor.id,
        agency_id: c.advisor.agency_id,
        stato: 'bozza',
        fase_corrente: 'nucleo',
        created_at: ora,
        updated_at: ora,
        conclusa_at: null,
      }
      db.sessions.push(sessione)
      db.finances.push(financesVuote(id))
      db.emotions.push(emotionsVuote(id))
      db.fortress.push(...fortezzaVuota(id))
      return sessione
    })
  },

  async getBundle(c, sessionId) {
    const db = await leggi()
    let sessione: Session
    try {
      sessione = sessioneVisibile(db, c, sessionId)
    } catch {
      return null
    }
    const client = db.clients.find((x) => x.id === sessione.client_id)
    if (!client) return null
    return {
      session: sessione,
      client,
      members: db.members
        .filter((m) => m.session_id === sessionId)
        .sort((a, b) => a.ordine - b.ordine),
      finances: db.finances.find((f) => f.session_id === sessionId) ?? financesVuote(sessionId),
      fortress: fortezzaAllineata(
        sessionId,
        db.fortress.filter((f) => f.session_id === sessionId),
      ),
      emotions: db.emotions.find((e) => e.session_id === sessionId) ?? emotionsVuote(sessionId),
    }
  },

  async patchSession(c, sessionId, patch: PatchSessione) {
    return muta((db) => {
      const sessione = sessioneVisibile(db, c, sessionId)
      if (patch.fase_corrente) sessione.fase_corrente = patch.fase_corrente
      if (patch.stato) {
        sessione.stato = patch.stato
        sessione.conclusa_at = patch.stato === 'conclusa' ? adesso() : null
      }
      sessione.updated_at = adesso()
      return sessione
    })
  },

  async saveMembers(c, sessionId, members: MemberInput[]) {
    return muta((db) => {
      const sessione = sessioneVisibile(db, c, sessionId)
      const salvati: FamilyMember[] = members.map((m, indice) => ({
        id: m.id ?? nuovoId(),
        session_id: sessionId,
        nome: m.nome.trim(),
        eta: m.eta,
        professione_key: m.professione_key,
        professione_libera: m.professione_libera?.trim() || null,
        ruolo_famiglia: m.ruolo_famiglia,
        avatar_seed: m.avatar_seed,
        ordine: indice,
      }))
      db.members = db.members.filter((m) => m.session_id !== sessionId).concat(salvati)
      // i redditi puntano ai membri: togli quelli rimasti orfani
      const finanze = db.finances.find((f) => f.session_id === sessionId)
      if (finanze) {
        const vivi = new Set(salvati.map((m) => m.id))
        finanze.redditi = finanze.redditi.filter((r) => vivi.has(r.member_id))
      }
      tocca(sessione)
      return salvati
    })
  },

  async saveFinances(c, sessionId, input: FinancesInput) {
    return muta((db) => {
      const sessione = sessioneVisibile(db, c, sessionId)
      const calcolate: Finances = conCrm(sessionId, input)
      db.finances = db.finances.filter((f) => f.session_id !== sessionId).concat(calcolate)
      tocca(sessione)
      return calcolate
    })
  },

  async saveFortress(c, sessionId, items: FortressInput[]) {
    return muta((db) => {
      const sessione = sessioneVisibile(db, c, sessionId)
      const esistenti = new Map(
        db.fortress.filter((f) => f.session_id === sessionId).map((f) => [f.voce_key, f]),
      )
      for (const item of items) {
        const blocco = bloccoDiVoce(item.voce_key)
        if (!blocco) continue
        const riga = esistenti.get(item.voce_key)
        if (riga) {
          riga.stato = item.stato
          riga.nota = item.nota?.trim() || null
          riga.blocco = blocco
        } else {
          const nuova: FortressItem = {
            id: `${sessionId}:${item.voce_key}`,
            session_id: sessionId,
            blocco,
            voce_key: item.voce_key,
            stato: item.stato,
            nota: item.nota?.trim() || null,
          }
          db.fortress.push(nuova)
          esistenti.set(item.voce_key, nuova)
        }
      }
      tocca(sessione)
      return fortezzaAllineata(
        sessionId,
        db.fortress.filter((f) => f.session_id === sessionId),
      )
    })
  },

  async saveEmotions(c, sessionId, input: EmotionsInput) {
    return muta((db) => {
      const sessione = sessioneVisibile(db, c, sessionId)
      const salvate: Emotions = {
        session_id: sessionId,
        sentire_attuale: input.sentire_attuale.trim(),
        sentire_desiderato: input.sentire_desiderato.trim(),
        emozioni_scelte: input.emozioni_scelte,
        emozioni_desiderate: input.emozioni_desiderate,
        priorita_dichiarate: input.priorita_dichiarate,
      }
      db.emotions = db.emotions.filter((e) => e.session_id !== sessionId).concat(salvate)
      tocca(sessione)
      return salvate
    })
  },
}
