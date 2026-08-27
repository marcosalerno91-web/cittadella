'use client'

import { useMemo, useRef, useState } from 'react'

import * as copy from '@/content/copy'
import { PROFESSIONI, isProfessioneKey } from '@/lib/domain'
import type { ProfessioneKey } from '@/lib/domain'

interface Props {
  valore: ProfessioneKey
  /** testo scritto a mano quando il mestiere non e' in elenco */
  libera: string | null
  onCambia: (professione: ProfessioneKey, libera: string | null) => void
}

/**
 * Select ricercabile sulle professioni.
 *
 * Se il consulente scrive qualcosa che non e' in elenco, il testo viene
 * conservato cosi' com'e' e la figura passa al fallback neutro.
 */
export function SelettoreProfessione({ valore, libera, onCambia }: Props) {
  const [aperto, setAperto] = useState(false)
  const [cerca, setCerca] = useState('')
  const contenitore = useRef<HTMLDivElement>(null)

  const risultati = useMemo(() => {
    const q = cerca.trim().toLowerCase()
    if (!q) return PROFESSIONI
    return PROFESSIONI.filter((p) => {
      if (copy.professioni[p].toLowerCase().includes(q)) return true
      if (p.includes(q)) return true
      return copy.professioniSinonimi[p].some((s) => s.includes(q))
    })
  }, [cerca])

  const etichetta = libera ?? copy.professioni[valore]

  function scegli(p: ProfessioneKey) {
    onCambia(p, null)
    setCerca('')
    setAperto(false)
  }

  function confermaLibera() {
    const testo = cerca.trim()
    if (!testo) {
      setAperto(false)
      return
    }
    if (isProfessioneKey(testo)) {
      scegli(testo)
      return
    }
    // fallback obbligatorio: figura neutra, testo conservato per le statistiche
    onCambia('casual', testo)
    setCerca('')
    setAperto(false)
  }

  return (
    <div ref={contenitore} className="relative flex flex-col gap-2">
      <span className="text-base font-semibold text-notte/70">{copy.nucleo.professione}</span>

      {aperto ? (
        <>
          <input
            autoFocus
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const primo = risultati[0]
                if (primo && cerca.trim()) scegli(primo)
                else confermaLibera()
              }
              if (e.key === 'Escape') setAperto(false)
            }}
            onBlur={() => window.setTimeout(() => setAperto(false), 150)}
            placeholder={copy.nucleo.professione_cerca}
            className="w-full rounded-2xl border-2 border-notte bg-sabbia-chiara px-5 py-3 text-lg outline-none"
          />
          <ul className="absolute top-full z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border-2 border-notte/25 bg-sabbia-chiara py-2 shadow-[0_10px_30px_rgba(31,58,95,0.12)]">
            {risultati.map((p) => (
              <li key={p}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => scegli(p)}
                  className={`flex w-full items-center px-5 py-2 text-left text-lg hover:bg-sole/25 ${
                    p === valore ? 'font-semibold' : ''
                  }`}
                >
                  {copy.professioni[p]}
                </button>
              </li>
            ))}
            {risultati.length === 0 && cerca.trim() ? (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={confermaLibera}
                  className="w-full px-5 py-3 text-left text-lg"
                >
                  Usa “{cerca.trim()}”
                  <span className="mt-1 block text-base text-notte/55">
                    {copy.nucleo.professione_libera_aiuto}
                  </span>
                </button>
              </li>
            ) : null}
          </ul>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setAperto(true)}
          className="w-full rounded-2xl border-2 border-notte/25 bg-sabbia-chiara px-5 py-3 text-left text-lg hover:border-notte/60"
        >
          {etichetta}
        </button>
      )}
    </div>
  )
}
