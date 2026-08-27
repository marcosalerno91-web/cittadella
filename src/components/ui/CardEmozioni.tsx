'use client'

import { MAX_EMOZIONI } from '@/config/engine'
import { emozioni as tutte } from '@/content/copy'
import type { Emozione } from '@/content/copy'

/** Un piccolo segno illustrato per ciascuna famiglia di emozioni. */
function Segno({ famiglia, scelta }: { famiglia: Emozione['famiglia']; scelta: boolean }) {
  const colore = scelta ? 'var(--notte)' : famiglia === 'serena' ? 'var(--salvia)' : 'var(--corallo)'
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11" fill="none" strokeLinecap="round">
      <circle cx="24" cy="24" r="18" stroke={colore} strokeWidth="3.4" />
      <circle cx="18" cy="21" r="2.2" fill={colore} />
      <circle cx="30" cy="21" r="2.2" fill={colore} />
      {famiglia === 'serena' ? (
        <path d="M17 29 q7 7 14 0" stroke={colore} strokeWidth="3.2" />
      ) : (
        <path d="M17 31 h14" stroke={colore} strokeWidth="3.2" />
      )}
    </svg>
  )
}

interface Props {
  scelte: string[]
  /** riceve la trasformazione da applicare, non il risultato gia' calcolato */
  onCambia: (aggiorna: (precedenti: string[]) => string[]) => void
  disabilitato?: boolean
}

export function CardEmozioni({ scelte, onCambia, disabilitato = false }: Props) {
  function alterna(key: string) {
    if (disabilitato) return
    onCambia((precedenti) => {
      if (precedenti.includes(key)) return precedenti.filter((k) => k !== key)
      if (precedenti.length >= MAX_EMOZIONI) return precedenti
      return [...precedenti, key]
    })
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {tutte.map((emozione) => {
        const scelta = scelte.includes(emozione.key)
        const piena = !scelta && scelte.length >= MAX_EMOZIONI
        return (
          <li key={emozione.key}>
            <button
              type="button"
              disabled={disabilitato || piena}
              aria-pressed={scelta}
              onClick={() => alterna(emozione.key)}
              className={`flex w-full flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 transition-colors duration-200 ${
                scelta
                  ? 'border-notte bg-sole'
                  : `border-notte/15 bg-sabbia-chiara ${piena ? 'opacity-35' : 'hover:border-notte/50'}`
              }`}
            >
              <Segno famiglia={emozione.famiglia} scelta={scelta} />
              <span className="text-base font-semibold leading-tight">{emozione.label}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
