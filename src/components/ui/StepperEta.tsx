'use client'

import * as copy from '@/content/copy'

interface Props {
  valore: number
  onCambia: (eta: number) => void
}

/** Eta' con due tasti grandi: si tocca in due, su un solo schermo. */
export function StepperEta({ valore, onCambia }: Props) {
  function limita(v: number): number {
    if (!Number.isFinite(v)) return 0
    return Math.min(Math.max(Math.round(v), 0), 120)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-base font-semibold text-notte/70">{copy.nucleo.eta}</span>
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          aria-label="Un anno in meno"
          onClick={() => onCambia(limita(valore - 1))}
          className="w-14 rounded-2xl border-2 border-notte/25 bg-sabbia-chiara text-2xl font-semibold hover:border-notte/60"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={valore}
          onChange={(e) => onCambia(limita(Number(e.target.value)))}
          className="w-full rounded-2xl border-2 border-notte/25 bg-sabbia-chiara px-4 py-3 text-center text-2xl font-semibold tabular-nums outline-none focus:border-notte"
        />
        <button
          type="button"
          aria-label="Un anno in piu’"
          onClick={() => onCambia(limita(valore + 1))}
          className="w-14 rounded-2xl border-2 border-notte/25 bg-sabbia-chiara text-2xl font-semibold hover:border-notte/60"
        >
          ＋
        </button>
      </div>
    </div>
  )
}
