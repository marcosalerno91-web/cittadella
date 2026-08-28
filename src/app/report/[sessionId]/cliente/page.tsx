import { notFound } from 'next/navigation'

import { BarraStampa } from '@/app/report/BarraStampa'
import { Fortezza } from '@/components/scena/Fortezza'
import { RitrattoDiGruppo } from '@/components/scena/RitrattoDiGruppo'
import { faseVita } from '@/config/engine'
import { contesto } from '@/lib/sessione-corrente'
import * as copy from '@/content/copy'
import '@/app/report/stampa.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'La vostra cittadella' }

/**
 * Le due pagine da mandare alla famiglia.
 *
 * Vincolo che regge tutta la pagina: nessun dato economico, nessun importo,
 * nessuna cifra. Solo la famiglia, dove si trova, cosa la protegge gia' e la
 * frase con cui ha detto come vorrebbe sentirsi.
 */
export default async function ReportCliente({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const { caller, repo } = await contesto()
  const bundle = await repo.getBundle(caller, sessionId)
  if (!bundle) notFound()

  const data = bundle.session.conclusa_at ?? bundle.session.updated_at

  return (
    <div className="pagina-stampa">
      <BarraStampa sessionId={sessionId} titolo={copy.report.cliente_titolo} />

      {/* ---------------------------------------------------- pagina 1 */}
      <article className="foglio">
        <header className="mb-8 text-center">
          <h1 className="text-4xl">{copy.report.cliente_titolo}</h1>
          <p className="mt-1 text-lg text-notte/60">
            {bundle.client.etichetta} · {formattaData(data)}
          </p>
        </header>

        <section className="insieme mb-8">
          <h2 className="mb-3 text-center text-xl text-notte/60">{copy.report.composizione}</h2>
          <RitrattoDiGruppo membri={bundle.members} className="w-full" />
        </section>

        <section className="insieme">
          <h2 className="mb-3 text-xl text-notte/60">{copy.report.posizione}</h2>
          <ul className="text-lg leading-relaxed">
            {bundle.members.map((m) => (
              <li key={m.id} className="border-b border-notte/10 py-1.5">
                {copy.frasiCicloVita[faseVita(m.eta)].replace('{nome}', m.nome)}
              </li>
            ))}
          </ul>
        </section>
      </article>

      {/* ---------------------------------------------------- pagina 2 */}
      <article className="foglio interruzione">
        <section className="insieme mb-6">
          <h2 className="mb-2 text-2xl">{copy.report.mappa_desiderata}</h2>
          <Fortezza membri={bundle.members} voci={bundle.fortress} className="w-full" />
          <ul className="mt-3 flex flex-wrap justify-center gap-6 text-base">
            <li className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-6 rounded border-2"
                style={{ background: 'var(--salvia)', borderColor: 'var(--salvia)' }}
              />
              Gia’ al riparo
            </li>
            <li className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-6 rounded border-2"
                style={{ background: 'var(--sole)', borderColor: 'var(--notte)' }}
              />
              Quello che avete scelto
            </li>
            <li className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-6 rounded border-2 border-dashed"
                style={{ borderColor: 'var(--corallo)' }}
              />
              Ancora da costruire
            </li>
          </ul>
        </section>

        {bundle.emotions.sentire_desiderato ? (
          <section className="insieme mb-6 rounded-2xl border-2 border-sole bg-sole/10 p-6">
            <h2 className="text-lg text-notte/60">{copy.report.parole_domani}</h2>
            <blockquote className="mt-2 text-2xl leading-snug">
              «{bundle.emotions.sentire_desiderato}»
            </blockquote>
            {bundle.emotions.emozioni_desiderate.length > 0 ? (
              <p className="mt-3 text-lg text-notte/65">
                {bundle.emotions.emozioni_desiderate.map(etichettaEmozione).join(' · ')}
              </p>
            ) : null}
          </section>
        ) : null}

        <p className="text-center text-lg text-notte/70">{copy.report.cliente_chiusura}</p>
      </article>
    </div>
  )
}

function etichettaEmozione(chiave: string): string {
  return copy.emozioneDi('desiderato', chiave)?.etichetta ?? chiave
}

function formattaData(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
