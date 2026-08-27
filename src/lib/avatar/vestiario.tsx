/**
 * Strato 3: i capi di vestiario.
 *
 * Sono mattoncini riusabili. Ogni professione si compone da questi, cosi' i
 * mestieri restano coerenti fra loro e si aggiunge un mestiere nuovo senza
 * ridisegnare nulla.
 */

import { sagomaBusto } from '@/lib/avatar/corpo'
import { TRATTO, TRATTO_SOTTILE } from '@/lib/avatar/tipi'
import type { Proporzioni } from '@/lib/avatar/tipi'

const NOTTE = 'var(--notte)'

const contorno = {
  stroke: NOTTE,
  strokeWidth: TRATTO,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
}

const contornoSottile = { ...contorno, strokeWidth: TRATTO_SOTTILE }

/** Il capo base che copre il busto. */
export function Capo({ P, colore, allunga = 0 }: { P: Proporzioni; colore: string; allunga?: number }) {
  return <path d={sagomaBusto(P, allunga)} fill={colore} {...contorno} />
}

/** Scollatura a V: da' subito l'idea di camicia o divisa. */
export function Scollo({ P, colore = 'none' }: { P: Proporzioni; colore?: string }) {
  const y = P.spalleY
  const w = P.testaR * 0.46
  return (
    <path
      d={`M${P.testaX - w} ${y - 1} L${P.testaX} ${y + P.testaR * 0.52} L${P.testaX + w} ${y - 1}`}
      fill={colore}
      {...contornoSottile}
    />
  )
}

/** Colletto della camicia. */
export function Colletto({ P, colore = '#FFFFFF' }: { P: Proporzioni; colore?: string }) {
  const y = P.spalleY
  const w = P.testaR * 0.52
  return (
    <g>
      <path
        d={`M${P.testaX - w} ${y - 2} L${P.testaX - w * 0.2} ${y + P.testaR * 0.42} L${P.testaX} ${y + 2} Z`}
        fill={colore}
        {...contornoSottile}
      />
      <path
        d={`M${P.testaX + w} ${y - 2} L${P.testaX + w * 0.2} ${y + P.testaR * 0.42} L${P.testaX} ${y + 2} Z`}
        fill={colore}
        {...contornoSottile}
      />
    </g>
  )
}

export function Cravatta({ P, colore }: { P: Proporzioni; colore: string }) {
  const y = P.spalleY + P.testaR * 0.28
  const w = 4.4
  return (
    <path
      d={`M${P.testaX - w} ${y} L${P.testaX + w} ${y} L${P.testaX + w * 0.7} ${y + 22} L${P.testaX} ${y + 27} L${P.testaX - w * 0.7} ${y + 22} Z`}
      fill={colore}
      {...contornoSottile}
    />
  )
}

export function Bottoni({ P, quanti = 3 }: { P: Proporzioni; quanti?: number }) {
  const cima = P.spalleY + P.testaR * 0.7
  const passo = (P.ancheY - cima - 6) / Math.max(quanti - 1, 1)
  return (
    <g>
      {Array.from({ length: quanti }, (_, i) => (
        <circle key={i} cx={P.testaX} cy={cima + passo * i} r={1.9} fill={NOTTE} />
      ))}
    </g>
  )
}

/** Camice aperto sul davanti: medico, laboratorio. */
export function Camice({ P }: { P: Proporzioni }) {
  return (
    <g>
      <path d={sagomaBusto(P, 12)} fill="#FFFFFF" {...contorno} />
      <path
        d={`M${P.testaX} ${P.spalleY + P.testaR * 0.5} V${P.ancheY + 12}`}
        fill="none"
        {...contornoSottile}
      />
      {/* revers */}
      <path
        d={`M${P.testaX - P.testaR * 0.5} ${P.spalleY - 1} L${P.testaX} ${P.spalleY + P.testaR * 0.5} L${P.testaX - P.testaR * 0.9} ${P.spalleY + P.testaR * 0.85} Z`}
        fill="#FFFFFF"
        {...contornoSottile}
      />
      <path
        d={`M${P.testaX + P.testaR * 0.5} ${P.spalleY - 1} L${P.testaX} ${P.spalleY + P.testaR * 0.5} L${P.testaX + P.testaR * 0.9} ${P.spalleY + P.testaR * 0.85} Z`}
        fill="#FFFFFF"
        {...contornoSottile}
      />
      {/* taschino */}
      <rect
        x={P.testaX + P.vitaW * 0.16}
        y={P.vitaY - 6}
        width={11}
        height={9}
        rx={2}
        fill="none"
        {...contornoSottile}
      />
    </g>
  )
}

/** Giacca formale: avvocato, commercialista, impiegato. */
export function Giacca({ P, colore }: { P: Proporzioni; colore: string }) {
  return (
    <g>
      <path d={sagomaBusto(P, 4)} fill={colore} {...contorno} />
      <path
        d={`M${P.testaX - P.testaR * 0.52} ${P.spalleY - 1} L${P.testaX} ${P.spalleY + P.testaR * 0.62} L${P.testaX - P.testaR * 1.0} ${P.spalleY + P.testaR * 0.95} Z`}
        fill={colore}
        {...contornoSottile}
      />
      <path
        d={`M${P.testaX + P.testaR * 0.52} ${P.spalleY - 1} L${P.testaX} ${P.spalleY + P.testaR * 0.62} L${P.testaX + P.testaR * 1.0} ${P.spalleY + P.testaR * 0.95} Z`}
        fill={colore}
        {...contornoSottile}
      />
    </g>
  )
}

/** Grembiule da lavoro: artigiano, commerciante. */
export function Grembiule({ P, colore }: { P: Proporzioni; colore: string }) {
  const cima = P.spalleY + P.testaR * 0.5
  const w = P.vitaW * 0.82
  return (
    <g>
      <path
        d={`M${P.testaX - P.testaR * 0.4} ${P.spalleY - 1} L${P.testaX - w * 0.6} ${cima} L${P.testaX - w} ${P.ancheY + 8} L${P.testaX + w} ${P.ancheY + 8} L${P.testaX + w * 0.6} ${cima} L${P.testaX + P.testaR * 0.4} ${P.spalleY - 1}`}
        fill={colore}
        {...contorno}
      />
      <path
        d={`M${P.testaX - w * 0.86} ${P.vitaY - 2} H${P.testaX + w * 0.86}`}
        fill="none"
        {...contornoSottile}
      />
      <rect
        x={P.testaX - 7}
        y={P.vitaY + 4}
        width={14}
        height={10}
        rx={2}
        fill="none"
        {...contornoSottile}
      />
    </g>
  )
}

/** Pettorina della tuta da lavoro: operaio, agricoltore. */
export function Salopette({ P, colore }: { P: Proporzioni; colore: string }) {
  const cima = P.spalleY + P.testaR * 0.42
  const w = P.vitaW * 0.72
  return (
    <g>
      <path
        d={`M${P.testaX - w} ${cima} h${w * 2} V${P.ancheY + 8} h${-w * 2} Z`}
        fill={colore}
        {...contorno}
      />
      {[-1, 1].map((lato) => (
        <path
          key={lato}
          d={`M${P.testaX + lato * w * 0.72} ${cima} L${P.testaX + lato * P.spalleW * 0.62} ${P.spalleY - 2}`}
          fill="none"
          stroke={NOTTE}
          strokeWidth={7}
          strokeLinecap="round"
        />
      ))}
      {[-1, 1].map((lato) => (
        <path
          key={`c${lato}`}
          d={`M${P.testaX + lato * w * 0.72} ${cima} L${P.testaX + lato * P.spalleW * 0.62} ${P.spalleY - 2}`}
          fill="none"
          stroke={colore}
          strokeWidth={3.6}
          strokeLinecap="round"
        />
      ))}
      <rect
        x={P.testaX - 6}
        y={cima + 6}
        width={12}
        height={9}
        rx={2}
        fill="none"
        {...contornoSottile}
      />
    </g>
  )
}

/** Gilet ad alta visibilita': autotrasportatore, cantiere. */
export function Gilet({ P, colore = 'var(--sole)' }: { P: Proporzioni; colore?: string }) {
  const w = P.vitaW * 0.95
  return (
    <g>
      <path
        d={`M${P.testaX - P.spalleW * 0.85} ${P.spalleY} L${P.testaX - w} ${P.ancheY + 4} h${w * 0.6} V${P.spalleY} Z`}
        fill={colore}
        {...contorno}
      />
      <path
        d={`M${P.testaX + P.spalleW * 0.85} ${P.spalleY} L${P.testaX + w} ${P.ancheY + 4} h${-w * 0.6} V${P.spalleY} Z`}
        fill={colore}
        {...contorno}
      />
      <path
        d={`M${P.testaX - w * 0.95} ${P.vitaY - 4} h${w * 0.35} M${P.testaX + w * 0.6} ${P.vitaY - 4} h${w * 0.35}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={3.4}
      />
    </g>
  )
}

/** Giacca da cuoco a doppio petto. */
export function GiaccaCuoco({ P }: { P: Proporzioni }) {
  return (
    <g>
      <path d={sagomaBusto(P, 3)} fill="#FFFFFF" {...contorno} />
      <path
        d={`M${P.testaX + P.testaR * 0.34} ${P.spalleY + 1} V${P.ancheY + 3}`}
        fill="none"
        {...contornoSottile}
      />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={P.testaX - 5} cy={P.spalleY + 16 + i * 12} r={1.8} fill={NOTTE} />
          <circle cx={P.testaX + 5} cy={P.spalleY + 16 + i * 12} r={1.8} fill={NOTTE} />
        </g>
      ))}
    </g>
  )
}

/** Toga stilizzata con collarino bianco. */
export function Toga({ P }: { P: Proporzioni }) {
  return (
    <g>
      <path d={sagomaBusto(P, 14)} fill="#2A2F3A" {...contorno} />
      <path
        d={`M${P.testaX - P.testaR * 0.55} ${P.spalleY - 1} L${P.testaX} ${P.spalleY + P.testaR * 0.9} L${P.testaX + P.testaR * 0.55} ${P.spalleY - 1} Z`}
        fill="#FFFFFF"
        {...contornoSottile}
      />
      <path
        d={`M${P.testaX} ${P.spalleY + P.testaR * 0.9} V${P.ancheY + 14}`}
        fill="none"
        {...contornoSottile}
      />
    </g>
  )
}

/** Felpa col cappuccio. */
export function Felpa({ P, colore }: { P: Proporzioni; colore: string }) {
  return (
    <g>
      <path d={sagomaBusto(P, 3)} fill={colore} {...contorno} />
      <path
        d={`M${P.testaX - P.testaR * 0.8} ${P.spalleY - 3} q${P.testaR * 0.8} ${P.testaR * 0.5} ${P.testaR * 1.6} 0 q${-P.testaR * 0.2} ${-P.testaR * 0.5} ${-P.testaR * 0.8} ${-P.testaR * 0.5} q${-P.testaR * 0.6} 0 ${-P.testaR * 0.8} ${P.testaR * 0.5} Z`}
        fill={colore}
        {...contornoSottile}
      />
      <path
        d={`M${P.testaX - 12} ${P.vitaY + 2} h24`}
        fill="none"
        {...contornoSottile}
      />
    </g>
  )
}

/** Maglia comoda con scollo tondo: cura della casa, tempo libero, casual. */
export function Comodo({ P, colore }: { P: Proporzioni; colore: string }) {
  return (
    <g>
      <Capo P={P} colore={colore} allunga={2} />
      <path
        d={`M${P.testaX - P.testaR * 0.5} ${P.spalleY} q${P.testaR * 0.5} ${P.testaR * 0.5} ${P.testaR} 0`}
        fill="none"
        {...contornoSottile}
      />
    </g>
  )
}

// ---------------------------------------------------------------- copricapo

export function Casco({ P, colore = 'var(--sole)' }: { P: Proporzioni; colore?: string }) {
  const { testaX: x, testaY: y, testaR: r } = P
  return (
    <g>
      <path
        d={`M${x - r * 1.16} ${y - r * 0.18} a${r * 1.16} ${r * 1.06} 0 0 1 ${r * 2.32} 0 Z`}
        fill={colore}
        {...contorno}
      />
      <path
        d={`M${x - r * 1.34} ${y - r * 0.18} h${r * 2.68}`}
        fill="none"
        {...contorno}
      />
      <path d={`M${x} ${y - r * 1.22} v${r * 1.02}`} fill="none" {...contornoSottile} />
    </g>
  )
}

export function Berretto({ P, colore }: { P: Proporzioni; colore: string }) {
  const { testaX: x, testaY: y, testaR: r } = P
  return (
    <g>
      <path
        d={`M${x - r * 1.06} ${y - r * 0.34} a${r * 1.06} ${r * 0.92} 0 0 1 ${r * 2.12} 0 Z`}
        fill={colore}
        {...contorno}
      />
      <path
        d={`M${x - r * 1.16} ${y - r * 0.34} h${r * 2.32} a2 2 0 0 1 0 ${r * 0.22} h${-r * 2.32} a2 2 0 0 1 0 ${-r * 0.22} Z`}
        fill="var(--sole)"
        {...contornoSottile}
      />
      <path
        d={`M${x - r * 1.2} ${y - r * 0.12} q${r * 0.6} ${r * 0.4} ${r * 1.2} ${r * 0.34}`}
        fill={colore}
        {...contornoSottile}
      />
    </g>
  )
}

export function CappelloPaglia({ P }: { P: Proporzioni }) {
  const { testaX: x, testaY: y, testaR: r } = P
  return (
    <g>
      <path
        d={`M${x - r * 1.5} ${y - r * 0.3} q${r * 1.5} ${r * 0.5} ${r * 3} 0 q${-r * 1.5} ${-r * 0.34} ${-r * 3} 0 Z`}
        fill="#E9C87C"
        {...contorno}
      />
      <path
        d={`M${x - r * 0.86} ${y - r * 0.32} a${r * 0.86} ${r * 0.88} 0 0 1 ${r * 1.72} 0 Z`}
        fill="#E9C87C"
        {...contorno}
      />
      <path
        d={`M${x - r * 0.88} ${y - r * 0.42} h${r * 1.76}`}
        fill="none"
        stroke="var(--corallo)"
        strokeWidth={TRATTO}
        strokeLinecap="round"
      />
    </g>
  )
}

export function CappelloSole({ P }: { P: Proporzioni }) {
  const { testaX: x, testaY: y, testaR: r } = P
  return (
    <g>
      <path
        d={`M${x - r * 1.44} ${y - r * 0.26} q${r * 1.44} ${r * 0.58} ${r * 2.88} 0 q${-r * 1.44} ${-r * 0.4} ${-r * 2.88} 0 Z`}
        fill="var(--sabbia-scura)"
        {...contorno}
      />
      <path
        d={`M${x - r * 0.8} ${y - r * 0.28} a${r * 0.8} ${r * 0.94} 0 0 1 ${r * 1.6} 0 Z`}
        fill="var(--sabbia-scura)"
        {...contorno}
      />
      <path
        d={`M${x - r * 0.82} ${y - r * 0.4} h${r * 1.64}`}
        fill="none"
        stroke="var(--salvia)"
        strokeWidth={TRATTO}
        strokeLinecap="round"
      />
    </g>
  )
}

export function CappelloCuoco({ P }: { P: Proporzioni }) {
  const { testaX: x, testaY: y, testaR: r } = P
  return (
    <g>
      <path
        d={`M${x - r * 0.92} ${y - r * 0.34} h${r * 1.84} v${-r * 0.34} h${-r * 1.84} Z`}
        fill="#FFFFFF"
        {...contorno}
      />
      <path
        d={`M${x - r * 0.86} ${y - r * 0.68} v${-r * 0.42} a${r * 0.42} ${r * 0.42} 0 0 1 ${r * 0.56} ${-r * 0.16} a${r * 0.44} ${r * 0.44} 0 0 1 ${r * 0.6} 0 a${r * 0.42} ${r * 0.42} 0 0 1 ${r * 0.56} ${r * 0.16} v${r * 0.42} Z`}
        fill="#FFFFFF"
        {...contorno}
      />
    </g>
  )
}

/** Cuffia da sala operatoria / divisa sanitaria. */
export function Cuffia({ P, colore }: { P: Proporzioni; colore: string }) {
  const { testaX: x, testaY: y, testaR: r } = P
  return (
    <path
      d={`M${x - r * 1.04} ${y - r * 0.24} a${r * 1.04} ${r} 0 0 1 ${r * 2.08} 0 Z`}
      fill={colore}
      {...contorno}
    />
  )
}
