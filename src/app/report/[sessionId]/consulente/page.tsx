import { notFound } from 'next/navigation'

import { BarraStampa } from '@/app/report/BarraStampa'
import { Fortezza } from '@/components/scena/Fortezza'
import { RitrattoDiGruppo } from '@/components/scena/RitrattoDiGruppo'
import { BLOCCHI_FORTEZZA, faseVita, livelloScorta } from '@/config/engine'
import { calcolaCrm, euro, percentuale } from '@/lib/engine/crm'
import { elencaConDirezione, leggiSpostamento } from '@/lib/engine/emozioni'
import { statoBlocco } from '@/lib/engine/fortezza'
import { contesto } from '@/lib/sessione-corrente'
import * as copy from '@/content/copy'
import type { StatoVoce } from '@/lib/domain'
import '@/app/report/stampa.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dossier di consulenza' }

const SEGNO: Record<StatoVoce, string> = {
  presente: '●',
  assente: '○',
  non_so: '?',
}

const COLORE: Record<StatoVoce, string> = {
  presente: 'var(--salvia)',
  assente: 'var(--corallo)',
  non_so: 'var(--nebbia)',
}

export default async function DossierConsulente({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const { caller, repo } = await contesto()
  const bundle = await repo.getBundle(caller, sessionId)
  if (!bundle) notFound()

  const crm = calcolaCrm({
    redditi: bundle.finances.redditi,
    rendite: bundle.finances.rendite,
    uscite: bundle.finances.uscite,
  })
  const nomi = new Map(bundle.members.map((m) => [m.id, m.nome]))
  const desiderate = bundle.fortress.filter((f) => f.desiderata && f.stato !== 'presente')
  const spostamento = leggiSpostamento(
    bundle.emotions.emozioni_scelte,
    bundle.emotions.emozioni_desiderate,
  )
  const data = bundle.session.conclusa_at ?? bundle.session.updated_at

  return (
    <div className="pagina-stampa">
      <BarraStampa sessionId={sessionId} titolo={copy.report.consulente_titolo} />

      {/* ---------------------------------------------------- foglio 1 */}
      <article className="foglio">
        <header className="mb-6 flex items-baseline justify-between border-b-2 border-notte/20 pb-3">
          <div>
            <h1 className="text-3xl">{copy.report.consulente_titolo}</h1>
            <p className="text-lg text-notte/60">{bundle.client.etichetta}</p>
          </div>
          <p className="text-base text-notte/50">
            {copy.report.generato_il} {formattaData(data)}
          </p>
        </header>

        <section className="insieme mb-6">
          <h2 className="mb-3 text-xl">{copy.report.composizione}</h2>
          <RitrattoDiGruppo membri={bundle.members} className="w-full" />
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-base">
            {bundle.members.map((m) => (
              <li key={m.id} className="flex justify-between gap-3 border-b border-notte/10 py-1">
                <span className="font-semibold">{m.nome}</span>
                <span className="text-notte/60">
                  {m.eta} {copy.cicloVita.anni} ·{' '}
                  {m.professione_libera ?? copy.professioni[m.professione_key]} ·{' '}
                  {copy.ruoliFamiglia[m.ruolo_famiglia]}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="insieme mb-6">
          <h2 className="mb-2 text-xl">{copy.report.posizione}</h2>
          <ul className="text-base">
            {bundle.members.map((m) => (
              <li key={m.id} className="flex gap-3 border-b border-notte/10 py-1">
                <span className="w-24 shrink-0 font-semibold">
                  {copy.cicloVita.campiture[faseVita(m.eta)]}
                </span>
                <span className="flex-1 text-notte/70">
                  {copy.frasiCicloVita[faseVita(m.eta)].replace('{nome}', m.nome)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="insieme">
          <h2 className="mb-3 text-xl">{copy.report.quadro}</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="mb-1 text-base font-semibold uppercase tracking-wide text-notte/45">
                {copy.finanze.totale_entrate}
              </h3>
              <ul className="text-base">
                {bundle.finances.redditi
                  .filter((r) => r.importo > 0)
                  .map((r) => (
                    <li key={r.member_id} className="flex justify-between border-b border-notte/10 py-0.5">
                      <span>{nomi.get(r.member_id) ?? '—'}</span>
                      <span className="tabular-nums">{euro(r.importo)}</span>
                    </li>
                  ))}
                {(['affitti', 'cedole_dividendi', 'altre_rendite'] as const)
                  .filter((k) => bundle.finances.rendite[k] > 0)
                  .map((k) => (
                    <li key={k} className="flex justify-between border-b border-notte/10 py-0.5">
                      <span>{copy.rendite[k].label}</span>
                      <span className="tabular-nums">{euro(bundle.finances.rendite[k])}</span>
                    </li>
                  ))}
                <li className="flex justify-between border-t-2 border-notte/30 py-1 font-semibold">
                  <span>{copy.finanze.totale_entrate}</span>
                  <span className="tabular-nums">{euro(crm.entrate_totali)}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-1 text-base font-semibold uppercase tracking-wide text-notte/45">
                {copy.finanze.totale_uscite}
              </h3>
              <ul className="text-base">
                {(['casa', 'auto', 'finanziamenti', 'vita'] as const).map((k) => (
                  <li key={k} className="flex justify-between border-b border-notte/10 py-0.5">
                    <span>{copy.uscite[k].label}</span>
                    <span className="tabular-nums">{euro(bundle.finances.uscite[k])}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t-2 border-notte/30 py-1 font-semibold">
                  <span>{copy.finanze.totale_uscite}</span>
                  <span className="tabular-nums">{euro(crm.uscite_totali)}</span>
                </li>
              </ul>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-3 rounded-xl border-2 border-notte/20 p-4">
            <div>
              <dt className="text-sm text-notte/55">{copy.scorta.mensile}</dt>
              <dd className="text-2xl font-semibold tabular-nums">{euro(crm.crm_mensile)}</dd>
            </div>
            <div>
              <dt className="text-sm text-notte/55">{copy.scorta.annuale}</dt>
              <dd className="text-2xl font-semibold tabular-nums">{euro(crm.crm_annuale)}</dd>
            </div>
            <div>
              <dt className="text-sm text-notte/55">{copy.scorta.percentuale}</dt>
              <dd className="text-2xl font-semibold tabular-nums">
                {percentuale(crm.crm_percentuale)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-sm text-notte/50">
            {copy.scortaTesti[livelloScorta(crm.crm_percentuale, crm.crm_mensile)].titolo}
          </p>
        </section>
      </article>

      {/* ---------------------------------------------------- foglio 2 */}
      <article className="foglio interruzione">
        <h2 className="mb-4 text-2xl">{copy.report.mappa}</h2>

        {BLOCCHI_FORTEZZA.map((blocco) => {
          const stato = statoBlocco(bundle.fortress, blocco.key)
          return (
            <section key={blocco.key} className="insieme mb-5">
              <div className="mb-1 flex items-baseline justify-between border-b-2 border-notte/20 pb-1">
                <h3 className="text-lg">{copy.blocchi[blocco.key].titolo}</h3>
                <span className="text-sm text-notte/50">
                  {stato.presenti}/{stato.totale} presenti
                </span>
              </div>
              <ul className="text-base">
                {blocco.voci.map((voceKey) => {
                  const riga = bundle.fortress.find((f) => f.voce_key === voceKey)
                  const testi = copy.vociFortezza[voceKey]
                  const s = riga?.stato ?? null
                  return (
                    <li key={voceKey} className="flex gap-3 border-b border-notte/10 py-1">
                      <span
                        className="mt-0.5 w-4 shrink-0 text-center font-bold"
                        style={{ color: s ? COLORE[s] : 'var(--nebbia)' }}
                      >
                        {s ? SEGNO[s] : '–'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold">{testi?.nome ?? voceKey}</span>
                        {testi?.sigla ? (
                          <span className="text-notte/50"> · {testi.sigla}</span>
                        ) : null}
                        {riga?.desiderata && s !== 'presente' ? (
                          <span className="ml-2 rounded bg-sole px-1.5 py-0.5 text-xs font-semibold">
                            la vuole
                          </span>
                        ) : null}
                        {riga?.nota ? (
                          <span className="block text-sm italic text-notte/60">{riga.nota}</span>
                        ) : null}
                      </span>
                      <span className="w-28 shrink-0 text-right text-sm text-notte/55">
                        {s ? copy.statiVoce[s] : copy.report.nessuna_nota}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </article>

      {/* ---------------------------------------------------- foglio 3 */}
      <article className="foglio interruzione">
        <h2 className="mb-4 text-2xl">{copy.report.parole}</h2>

        <section className="insieme mb-5">
          <h3 className="text-lg text-notte/60">{copy.report.parole_oggi}</h3>
          <p className="mt-1 text-lg font-semibold">
            {spostamento.oggi.length > 0
              ? elencaConDirezione(spostamento.oggi)
              : copy.report.nessuna_nota}
          </p>
          {bundle.emotions.sentire_attuale ? (
            <blockquote className="mt-2 border-l-4 border-nebbia pl-4 text-lg leading-relaxed">
              {bundle.emotions.sentire_attuale}
            </blockquote>
          ) : null}
        </section>

        <section className="insieme mb-5">
          <h3 className="text-lg text-notte/60">{copy.report.parole_domani}</h3>
          <p className="mt-1 text-lg font-semibold">
            {spostamento.desiderate.length > 0
              ? spostamento.desiderate.map((e) => e.etichetta).join(', ')
              : copy.report.nessuna_nota}
          </p>
          {bundle.emotions.sentire_desiderato ? (
            <blockquote className="mt-2 border-l-4 border-sole pl-4 text-lg leading-relaxed">
              {bundle.emotions.sentire_desiderato}
            </blockquote>
          ) : null}
        </section>

        {/* la riga da cui partono i prospetti: sta in evidenza, non in fondo */}
        <section className="insieme mb-6 rounded-2xl border-2 border-notte bg-sole/20 px-6 py-4">
          <h3 className="text-base font-semibold uppercase tracking-wide text-notte/55">
            {copy.report.movimento}
          </h3>
          <p className="mt-1 text-xl leading-snug">
            {spostamento.frase || copy.report.movimento_nessuno}
          </p>
        </section>

        <section className="insieme mb-6">
          <h3 className="text-lg text-notte/60">{copy.report.desiderata}</h3>
          <p className="text-sm text-notte/50">{copy.report.desiderata_nota}</p>
          {desiderate.length > 0 ? (
            <div className="mt-2">
              {BLOCCHI_FORTEZZA.map((blocco) => {
                const delBlocco = desiderate.filter((v) => v.blocco === blocco.key)
                if (delBlocco.length === 0) return null
                return (
                  <div key={blocco.key} className="mb-2">
                    <p className="text-base font-semibold text-notte/55">
                      {copy.blocchi[blocco.key].titolo}
                    </p>
                    <ul className="text-lg">
                      {delBlocco.map((v) => (
                        <li key={v.voce_key} className="py-0.5">
                          · {copy.vociFortezza[v.voce_key]?.nome ?? v.voce_key}
                          {copy.vociFortezza[v.voce_key]?.sigla ? (
                            <span className="text-notte/50">
                              {' '}
                              — {copy.vociFortezza[v.voce_key]?.sigla}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-2 text-notte/50">{copy.report.desiderata_nessuna}</p>
          )}
        </section>

        <section className="insieme">
          <h3 className="text-lg text-notte/60">{copy.report.appunti}</h3>
          <div className="mt-2 h-[62mm] rounded-xl border-2 border-dashed border-notte/25" />
        </section>
      </article>

      {/* ---------------------------------------------------- foglio 4 */}
      <article className="foglio interruzione">
        <h2 className="mb-3 text-2xl">{copy.report.mappa_scena}</h2>
        <Fortezza membri={bundle.members} voci={bundle.fortress} className="w-full" />
        <ul className="mt-4 flex flex-wrap gap-5 text-base">
          {(['presente', 'assente', 'non_so'] as StatoVoce[]).map((s) => (
            <li key={s} className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-6 rounded border-2"
                style={{
                  background: s === 'presente' ? COLORE[s] : 'transparent',
                  borderColor: COLORE[s],
                  borderStyle: s === 'assente' ? 'dashed' : 'solid',
                }}
              />
              {copy.statiVoce[s]}
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
}

function formattaData(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
