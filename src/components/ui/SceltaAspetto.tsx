'use client'

import { FIGURE, LUNGHEZZE } from '@/lib/domain'
import type { AvatarSeed, Figura, LunghezzaCapelli } from '@/lib/domain'
import * as copy from '@/content/copy'

/**
 * Le due sole scelte estetiche dell'applicazione: figura e lunghezza dei
 * capelli. Stanno in vista, nella riga del componente, senza menu: si cambiano
 * con un tocco senza uscire dalla scena.
 *
 * Incarnato e colore dei capelli non hanno controllo: vengono dal nome.
 */
export function SceltaAspetto({
  seed,
  onCambia,
  disabilitato = false,
}: {
  seed: AvatarSeed
  onCambia: (seed: AvatarSeed) => void
  disabilitato?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-5">
      <Gruppo etichetta={copy.nucleo.figura}>
        {FIGURE.map((figura) => (
          <Tasto
            key={figura}
            attivo={seed.figura === figura}
            disabilitato={disabilitato}
            etichetta={copy.figure[figura]}
            onClick={() => onCambia({ ...seed, figura })}
          >
            <SegnoFigura figura={figura} />
          </Tasto>
        ))}
      </Gruppo>

      <Gruppo etichetta={copy.nucleo.capelli}>
        {LUNGHEZZE.map((capelli) => (
          <Tasto
            key={capelli}
            attivo={seed.capelli === capelli}
            disabilitato={disabilitato}
            etichetta={copy.lunghezze[capelli]}
            onClick={() => onCambia({ ...seed, capelli })}
          >
            <SegnoCapelli lunghezza={capelli} />
          </Tasto>
        ))}
      </Gruppo>
    </div>
  )
}

function Gruppo({ etichetta, children }: { etichetta: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-base font-semibold text-notte/70">{etichetta}</span>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

function Tasto({
  attivo,
  disabilitato,
  etichetta,
  onClick,
  children,
}: {
  attivo: boolean
  disabilitato: boolean
  etichetta: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabilitato}
      aria-pressed={attivo}
      onClick={onClick}
      title={etichetta}
      className={`flex h-[4.6rem] w-[4.6rem] min-h-0 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 transition-colors duration-200 ${
        attivo ? 'border-notte bg-sole' : 'border-notte/20 bg-sabbia-chiara hover:border-notte/55'
      }`}
    >
      {children}
      <span className="text-[0.68rem] font-semibold leading-none">{etichetta}</span>
    </button>
  )
}

/** Le due silhouette, ridotte all'osso: e' il rapporto spalle-fianchi a parlare. */
function SegnoFigura({ figura }: { figura: Figura }) {
  const notte = 'var(--notte)'
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" strokeLinejoin="round">
      <circle cx="16" cy="8" r="4.4" stroke={notte} strokeWidth="2.4" />
      {figura === 'maschile' ? (
        <path d="M8.5 25 V17.5 a7.5 7.5 0 0 1 15 0 V25 a1.5 1.5 0 0 1 -1.5 1.5 h-12 A1.5 1.5 0 0 1 8.5 25 Z"
          stroke={notte} strokeWidth="2.4" />
      ) : (
        <path d="M9.5 26 q1.6 -6 -0.4 -8.6 a7 7 0 0 1 13.8 0 q-2 2.6 -0.4 8.6 z"
          stroke={notte} strokeWidth="2.4" />
      )}
    </svg>
  )
}

/** Tre teste viste di fronte, con la chioma che si allunga. */
function SegnoCapelli({ lunghezza }: { lunghezza: LunghezzaCapelli }) {
  const notte = 'var(--notte)'
  const fondo = lunghezza === 'cortissimi' ? 11.5 : lunghezza === 'corti' ? 18 : 26
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" strokeLinejoin="round">
      <rect x="9" y="7" width="14" height="16" rx="6" stroke={notte} strokeWidth="2.2" />
      <path
        d={`M8 13 a8 8 0 0 1 16 0 V${fondo} q-2.4 1.4 -3.4 -0.4 V12.5 q-4.6 2 -9.2 0 V${fondo - 0.4} q-1 1.8 -3.4 0.4 Z`}
        fill={notte}
      />
    </svg>
  )
}
