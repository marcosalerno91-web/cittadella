'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { Fortezza } from '@/components/scena/Fortezza'
import { Bottone } from '@/components/ui/Bottone'
import { BLOCCHI_FORTEZZA, VOCI_FORTEZZA } from '@/config/engine'
import { statoBlocco } from '@/lib/engine/fortezza'
import * as copy from '@/content/copy'
import type { BloccoKey, FamilyMember, FortressItem, StatoVoce } from '@/lib/domain'

const STATI: StatoVoce[] = ['presente', 'assente', 'non_so']

const COLORE_STATO: Record<StatoVoce, string> = {
  presente: 'border-salvia bg-salvia/25',
  assente: 'border-corallo bg-corallo/15',
  non_so: 'border-nebbia bg-nebbia/30',
}

interface Props {
  membri: FamilyMember[]
  voci: FortressItem[]
  onRispondi: (voceKey: string, stato: StatoVoce) => void
  onAnnota: (voceKey: string, nota: string) => void
  soloLettura: boolean
}

export function FaseFortezza({ membri, voci, onRispondi, onAnnota, soloLettura }: Props) {
  // indice della voce in discussione nell'elenco ordinato
  const [indice, setIndice] = useState(() => {
    const prima = VOCI_FORTEZZA.findIndex(
      (v) => (voci.find((x) => x.voce_key === v.key)?.stato ?? null) === null,
    )
    return prima === -1 ? VOCI_FORTEZZA.length - 1 : prima
  })
  const [notaAperta, setNotaAperta] = useState(false)
  // Fra una risposta e la voce successiva passa un attimo. In quell'attimo i
  // clic non contano: senza questo blocco un doppio tocco rispondeva due volte
  // alla stessa voce e ne saltava una.
  const transizione = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (transizione.current) clearTimeout(transizione.current)
  }, [])

  const voceCorrente = VOCI_FORTEZZA[Math.min(indice, VOCI_FORTEZZA.length - 1)]
  const bloccoCorrente: BloccoKey = voceCorrente?.blocco ?? 'mastio'
  const riga = voci.find((v) => v.voce_key === voceCorrente?.key)
  const testi = voceCorrente ? copy.vociFortezza[voceCorrente.key] : undefined

  /** Solo le cinte gia' raggiunte compaiono: si costruisce una alla volta. */
  const cinteVisibili = useMemo(() => {
    const ordine = BLOCCHI_FORTEZZA.map((b) => b.key)
    const fin = ordine.indexOf(bloccoCorrente)
    return ordine.slice(0, fin + 1)
  }, [bloccoCorrente])

  const statoCinta = statoBlocco(voci, bloccoCorrente)
  const definizione = copy.blocchi[bloccoCorrente]

  function rispondi(stato: StatoVoce) {
    if (!voceCorrente || soloLettura || transizione.current) return
    onRispondi(voceCorrente.key, stato)
    setNotaAperta(false)
    // si passa oltre da soli: la conversazione non deve aspettare un clic in piu'
    if (indice < VOCI_FORTEZZA.length - 1) {
      transizione.current = setTimeout(() => {
        transizione.current = null
        setIndice((v) => Math.min(v + 1, VOCI_FORTEZZA.length - 1))
      }, 260)
    }
  }

  /** Spostarsi a mano annulla la transizione in corso. */
  function vaiAVoce(prossimo: number) {
    if (transizione.current) {
      clearTimeout(transizione.current)
      transizione.current = null
    }
    setIndice(Math.min(Math.max(prossimo, 0), VOCI_FORTEZZA.length - 1))
  }

  if (!voceCorrente || !testi) return null

  return (
    <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,26rem)]">
      {/* -------------------------------------------------- le mura */}
      <section className="flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-notte/12 bg-sabbia-chiara p-4">
        <Fortezza
          membri={membri}
          voci={voci}
          voceInCorso={voceCorrente.key}
          cinteVisibili={cinteVisibili}
          className="min-h-0 w-full flex-1"
        />
      </section>

      {/* -------------------------------------------------- la domanda */}
      <section className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
        <header className="rounded-2xl border-2 border-notte/12 bg-sabbia-chiara px-6 py-4">
          <p className="text-base font-semibold uppercase tracking-wide text-notte/45">
            {definizione.nome}
          </p>
          <h2 className="text-2xl">{definizione.titolo}</h2>
          <p className="mt-2 text-base leading-relaxed text-notte/60">{definizione.intro}</p>
          <p className="mt-3 text-sm text-notte/45">
            {copy.fortezza.avanzamento
              .replace('{n}', String(statoCinta.totale - statoCinta.senza_risposta))
              .replace('{tot}', String(statoCinta.totale))}
          </p>
        </header>

        <div key={voceCorrente.key} className="anim-entra flex flex-col gap-4">
          <div>
            <h3 className="text-2xl leading-snug">{testi.domanda}</h3>
            {testi.sigla ? (
              <p className="mt-1 text-base font-semibold text-notte/50">{testi.sigla}</p>
            ) : null}
            <p className="mt-3 text-lg leading-relaxed text-notte/70">{testi.protegge}</p>
          </div>

          <div className="flex flex-col gap-2">
            {STATI.map((stato) => (
              <button
                key={stato}
                type="button"
                disabled={soloLettura}
                onClick={() => rispondi(stato)}
                className={`rounded-2xl border-2 px-6 py-4 text-left text-xl font-semibold transition-colors duration-200 ${
                  riga?.stato === stato
                    ? COLORE_STATO[stato]
                    : 'border-notte/20 bg-sabbia-chiara hover:border-notte/60'
                }`}
              >
                {copy.statiVoce[stato]}
              </button>
            ))}
          </div>

          {notaAperta || riga?.nota ? (
            <label className="flex flex-col gap-2">
              <span className="text-base font-semibold text-notte/70">{copy.fortezza.nota}</span>
              <textarea
                value={riga?.nota ?? ''}
                disabled={soloLettura}
                placeholder={copy.fortezza.nota_placeholder}
                onChange={(e) => onAnnota(voceCorrente.key, e.target.value)}
                className="min-h-[5rem] rounded-2xl border-2 border-notte/20 bg-sabbia-chiara px-4 py-3 text-base outline-none focus:border-notte"
              />
            </label>
          ) : (
            <button
              type="button"
              disabled={soloLettura}
              onClick={() => setNotaAperta(true)}
              className="self-start text-base font-semibold text-notte/55 underline underline-offset-4 hover:text-notte"
            >
              ＋ {copy.fortezza.nota_aggiungi}
            </button>
          )}
        </div>

        {/* ---------------------------------- navigazione fra le voci */}
        <nav className="mt-auto flex flex-col gap-3 border-t-2 border-notte/10 pt-4">
          <div className="flex gap-2">
            <Bottone
              variante="quieto"
              onClick={() => vaiAVoce(indice - 1)}
              disabled={indice === 0}
            >
              ←
            </Bottone>
            <Bottone
              variante="quieto"
              onClick={() => vaiAVoce(indice + 1)}
              disabled={indice >= VOCI_FORTEZZA.length - 1}
            >
              →
            </Bottone>
          </div>

          <ol className="flex flex-wrap gap-1.5">
            {VOCI_FORTEZZA.map((v, i) => {
              const stato = voci.find((x) => x.voce_key === v.key)?.stato ?? null
              return (
                <li key={v.key}>
                  <button
                    type="button"
                    aria-label={copy.vociFortezza[v.key]?.nome ?? v.key}
                    onClick={() => vaiAVoce(i)}
                    className={`h-8 w-8 min-h-0 rounded-lg border-2 text-xs font-semibold ${
                      i === indice ? 'border-notte' : 'border-transparent'
                    } ${
                      stato === 'presente'
                        ? 'bg-salvia'
                        : stato === 'assente'
                          ? 'bg-corallo/40'
                          : stato === 'non_so'
                            ? 'bg-nebbia'
                            : 'bg-notte/10'
                    }`}
                  >
                    {i + 1}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      </section>
    </div>
  )
}
