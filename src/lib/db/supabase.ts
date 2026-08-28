/**
 * Implementazione Supabase di Repository e AuthAdapter.
 *
 * Qui l'isolamento non e' scritto nel codice: lo applica Postgres con le policy
 * RLS di supabase/migrations/0001_init.sql. Le query non filtrano per agency_id
 * proprio per questo — se una policy sparisse, il test di isolamento fallirebbe
 * subito invece di essere mascherato da un filtro applicativo.
 */

import { clientSupabase } from '@/lib/db/supabase-client'
import { conCrm } from '@/lib/engine/crm'
import { emotionsVuote, financesVuote, fortezzaAllineata, fortezzaVuota } from '@/lib/db/defaults'
import { bloccoDiVoce } from '@/config/engine'
import { seedNormalizzato } from '@/lib/avatar/palette'
import type {
  Advisor,
  Client,
  Emotions,
  FamilyMember,
  Finances,
  FortressItem,
  ProfessioneKey,
  RenditaKey,
  RuoloFamiglia,
  Session,
  UscitaKey,
  VoceReddito,
} from '@/lib/domain'
import type {
  AuthAdapter,
  EmotionsInput,
  FinancesInput,
  FortressInput,
  MemberInput,
  Repository,
} from '@/lib/db/types'
import { NonAutorizzato } from '@/lib/db/types'

// ---------------------------------------------------------------- auth

export const supabaseAuth: AuthAdapter = {
  async currentAdvisor() {
    const sb = await clientSupabase()
    const { data: utente } = await sb.auth.getUser()
    if (!utente.user) return null
    const { data } = await sb
      .from('advisors')
      .select('id, agency_id, nome, email, ruolo')
      .eq('id', utente.user.id)
      .maybeSingle()
    return data ? (data as Advisor) : null
  },

  async signIn(email, password) {
    const sb = await clientSupabase()
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new NonAutorizzato(error.message)
    const advisor = await supabaseAuth.currentAdvisor()
    if (!advisor) throw new NonAutorizzato('Accesso senza profilo consulente')
    return advisor
  },

  async signUp({ email, password, nome, agenzia }) {
    const sb = await clientSupabase()
    const { error } = await sb.auth.signUp({ email: email.trim(), password })
    if (error) throw new NonAutorizzato(error.message)

    // Se il progetto richiede la conferma via email non c'e' ancora una sessione:
    // l'advisor verra' creato al primo accesso riuscito.
    const { data: utente } = await sb.auth.getUser()
    if (!utente.user) throw new NonAutorizzato('Conferma l’email e poi accedi')

    const { error: erroreRpc } = await sb.rpc('registra_advisor', {
      p_nome: nome,
      p_agenzia: agenzia,
    })
    if (erroreRpc) throw new NonAutorizzato(erroreRpc.message)

    const advisor = await supabaseAuth.currentAdvisor()
    if (!advisor) throw new NonAutorizzato('Profilo consulente non creato')
    return advisor
  },

  async signOut() {
    const sb = await clientSupabase()
    await sb.auth.signOut()
  },
}

// ---------------------------------------------------------------- mappatura

interface RigaMembro {
  id: string
  session_id: string
  nome: string
  eta: number
  professione_key: string
  professione_libera: string | null
  ruolo_famiglia: string
  avatar_seed: unknown
  ordine: number
}

function membroDaRiga(r: RigaMembro): FamilyMember {
  return {
    id: r.id,
    session_id: r.session_id,
    nome: r.nome,
    eta: r.eta,
    professione_key: r.professione_key as ProfessioneKey,
    professione_libera: r.professione_libera,
    ruolo_famiglia: r.ruolo_famiglia as RuoloFamiglia,
    // le sessioni aperte prima della v1.1 hanno un aspetto di forma diversa:
    // seedNormalizzato ricostruisce quello che manca invece di perderle
    avatar_seed: seedNormalizzato(r.avatar_seed, r.nome, r.eta),
    ordine: r.ordine,
  }
}

interface RigaFinanze {
  session_id: string
  redditi: unknown
  rendite: unknown
  uscite: unknown
  crm_mensile: number
  crm_annuale: number
  crm_percentuale: number
}

function finanzeDaRiga(r: RigaFinanze): Finances {
  const rendite = (r.rendite ?? {}) as Partial<Record<RenditaKey, number>>
  const uscite = (r.uscite ?? {}) as Partial<Record<UscitaKey, number>>
  return {
    session_id: r.session_id,
    redditi: Array.isArray(r.redditi) ? (r.redditi as VoceReddito[]) : [],
    rendite: {
      affitti: rendite.affitti ?? 0,
      cedole_dividendi: rendite.cedole_dividendi ?? 0,
      altre_rendite: rendite.altre_rendite ?? 0,
    },
    uscite: {
      casa: uscite.casa ?? 0,
      auto: uscite.auto ?? 0,
      finanziamenti: uscite.finanziamenti ?? 0,
      vita: uscite.vita ?? 0,
    },
    crm_mensile: Number(r.crm_mensile),
    crm_annuale: Number(r.crm_annuale),
    crm_percentuale: Number(r.crm_percentuale),
  }
}

function alzati(errore: { message: string } | null): void {
  if (errore) throw new Error(errore.message)
}

// ---------------------------------------------------------------- repository

export const supabaseRepository: Repository = {
  async listClients() {
    const sb = await clientSupabase()
    const { data, error } = await sb
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    alzati(error)
    return (data ?? []) as Client[]
  },

  async createClient(_c, input) {
    const sb = await clientSupabase()
    const { data: utente } = await sb.auth.getUser()
    if (!utente.user) throw new NonAutorizzato()
    const { data, error } = await sb
      .from('clients')
      .insert({
        agency_id: _c.advisor.agency_id,
        advisor_id: utente.user.id,
        etichetta: input.etichetta.trim(),
        note: input.note?.trim() || null,
      })
      .select('*')
      .single()
    alzati(error)
    return data as Client
  },

  async getClient(_c, clientId) {
    const sb = await clientSupabase()
    const { data } = await sb.from('clients').select('*').eq('id', clientId).maybeSingle()
    return (data as Client | null) ?? null
  },

  async listSessionsForClient(_c, clientId) {
    const sb = await clientSupabase()
    const { data, error } = await sb
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    alzati(error)
    return (data ?? []) as Session[]
  },

  async listRecentSessions() {
    const sb = await clientSupabase()
    const { data, error } = await sb
      .from('sessions')
      .select('*')
      .order('updated_at', { ascending: false })
    alzati(error)
    return (data ?? []) as Session[]
  },

  async createSession(c, clientId) {
    const sb = await clientSupabase()
    const { data, error } = await sb
      .from('sessions')
      .insert({
        client_id: clientId,
        advisor_id: c.advisor.id,
        agency_id: c.advisor.agency_id,
        stato: 'bozza',
        fase_corrente: 'nucleo',
      })
      .select('*')
      .single()
    alzati(error)
    const sessione = data as Session

    // righe collegate: una per la fotografia finanziaria, una per le emozioni,
    // una per ciascuna voce delle mura
    const vuote = fortezzaVuota(sessione.id)
    await sb.from('finances').insert({ session_id: sessione.id, redditi: [], rendite: {}, uscite: {} })
    await sb.from('emotions').insert({ session_id: sessione.id })
    await sb.from('fortress_items').insert(
      vuote.map((v) => ({
        session_id: sessione.id,
        blocco: v.blocco,
        voce_key: v.voce_key,
        stato: null,
        nota: null,
      })),
    )
    return sessione
  },

  async getBundle(_c, sessionId) {
    const sb = await clientSupabase()
    const { data: sessione } = await sb
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle()
    if (!sessione) return null
    const s = sessione as Session

    const [cliente, membri, finanze, mura, emozioni] = await Promise.all([
      sb.from('clients').select('*').eq('id', s.client_id).maybeSingle(),
      sb.from('family_members').select('*').eq('session_id', sessionId).order('ordine'),
      sb.from('finances').select('*').eq('session_id', sessionId).maybeSingle(),
      sb.from('fortress_items').select('*').eq('session_id', sessionId),
      sb.from('emotions').select('*').eq('session_id', sessionId).maybeSingle(),
    ])

    if (!cliente.data) return null

    return {
      session: s,
      client: cliente.data as Client,
      members: ((membri.data ?? []) as RigaMembro[]).map(membroDaRiga),
      finances: finanze.data
        ? finanzeDaRiga(finanze.data as RigaFinanze)
        : financesVuote(sessionId),
      fortress: fortezzaAllineata(sessionId, (mura.data ?? []) as FortressItem[]),
      emotions: emozioni.data ? (emozioni.data as Emotions) : emotionsVuote(sessionId),
    }
  },

  async patchSession(_c, sessionId, patch) {
    const sb = await clientSupabase()
    const campi: Record<string, unknown> = {}
    if (patch.fase_corrente) campi.fase_corrente = patch.fase_corrente
    if (patch.stato) {
      campi.stato = patch.stato
      campi.conclusa_at = patch.stato === 'conclusa' ? new Date().toISOString() : null
    }
    const { data, error } = await sb
      .from('sessions')
      .update(campi)
      .eq('id', sessionId)
      .select('*')
      .single()
    alzati(error)
    return data as Session
  },

  async saveMembers(_c, sessionId, members: MemberInput[]) {
    const sb = await clientSupabase()
    // riscrittura completa: l'ordine e le rimozioni contano quanto i valori
    await sb.from('family_members').delete().eq('session_id', sessionId)
    if (members.length === 0) {
      await marcaInCorso(sessionId)
      return []
    }
    const { data, error } = await sb
      .from('family_members')
      .insert(
        members.map((m, indice) => ({
          ...(m.id ? { id: m.id } : {}),
          session_id: sessionId,
          nome: m.nome.trim(),
          eta: m.eta,
          professione_key: m.professione_key,
          professione_libera: m.professione_libera?.trim() || null,
          ruolo_famiglia: m.ruolo_famiglia,
          avatar_seed: m.avatar_seed,
          ordine: indice,
        })),
      )
      .select('*')
    alzati(error)
    await marcaInCorso(sessionId)
    return ((data ?? []) as RigaMembro[]).map(membroDaRiga).sort((a, b) => a.ordine - b.ordine)
  },

  async saveFinances(_c, sessionId, input: FinancesInput) {
    const sb = await clientSupabase()
    const calcolate = conCrm(sessionId, input)
    const { error } = await sb.from('finances').upsert(
      {
        session_id: sessionId,
        redditi: calcolate.redditi,
        rendite: calcolate.rendite,
        uscite: calcolate.uscite,
        crm_mensile: calcolate.crm_mensile,
        crm_annuale: calcolate.crm_annuale,
        crm_percentuale: calcolate.crm_percentuale,
      },
      { onConflict: 'session_id' },
    )
    alzati(error)
    await marcaInCorso(sessionId)
    return calcolate
  },

  async saveFortress(_c, sessionId, items: FortressInput[]) {
    const sb = await clientSupabase()
    const righe = items
      .map((i) => ({ blocco: bloccoDiVoce(i.voce_key), item: i }))
      .filter((x): x is { blocco: NonNullable<typeof x.blocco>; item: FortressInput } =>
        Boolean(x.blocco),
      )
      .map(({ blocco, item }) => ({
        session_id: sessionId,
        blocco,
        voce_key: item.voce_key,
        stato: item.stato,
        nota: item.nota?.trim() || null,
      }))

    if (righe.length > 0) {
      const { error } = await sb
        .from('fortress_items')
        .upsert(righe, { onConflict: 'session_id,voce_key' })
      alzati(error)
    }
    await marcaInCorso(sessionId)

    const { data } = await sb.from('fortress_items').select('*').eq('session_id', sessionId)
    return fortezzaAllineata(sessionId, (data ?? []) as FortressItem[])
  },

  async saveEmotions(_c, sessionId, input: EmotionsInput) {
    const sb = await clientSupabase()
    const salvate: Emotions = {
      session_id: sessionId,
      sentire_attuale: input.sentire_attuale.trim(),
      sentire_desiderato: input.sentire_desiderato.trim(),
      emozioni_scelte: input.emozioni_scelte,
      emozioni_desiderate: input.emozioni_desiderate,
      priorita_dichiarate: input.priorita_dichiarate,
    }
    const { error } = await sb.from('emotions').upsert(salvate, { onConflict: 'session_id' })
    alzati(error)
    await marcaInCorso(sessionId)
    return salvate
  },
}

/** Una sessione che riceve dati non e' piu' una bozza. */
async function marcaInCorso(sessionId: string): Promise<void> {
  const sb = await clientSupabase()
  await sb.from('sessions').update({ stato: 'in_corso' }).eq('id', sessionId).eq('stato', 'bozza')
}
