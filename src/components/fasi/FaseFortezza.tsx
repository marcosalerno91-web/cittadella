'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { Fortezza } from '@/components/scena/Fortezza'
import { BLOCCHI_FORTEZZA, VOCI_FORTEZZA } from '@/config/engine'
import * as copy from '@/content/copy'
import type { BloccoKey, FamilyMember, FortressItem, StatoVoce } from '@/lib/domain'

const STATI: StatoVoce[] = ['presente', 'assente', 'non_so']

const COLORE_STATO: Record<StatoVoce, string> = {
  presente: 'border-salvia bg-salvia/25',
  assente: 'border-corallo bg-corallo/15',
  non_so: 'border-nebbia bg-nebbia/40',
}

interface Props {
  membri: FamilyMember[]
  voci: FortressItem[]
  onRispondi: (voceKey: string, stato: StatoVoce) => void
  onAnnota: (voceKey: string, nota: string) => void
  soloLettura: boolean
}

export function FaseFortezza({ membri, voci, onRispondi, onAnnota, soloLettura }: Props) {
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

  useEffect(
    () => () => {
      if (transizione.current) clearTimeout(transizione.current)
    },
    [],
  )

  const voceCorrente = VOCI_FORTEZZA[Math.min(indice, VOCI_FORTEZZA.length - 1)]
  const bloccoCorrente: BloccoKey = voceCorrente?.blocco ?? 'mastio'
  const riga = voci.find((v) => v.voce_key === voceCorrente?.key)
  const testi = voceCorrente ? copy.vociFortezza[voceCorrente.key] : undefined

  /** Solo i blocchi gia' raggiunti compaiono: si costruisce uno alla volta. */
  const cinteVisibili = useMemo(() => {
    const ordine = BLOCCHI_FORTEZZA.map((b) => b.key)
    return ordine.slice(0, ordine.indexOf(bloccoCorrente) + 1)
  }, [bloccoCorrente])

  function rispondi(stato: StatoVoce) {
    if (!voceCorrente || soloLettura || transizione.current) return
    onRispondi(voceCorrente.key, stato)
    setNotaAperta(false)
    if (indice < VOCI_FORTEZZA.length - 1) {
      transizione.current = setTimeout(() => {
        transizione.current = null
        setIndice((v) => Math.min(v + 1, VOCI_FORTEZZA.length - 1))
      }, 300)
    }
  }

  function vaiAVoce(prossimo: number) {
    if (transizione.current) {
      clearTimeout(transizione.current)
      transizione.current = null
    }
    setNotaAperta(false)
    setIndice(Math.min(Math.max(prossimo, 0), VOCI_FORTEZZA.length - 1))
  }

  if (!voceCorrente || !testi) return null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Indicatori voci={voci} indiceCorrente={indice} onVai={vaiAVoce} />

      {/* la scena prende tutto lo spazio che resta */}
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-3xl border-2 border-notte/12 bg-sabbia-chiara p-3">
        <Fortezza
          membri={membri}
          voci={voci}
          voceInCorso={voceCorrente.key}
          cinteVisibili={cinteVisibili}
          className="h-full w-full"
        />
      </div>

      {/* la domanda e le tre risposte, sempre nello stesso posto */}
      <div className="shrink-0 rounded-3xl border-2 border-notte/15 bg-sabbia-chiara px-6 py-4">
        <div className="flex flex-wrap items-baseline gap-x-3 text-base text-notte/50">
          <span className="font-semibold uppercase tracking-wide">
            {copy.blocchi[bloccoCorrente].nome}
          </span>
          <span>·</span>
          <span>{copy.blocchi[bloccoCorrente].titolo}</span>
          {testi.sigla ? (
            <>
              <span>·</span>
              <span>{testi.sigla}</span>
            </>
          ) : null}
        </div>

        <div key={voceCorrente.key} className="anim-entra mt-1 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-center">
          <div>
            <h2 className="text-[clamp(1.35rem,2.2vw,1.9rem)] leading-snug">{testi.domanda}</h2>
            <p className="mt-1 text-lg leading-snug text-notte/65">{testi.protegge}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {STATI.map((stato) => (
              <button
                key={stato}
                type="button"
                disabled={soloLettura}
                onClick={() => rispondi(stato)}
                className={`rounded-2xl border-2 px-3 py-4 text-lg font-semibold transition-colors duration-200 ${
                  riga?.stato === stato
                    ? COLORE_STATO[stato]
                    : 'border-notte/20 bg-sabbia hover:border-notte/60'
                }`}
              >
                {copy.statiVoce[stato]}
              </button>
            ))}
          </div>
        </div>

        {notaAperta || riga?.nota ? (
          <textarea
            value={riga?.nota ?? ''}
            disabled={soloLettura}
            placeholder={copy.fortezza.nota_placeholder}
            onChange={(e) => onAnnota(voceCorrente.key, e.target.value)}
            className="mt-3 min-h-[3.4rem] w-full rounded-2xl border-2 border-notte/20 bg-sabbia px-4 py-2 text-base outline-none focus:border-notte"
          />
        ) : (
          <button
            type="button"
            disabled={soloLettura}
            onClick={() => setNotaAperta(true)}
            className="mt-2 min-h-0 text-base font-semibold text-notte/50 underline underline-offset-4 hover:text-notte"
          >
            ＋ {copy.fortezza.nota_aggiungi}
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * I quattro indicatori: mastio, mura interne, cortile, cinta esterna.
 *
 * Si riempiono man mano che si risponde, non man mano che si e' protetti:
 * un indicatore che misurasse le coperture presenti sarebbe un punteggio
 * mostrato al cliente, e i punteggi non si mostrano.
 *
 * Ogni tacca e' anche il modo per tornare su una voce gia' data.
 */
function Indicatori({
  voci,
  indiceCorrente,
  onVai,
}: {
  voci: FortressItem[]
  indiceCorrente: number
  onVai: (indice: number) => void
}) {
  return (
    <ul className="flex shrink-0 flex-wrap justify-center gap-x-7 gap-y-2">
      {BLOCCHI_FORTEZZA.map((blocco) => (
        <li key={blocco.key} className="flex flex-col gap-1">
          <span className="text-sm font-semibold uppercase tracking-wide text-notte/45">
            {copy.blocchi[blocco.key].nome}
          </span>
          <div className="flex gap-1">
            {blocco.voci.map((voceKey) => {
              const indice = VOCI_FORTEZZA.findIndex((v) => v.key === voceKey)
              const risposta = voci.find((v) => v.voce_key === voceKey)?.stato ?? null
              const corrente = indice === indiceCorrente
              return (
                <button
                  key={voceKey}
                  type="button"
                  aria-label={copy.vociFortezza[voceKey]?.nome ?? voceKey}
                  aria-current={corrente ? 'step' : undefined}
                  onClick={() => onVai(indice)}
                  className={`h-2.5 min-h-0 rounded-full transition-all duration-400 ${
                    corrente ? 'w-11 bg-sole' : risposta ? 'w-7 bg-notte/55' : 'w-7 bg-notte/12'
                  }`}
                />
              )
            })}
          </div>
        </li>
      ))}
    </ul>
  )
}
