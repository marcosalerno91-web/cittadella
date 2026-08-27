import Link from 'next/link'

import { esci } from '@/app/accedi/azioni'
import { NuovoCliente } from '@/app/clienti/NuovoCliente'
import { Bottone } from '@/components/ui/Bottone'
import { StemmaCittadella } from '@/components/scena/StemmaCittadella'
import { contesto } from '@/lib/sessione-corrente'
import * as copy from '@/content/copy'
import type { Session } from '@/lib/domain'

export const dynamic = 'force-dynamic'

export default async function PaginaClienti() {
  const { caller, repo } = await contesto()
  const [clienti, sessioni] = await Promise.all([
    repo.listClients(caller),
    repo.listRecentSessions(caller),
  ])

  const perCliente = new Map<string, Session[]>()
  for (const s of sessioni) {
    const elenco = perCliente.get(s.client_id) ?? []
    elenco.push(s)
    perCliente.set(s.client_id, elenco)
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-6 py-8 sm:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-notte/10 pb-6">
        <div className="flex items-center gap-4">
          <StemmaCittadella className="h-14 w-14" />
          <div>
            <h1 className="text-3xl">{copy.clienti.titolo}</h1>
            <p className="text-base text-notte/60">{caller.advisor.nome}</p>
          </div>
        </div>
        <form action={esci}>
          <Bottone variante="fantasma" type="submit">
            {copy.accesso.esci}
          </Bottone>
        </form>
      </header>

      <div className="mt-8">
        <NuovoCliente />
      </div>

      {clienti.length === 0 ? (
        <div className="anim-entra mt-14 rounded-3xl border-2 border-dashed border-notte/20 px-8 py-14 text-center">
          <h2 className="text-2xl">{copy.clienti.vuoto_titolo}</h2>
          <p className="mx-auto mt-3 max-w-md text-lg text-notte/60">{copy.clienti.vuoto_testo}</p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {clienti.map((cliente) => {
            const suoi = perCliente.get(cliente.id) ?? []
            const ultima = suoi[0]
            return (
              <li
                key={cliente.id}
                className="anim-entra flex flex-wrap items-center justify-between gap-5 rounded-3xl border-2 border-notte/15 bg-sabbia-chiara px-7 py-5"
              >
                <div className="min-w-0">
                  <p className="text-2xl font-semibold">{cliente.etichetta}</p>
                  <p className="text-base text-notte/55">
                    {copy.clienti.creata_il} {formattaData(cliente.created_at)}
                    {ultima ? ` · ${etichettaStato(ultima)}` : ''}
                  </p>
                  {cliente.note ? (
                    <p className="mt-1 max-w-xl truncate text-base text-notte/50">{cliente.note}</p>
                  ) : null}
                </div>

                {ultima ? (
                  <Link
                    href={`/sessione/${ultima.id}`}
                    className="rounded-2xl border-2 border-notte bg-sole px-6 py-3 text-lg font-semibold text-notte"
                  >
                    {ultima.stato === 'conclusa'
                      ? copy.clienti.rivedi_sessione
                      : copy.clienti.riprendi_sessione}
                  </Link>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}

function etichettaStato(s: Session): string {
  if (s.stato === 'conclusa') return copy.clienti.sessione_conclusa
  if (s.stato === 'in_corso') return copy.clienti.sessione_in_corso
  return copy.clienti.sessione_bozza
}

function formattaData(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
