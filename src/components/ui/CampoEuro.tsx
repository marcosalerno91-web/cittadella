'use client'

import { useRef, useState } from 'react'

import { euro } from '@/lib/engine/crm'

interface Props {
  etichetta: string
  aiuto?: string
  valore: number
  onCambia: (valore: number) => void
  disabilitato?: boolean
  /** contenuto a sinistra dell'importo: l'avatar del membro, per esempio */
  accanto?: React.ReactNode
}

/**
 * Importo mensile in euro. Interi, niente decimali, formattazione automatica.
 * Mentre si digita si vedono le cifre nude; appena si esce compare l'euro.
 */
export function CampoEuro({ etichetta, aiuto, valore, onCambia, disabilitato, accanto }: Props) {
  const [testo, setTesto] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const mostrato = testo ?? (valore === 0 ? '' : String(valore))

  return (
    <label className="flex items-center gap-4 rounded-2xl border-2 border-notte/15 bg-sabbia-chiara px-5 py-3">
      {accanto ? <span className="shrink-0">{accanto}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-lg font-semibold">{etichetta}</span>
        {aiuto ? <span className="block text-sm text-notte/50">{aiuto}</span> : null}
      </span>
      <span className="flex shrink-0 items-baseline gap-1">
        <input
          ref={input}
          type="text"
          inputMode="numeric"
          disabled={disabilitato}
          value={mostrato}
          placeholder="0"
          onFocus={() => setTesto(valore === 0 ? '' : String(valore))}
          onBlur={() => setTesto(null)}
          onChange={(e) => {
            const pulito = e.target.value.replace(/[^\d]/g, '').slice(0, 7)
            setTesto(pulito)
            onCambia(pulito === '' ? 0 : Number(pulito))
          }}
          className="w-28 rounded-xl border-2 border-notte/20 bg-sabbia px-3 py-2 text-right text-2xl font-semibold tabular-nums outline-none focus:border-notte sm:w-36"
          aria-label={etichetta}
        />
        <span className="text-2xl font-semibold">€</span>
      </span>
    </label>
  )
}

export function ImportoGrande({ valore, className = '' }: { valore: number; className?: string }) {
  return <span className={`tabular-nums ${className}`}>{euro(valore)}</span>
}
