/**
 * La scorta della cittadella.
 *
 * Un granaio che si riempie in proporzione alla capacita' di risparmio. Quando
 * non resta nulla il granaio e' vuoto, ma la scena non cambia tono: niente
 * rosso, niente segnali di pericolo. E' una fotografia, non un giudizio.
 */

import { SCORTA_RIEMPIMENTO_PIENO, livelloScorta } from '@/config/engine'
import type { LivelloScorta } from '@/config/engine'

const COLORI: Record<LivelloScorta, string> = {
  impegnata: 'var(--nebbia)',
  esile: 'var(--sole)',
  solida: 'var(--sole)',
  abbondante: 'var(--salvia)',
}

export function Granaio({
  crmMensile,
  crmPercentuale,
  className = '',
}: {
  crmMensile: number
  crmPercentuale: number
  className?: string
}) {
  const livello = livelloScorta(crmPercentuale, crmMensile)
  const riempimento = Math.min(Math.max(crmPercentuale, 0), SCORTA_RIEMPIMENTO_PIENO) / SCORTA_RIEMPIMENTO_PIENO

  // interno del granaio, in coordinate del viewBox
  const cima = 74
  const fondo = 176
  const altezza = (fondo - cima) * riempimento

  return (
    <svg
      viewBox="0 0 200 210"
      className={className}
      role="img"
      aria-label="La scorta della cittadella"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <clipPath id="granaio-interno">
          <path d="M40 74 h120 v102 a6 6 0 0 1 -6 6 H46 a6 6 0 0 1 -6 -6 Z" />
        </clipPath>
      </defs>

      {/* grano */}
      <g clipPath="url(#granaio-interno)">
        <rect
          x={40}
          y={fondo - altezza}
          width={120}
          height={altezza + 8}
          fill={COLORI[livello]}
          className="transition-all duration-700 ease-[var(--ease-scena)]"
        />
        {/* superficie mossa */}
        {altezza > 6 ? (
          <path
            d={`M40 ${fondo - altezza} q15 -8 30 0 t30 0 t30 0 t30 0 v10 H40 Z`}
            fill={COLORI[livello]}
            className="transition-all duration-700 ease-[var(--ease-scena)]"
          />
        ) : null}
      </g>

      {/* corpo del granaio */}
      <path
        d="M40 74 h120 v102 a6 6 0 0 1 -6 6 H46 a6 6 0 0 1 -6 -6 Z"
        stroke="var(--notte)"
        strokeWidth={5}
      />
      {/* tetto */}
      <path
        d="M30 74 L100 26 L170 74 Z"
        fill="var(--corallo)"
        stroke="var(--notte)"
        strokeWidth={5}
      />
      {/* doghe */}
      <path d="M70 74 v108 M100 74 v108 M130 74 v108" stroke="var(--notte)" strokeWidth={2.5} opacity={0.28} />
      {/* porta */}
      <path
        d="M84 182 v-34 a16 16 0 0 1 32 0 v34"
        stroke="var(--notte)"
        strokeWidth={5}
        fill="none"
      />
      {/* terra */}
      <path d="M16 182 h168" stroke="var(--notte)" strokeWidth={5} />
    </svg>
  )
}
