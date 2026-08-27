'use client'

import Link from 'next/link'

import { Bottone } from '@/components/ui/Bottone'
import { FASI } from '@/lib/domain'
import type { FaseKey } from '@/lib/domain'
import type { StatoSalvataggio } from '@/lib/use-salvataggio'
import * as copy from '@/content/copy'

interface Props {
  fase: FaseKey
  etichettaCliente: string
  stato: StatoSalvataggio
  indietro?: () => void
  avanti?: () => void
  avantiEtichetta?: string
  avantiBloccato?: boolean
}

export function BarraFase({
  fase,
  etichettaCliente,
  stato,
  indietro,
  avanti,
  avantiEtichetta,
  avantiBloccato = false,
}: Props) {
  const indice = FASI.indexOf(fase)

  return (
    <div className="z-30 -mx-6 mb-4 flex shrink-0 flex-wrap items-center justify-between gap-4 border-b-2 border-notte/10 px-6 py-3 sm:-mx-10 sm:px-10">
      <div className="flex items-center gap-4">
        <Link
          href="/clienti"
          className="text-base font-semibold text-notte/60 underline underline-offset-4 hover:text-notte"
        >
          {etichettaCliente}
        </Link>
        <IndicatoreSalvataggio stato={stato} />
      </div>

      <ol className="flex items-center gap-2" aria-label="Avanzamento">
        {FASI.map((f, i) => (
          <li
            key={f}
            aria-current={f === fase ? 'step' : undefined}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              i < indice ? 'w-8 bg-salvia' : i === indice ? 'w-12 bg-sole' : 'w-2.5 bg-notte/15'
            }`}
          />
        ))}
      </ol>

      <div className="flex items-center gap-3">
        {indietro ? (
          <Bottone variante="fantasma" onClick={indietro}>
            ← {copy.navigazione.indietro}
          </Bottone>
        ) : null}
        {avanti ? (
          <Bottone onClick={avanti} disabled={avantiBloccato}>
            {avantiEtichetta ?? copy.navigazione.avanti} →
          </Bottone>
        ) : null}
      </div>
    </div>
  )
}

function IndicatoreSalvataggio({ stato }: { stato: StatoSalvataggio }) {
  if (stato === 'fermo') return null

  // Quando la rete cade l'avviso non deve spostare la scena: e' un cartiglio
  // che compare in basso e se ne va da solo, senza far saltare il discorso.
  if (stato === 'errore') {
    return (
      <>
        <span className="flex items-center gap-2 text-sm text-notte/50">
          <span className="h-2.5 w-2.5 rounded-full bg-corallo" />
          {copy.navigazione.riprova}
        </span>
        <p
          role="status"
          className="anim-entra fixed bottom-5 left-1/2 z-50 w-[min(34rem,92vw)] -translate-x-1/2 rounded-2xl border-2 border-notte/20 bg-sole/95 px-6 py-3 text-center text-base leading-snug shadow-[0_8px_28px_rgba(31,58,95,0.18)]"
        >
          {copy.navigazione.offline}
        </p>
      </>
    )
  }

  return (
    <span role="status" className="flex items-center gap-2 text-sm text-notte/50">
      <span
        className={`h-2.5 w-2.5 rounded-full ${stato === 'salvo' ? 'bg-sole' : 'bg-salvia'}`}
      />
      {stato === 'salvo' ? copy.navigazione.salvataggio : copy.navigazione.salvato}
    </span>
  )
}
