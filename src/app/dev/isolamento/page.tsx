/**
 * Prova di isolamento fra agenzie.
 *
 * Crea due agenzie con un consulente ciascuna, apre un cliente e una sessione
 * per il primo, poi prova a raggiungerli con l'identita' del secondo passando
 * per il Repository, cioe' esattamente per la strada che usa l'applicazione.
 *
 * Vale per il driver locale, dove l'isolamento e' scritto nel codice.
 * Per Supabase, dove lo applica Postgres, la prova equivalente e'
 * supabase/tests/isolamento.sql.
 */

import { notFound } from 'next/navigation'

import { driverAttivo } from '@/lib/db'
import { localRepository } from '@/lib/db/local'
import { adesso, muta, nuovoId } from '@/lib/db/local-store'
import type { Caller } from '@/lib/db/types'
import type { Advisor } from '@/lib/domain'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Prova di isolamento' }

interface Esito {
  prova: string
  atteso: string
  ottenuto: string
  passa: boolean
}

export default async function PaginaIsolamento() {
  if (process.env.NODE_ENV === 'production' || driverAttivo() !== 'locale') notFound()

  const esiti = await eseguiProva()
  const tutteOk = esiti.every((e) => e.passa)

  return (
    <main className="mx-auto w-full max-w-4xl px-8 py-10">
      <h1 className="text-4xl">Prova di isolamento fra agenzie</h1>
      <p className="mt-2 text-lg text-notte/60">
        Due agenzie, due consulenti. Il secondo prova a raggiungere i dati del primo.
      </p>

      <p
        className={`mt-6 rounded-2xl border-2 px-6 py-4 text-xl font-semibold ${
          tutteOk ? 'border-salvia bg-salvia/20' : 'border-corallo bg-corallo/20'
        }`}
      >
        {tutteOk
          ? `L’isolamento regge: ${esiti.length} prove su ${esiti.length} passate.`
          : `Isolamento non garantito: ${esiti.filter((e) => !e.passa).length} prove fallite.`}
      </p>

      <table className="mt-8 w-full border-collapse text-base">
        <thead>
          <tr className="border-b-2 border-notte/25 text-left">
            <th className="py-2 pr-4">Prova</th>
            <th className="py-2 pr-4">Atteso</th>
            <th className="py-2 pr-4">Ottenuto</th>
            <th className="py-2">Esito</th>
          </tr>
        </thead>
        <tbody>
          {esiti.map((e) => (
            <tr key={e.prova} className="border-b border-notte/12 align-top">
              <td className="py-2 pr-4 font-semibold">{e.prova}</td>
              <td className="py-2 pr-4 text-notte/60">{e.atteso}</td>
              <td className="py-2 pr-4 text-notte/60">{e.ottenuto}</td>
              <td className="py-2">
                <span className={e.passa ? 'text-salvia' : 'text-corallo'}>
                  {e.passa ? '● passa' : '○ fallisce'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

async function eseguiProva(): Promise<Esito[]> {
  const marchio = `prova-isolamento-${nuovoId().slice(0, 8)}`
  const { alfa, beta } = await creaDueAgenzie(marchio)

  const esiti: Esito[] = []
  const chiamanteAlfa: Caller = { advisor: alfa }
  const chiamanteBeta: Caller = { advisor: beta }

  try {
    // Alfa costruisce i propri dati
    const cliente = await localRepository.createClient(chiamanteAlfa, {
      etichetta: `${marchio} — nucleo di Alfa`,
    })
    const sessione = await localRepository.createSession(chiamanteAlfa, cliente.id)

    esiti.push(
      await prova(
        'Alfa vede il proprio cliente',
        '1 cliente',
        async () => {
          const elenco = await localRepository.listClients(chiamanteAlfa)
          return `${elenco.filter((c) => c.etichetta.startsWith(marchio)).length} cliente`
        },
        (r) => r === '1 cliente',
      ),
    )

    esiti.push(
      await prova(
        'Beta elenca i clienti',
        'nessun cliente di Alfa',
        async () => {
          const elenco = await localRepository.listClients(chiamanteBeta)
          const intrusi = elenco.filter((c) => c.etichetta.startsWith(marchio))
          return intrusi.length === 0 ? 'nessun cliente di Alfa' : `${intrusi.length} clienti di Alfa`
        },
        (r) => r === 'nessun cliente di Alfa',
      ),
    )

    esiti.push(
      await prova(
        'Beta chiede il cliente di Alfa per id',
        'null',
        async () => String(await localRepository.getClient(chiamanteBeta, cliente.id)),
        (r) => r === 'null',
      ),
    )

    esiti.push(
      await prova(
        'Beta apre la sessione di Alfa',
        'null',
        async () => String(await localRepository.getBundle(chiamanteBeta, sessione.id)),
        (r) => r === 'null',
      ),
    )

    esiti.push(
      await prova(
        'Beta elenca le sessioni recenti',
        'nessuna sessione di Alfa',
        async () => {
          const elenco = await localRepository.listRecentSessions(chiamanteBeta)
          const intrusi = elenco.filter((s) => s.id === sessione.id)
          return intrusi.length === 0 ? 'nessuna sessione di Alfa' : 'sessione di Alfa visibile'
        },
        (r) => r === 'nessuna sessione di Alfa',
      ),
    )

    esiti.push(
      await prova(
        'Beta scrive il nucleo nella sessione di Alfa',
        'errore',
        async () => {
          await localRepository.saveMembers(chiamanteBeta, sessione.id, [
            {
              nome: 'Intruso',
              eta: 40,
              professione_key: 'casual',
              professione_libera: null,
              ruolo_famiglia: 'altro',
              avatar_seed: { figura: 'maschile', capelli: 'corti', incarnato: 'chiaro' },
              ordine: 0,
            },
          ])
          return 'scrittura riuscita'
        },
        (r) => r === 'errore',
      ),
    )

    esiti.push(
      await prova(
        'Beta scrive le finanze nella sessione di Alfa',
        'errore',
        async () => {
          await localRepository.saveFinances(chiamanteBeta, sessione.id, {
            redditi: [],
            rendite: { affitti: 9999, cedole_dividendi: 0, altre_rendite: 0 },
            uscite: { casa: 0, auto: 0, finanziamenti: 0, vita: 0 },
          })
          return 'scrittura riuscita'
        },
        (r) => r === 'errore',
      ),
    )

    esiti.push(
      await prova(
        'Beta risponde alle mura di Alfa',
        'errore',
        async () => {
          await localRepository.saveFortress(chiamanteBeta, sessione.id, [
            { voce_key: 'tcm', stato: 'presente', nota: 'intruso', desiderata: true },
          ])
          return 'scrittura riuscita'
        },
        (r) => r === 'errore',
      ),
    )

    esiti.push(
      await prova(
        'Beta conclude la sessione di Alfa',
        'errore',
        async () => {
          await localRepository.patchSession(chiamanteBeta, sessione.id, { stato: 'conclusa' })
          return 'modifica riuscita'
        },
        (r) => r === 'errore',
      ),
    )

    esiti.push(
      await prova(
        'Dopo i tentativi, i dati di Alfa sono intatti',
        'nucleo vuoto, nessuna rendita, TCM senza risposta',
        async () => {
          const bundle = await localRepository.getBundle(chiamanteAlfa, sessione.id)
          if (!bundle) return 'sessione sparita'
          const tcm = bundle.fortress.find((f) => f.voce_key === 'tcm')?.stato ?? null
          return `nucleo ${bundle.members.length === 0 ? 'vuoto' : 'alterato'}, rendite ${bundle.finances.rendite.affitti}, TCM ${tcm ?? 'senza risposta'}`
        },
        (r) => r === 'nucleo vuoto, rendite 0, TCM senza risposta',
      ),
    )
  } finally {
    await ripulisci(marchio)
  }

  return esiti
}

async function prova(
  nome: string,
  atteso: string,
  esegui: () => Promise<string>,
  passa: (risultato: string) => boolean,
): Promise<Esito> {
  let ottenuto: string
  try {
    ottenuto = await esegui()
  } catch (e) {
    ottenuto = e instanceof Error && e.name === 'NonAutorizzato' ? 'errore' : `errore (${String(e)})`
  }
  return { prova: nome, atteso, ottenuto, passa: passa(ottenuto) || ottenuto === atteso }
}

async function creaDueAgenzie(marchio: string): Promise<{ alfa: Advisor; beta: Advisor }> {
  return muta((db) => {
    const costruisci = (nome: string): Advisor => {
      const agencyId = nuovoId()
      db.agencies.push({ id: agencyId, nome: `${marchio} — ${nome}`, created_at: adesso() })
      const advisor = {
        id: nuovoId(),
        agency_id: agencyId,
        nome: `${marchio} ${nome}`,
        email: `${marchio}-${nome}@prova.local`,
        ruolo: 'titolare' as const,
      }
      db.advisors.push({ ...advisor, password_hash: '', password_salt: '' })
      return advisor
    }
    return { alfa: costruisci('alfa'), beta: costruisci('beta') }
  })
}

/** La prova non lascia niente dietro di se'. */
async function ripulisci(marchio: string): Promise<void> {
  await muta((db) => {
    const agenzie = new Set(db.agencies.filter((a) => a.nome.startsWith(marchio)).map((a) => a.id))
    const sessioni = new Set(db.sessions.filter((s) => agenzie.has(s.agency_id)).map((s) => s.id))

    db.agencies = db.agencies.filter((a) => !agenzie.has(a.id))
    db.advisors = db.advisors.filter((a) => !agenzie.has(a.agency_id))
    db.clients = db.clients.filter((c) => !agenzie.has(c.agency_id))
    db.sessions = db.sessions.filter((s) => !agenzie.has(s.agency_id))
    db.members = db.members.filter((m) => !sessioni.has(m.session_id))
    db.finances = db.finances.filter((f) => !sessioni.has(f.session_id))
    db.fortress = db.fortress.filter((f) => !sessioni.has(f.session_id))
    db.emotions = db.emotions.filter((e) => !sessioni.has(e.session_id))
  })
}
