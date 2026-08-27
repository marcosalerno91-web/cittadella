/**
 * Strato 4: l'oggetto-firma del mestiere.
 *
 * E' quello che rende un avatar riconoscibile a colpo d'occhio da 80 cm.
 * Gli oggetti stanno alla destra di chi guarda, all'altezza della mano, salvo
 * quelli che hanno senso solo altrove (stetoscopio al collo, laptop davanti).
 */

import { TRATTO, TRATTO_SOTTILE } from '@/lib/avatar/tipi'
import type { Proporzioni } from '@/lib/avatar/tipi'

const NOTTE = 'var(--notte)'

const contorno = {
  stroke: NOTTE,
  strokeWidth: TRATTO,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
}
const sottile = { ...contorno, strokeWidth: TRATTO_SOTTILE }

/** Punto della mano destra (a destra di chi guarda). */
function mano(P: Proporzioni): { x: number; y: number } {
  return { x: P.testaX + (P.spalleW - 1), y: P.vitaY + 10 }
}

export function Cartella({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  return (
    <g>
      <path d={`M${x} ${y - 4} q6 -10 13 -2`} fill="none" {...sottile} />
      <rect x={x + 6} y={y - 4} width={19} height={16} rx={3} fill="var(--corallo)" {...contorno} />
      <path d={`M${x + 6} ${y + 2} h19`} fill="none" {...sottile} />
    </g>
  )
}

export function Zaino({ P }: { P: Proporzioni }) {
  return (
    <g>
      <rect
        x={P.testaX - P.vitaW * 0.5}
        y={P.spalleY + 6}
        width={P.vitaW}
        height={22}
        rx={5}
        fill="var(--corallo)"
        {...contorno}
      />
    </g>
  )
}

export function Peluche({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  const cx = x + 12
  const cy = y + 1
  return (
    <g>
      <circle cx={cx - 5} cy={cy - 8} r={3.6} fill="var(--corallo)" {...sottile} />
      <circle cx={cx + 5} cy={cy - 8} r={3.6} fill="var(--corallo)" {...sottile} />
      <circle cx={cx} cy={cy - 2} r={7.6} fill="var(--corallo)" {...contorno} />
      <rect x={cx - 6} y={cy + 3} width={12} height={11} rx={5} fill="var(--corallo)" {...contorno} />
      <circle cx={cx - 2.4} cy={cy - 3} r={1.1} fill={NOTTE} />
      <circle cx={cx + 2.4} cy={cy - 3} r={1.1} fill={NOTTE} />
    </g>
  )
}

export function Stetoscopio({ P }: { P: Proporzioni }) {
  const y = P.spalleY + 2
  const w = P.testaR * 0.95
  return (
    <g>
      <path
        d={`M${P.testaX - w} ${y - 3} q${-4} ${16} ${2} ${24} M${P.testaX + w} ${y - 3} q${4} ${14} ${-1} ${20}`}
        fill="none"
        stroke="var(--salvia)"
        strokeWidth={TRATTO}
        strokeLinecap="round"
      />
      <circle cx={P.testaX + w - 1} cy={y + 20} r={4.6} fill="var(--salvia)" {...contorno} />
    </g>
  )
}

export function Libro({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  return (
    <g>
      <path
        d={`M${x + 2} ${y - 8} h20 a2 2 0 0 1 2 2 v14 a2 2 0 0 1 -2 2 h-20 Z`}
        fill="var(--salvia)"
        {...contorno}
      />
      <path d={`M${x + 6} ${y - 8} v18`} fill="none" {...sottile} />
      <path d={`M${x + 10} ${y - 3} h10 M${x + 10} ${y + 2} h10`} fill="none" {...sottile} />
    </g>
  )
}

/** Tenuto davanti con due mani: si legge subito. */
export function Laptop({ P }: { P: Proporzioni }) {
  const y = P.vitaY + 6
  const w = 17
  return (
    <g>
      <path
        d={`M${P.testaX - w} ${y - 14} h${w * 2} v13 h${-w * 2} Z`}
        fill="var(--notte)"
        {...contorno}
      />
      <path
        d={`M${P.testaX - w - 3} ${y - 1} h${w * 2 + 6} a2 2 0 0 1 -2 4 h${-(w * 2 + 2)} a2 2 0 0 1 -2 -4 Z`}
        fill="var(--nebbia)"
        {...contorno}
      />
      <path
        d={`M${P.testaX - w + 5} ${y - 9} h10 M${P.testaX - w + 5} ${y - 5} h16`}
        fill="none"
        stroke="var(--sabbia-chiara)"
        strokeWidth={TRATTO_SOTTILE}
        strokeLinecap="round"
      />
    </g>
  )
}

export function ChiaveInglese({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  const bx = x + 13
  return (
    <g>
      {/* manico */}
      <path
        d={`M${bx - 4} ${y + 16} L${bx + 3} ${y - 6}`}
        fill="none"
        stroke="var(--nebbia)"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <path
        d={`M${bx - 4} ${y + 16} L${bx + 3} ${y - 6}`}
        fill="none"
        {...sottile}
      />
      {/* ganascia aperta */}
      <path
        d={`M${bx - 2} ${y - 4} l11 3.6 -2.4 7.4 -3.4 -1.1 1.2 -3.8 -3.4 -1.1 -1.2 3.8 -3.4 -1.1 z`}
        transform={`rotate(-72 ${bx + 3} ${y - 6})`}
        fill="var(--nebbia)"
        {...sottile}
      />
    </g>
  )
}

export function Forcone({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  const asta = x + 12
  return (
    <g>
      <path d={`M${asta} ${y + 22} V${y - 34}`} fill="none" stroke="#B98A52" strokeWidth={6} strokeLinecap="round" />
      <path d={`M${asta} ${y + 22} V${y - 34}`} fill="none" {...sottile} />
      <path
        d={`M${asta - 10} ${y - 28} V${y - 44} M${asta} ${y - 30} V${y - 46} M${asta + 10} ${y - 28} V${y - 44} M${asta - 10} ${y - 28} q10 -5 20 0`}
        fill="none"
        stroke="var(--nebbia)"
        strokeWidth={5}
        strokeLinecap="round"
      />
    </g>
  )
}

export function Cassetta({ P }: { P: Proporzioni }) {
  const y = P.vitaY + 8
  const w = 16
  return (
    <g>
      <path
        d={`M${P.testaX - w} ${y - 12} h${w * 2} l-3 15 h${-(w * 2 - 6)} Z`}
        fill="#C98F55"
        {...contorno}
      />
      <circle cx={P.testaX - 6} cy={y - 15} r={4.4} fill="var(--corallo)" {...sottile} />
      <circle cx={P.testaX + 4} cy={y - 16} r={5} fill="var(--salvia)" {...sottile} />
    </g>
  )
}

export function Padella({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  return (
    <g>
      <path d={`M${x + 3} ${y + 2} h20`} fill="none" stroke={NOTTE} strokeWidth={4} strokeLinecap="round" />
      <path
        d={`M${x - 12} ${y - 2} h16 a8 8 0 0 1 -16 0 Z`}
        fill="var(--nebbia)"
        {...contorno}
      />
    </g>
  )
}

export function Faldone({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  return (
    <g>
      <path
        d={`M${x + 2} ${y - 10} h18 a2 2 0 0 1 2 2 v18 a2 2 0 0 1 -2 2 h-18 a2 2 0 0 1 -2 -2 v-18 a2 2 0 0 1 2 -2 Z`}
        fill="var(--sabbia-chiara)"
        {...contorno}
      />
      <path
        d={`M${x + 5} ${y - 4} h12 M${x + 5} ${y + 1} h12 M${x + 5} ${y + 6} h7`}
        fill="none"
        {...sottile}
      />
      <path d={`M${x + 6} ${y - 10} v22`} fill="none" stroke="var(--corallo)" strokeWidth={3.4} />
    </g>
  )
}

export function Calcolatrice({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  return (
    <g>
      <rect x={x + 3} y={y - 10} width={16} height={22} rx={3} fill="var(--nebbia)" {...contorno} />
      <rect x={x + 6} y={y - 7} width={10} height={5} rx={1} fill="var(--sabbia-chiara)" {...sottile} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <circle key={`${r}${c}`} cx={x + 7 + c * 4} cy={y + 1 + r * 4} r={1.2} fill={NOTTE} />
        )),
      )}
    </g>
  )
}

export function RulloDisegni({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  return (
    <g>
      <path
        d={`M${x + 4} ${y + 14} L${x + 16} ${y - 14}`}
        fill="none"
        stroke="var(--sabbia-chiara)"
        strokeWidth={9}
        strokeLinecap="round"
      />
      <path
        d={`M${x + 4} ${y + 14} L${x + 16} ${y - 14}`}
        fill="none"
        {...sottile}
      />
      <ellipse
        cx={x + 16}
        cy={y - 14}
        rx={4.6}
        ry={3}
        transform={`rotate(-23 ${x + 16} ${y - 14})`}
        fill="var(--sabbia)"
        {...sottile}
      />
      <path d={`M${x + 7} ${y + 3} l10 -4`} fill="none" stroke="var(--corallo)" strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

export function Volante({ P }: { P: Proporzioni }) {
  const y = P.vitaY - 6
  return (
    <g>
      <circle cx={P.testaX} cy={y} r={13} fill="none" stroke={NOTTE} strokeWidth={5.5} />
      <circle cx={P.testaX} cy={y} r={4.4} fill="var(--nebbia)" {...contorno} />
      <path
        d={`M${P.testaX - 10} ${y + 3} h6 M${P.testaX + 4} ${y + 3} h6 M${P.testaX} ${y - 9} v5`}
        fill="none"
        stroke={NOTTE}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </g>
  )
}

export function Forbici({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  const cx = x + 12
  return (
    <g>
      <path
        d={`M${cx - 5} ${y - 12} L${cx + 4} ${y + 6} M${cx + 5} ${y - 12} L${cx - 4} ${y + 6}`}
        fill="none"
        stroke="var(--nebbia)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={cx - 5} cy={y + 10} r={4} fill="none" stroke={NOTTE} strokeWidth={TRATTO} />
      <circle cx={cx + 5} cy={y + 10} r={4} fill="none" stroke={NOTTE} strokeWidth={TRATTO} />
      <circle cx={cx} cy={y - 1} r={1.6} fill={NOTTE} />
    </g>
  )
}

export function Fischietto({ P }: { P: Proporzioni }) {
  const y = P.spalleY + 2
  const w = P.testaR * 0.9
  return (
    <g>
      <path
        d={`M${P.testaX - w} ${y - 3} q${-3} ${18} ${w * 0.5} ${24} h${w} q${w * 0.9} ${-6} ${w * 0.6} ${-24}`}
        fill="none"
        stroke="var(--corallo)"
        strokeWidth={TRATTO_SOTTILE}
        strokeLinecap="round"
      />
      <path
        d={`M${P.testaX - 7} ${y + 20} h11 a5.5 5.5 0 0 1 0 11 h-11 a5.5 5.5 0 0 1 0 -11 Z`}
        fill="var(--sole)"
        {...contorno}
      />
      <path d={`M${P.testaX + 5} ${y + 25.5} h7`} fill="none" stroke={NOTTE} strokeWidth={3.4} strokeLinecap="round" />
    </g>
  )
}

export function Cesto({ P }: { P: Proporzioni }) {
  const y = P.vitaY + 10
  const w = 15
  return (
    <g>
      <path
        d={`M${P.testaX - w} ${y - 10} h${w * 2} l-2 14 h${-(w * 2 - 4)} Z`}
        fill="var(--nebbia)"
        {...contorno}
      />
      <path
        d={`M${P.testaX - w + 3} ${y - 10} q${w - 3} ${-10} ${(w - 3) * 2} 0`}
        fill="none"
        {...contorno}
      />
      <path
        d={`M${P.testaX - 9} ${y - 6} h18 M${P.testaX - 8} ${y - 1} h16`}
        fill="none"
        {...sottile}
      />
    </g>
  )
}

export function Manubrio({ P }: { P: Proporzioni }) {
  const { x, y } = mano(P)
  return (
    <g>
      <path d={`M${x + 4} ${y + 2} h16`} fill="none" stroke={NOTTE} strokeWidth={4} strokeLinecap="round" />
      <rect x={x + 1} y={y - 5} width={6} height={14} rx={2} fill="var(--notte)" {...sottile} />
      <rect x={x + 17} y={y - 5} width={6} height={14} rx={2} fill="var(--notte)" {...sottile} />
    </g>
  )
}

/** Distintivo: forze dell'ordine. */
export function Distintivo({ P }: { P: Proporzioni }) {
  const x = P.testaX + P.vitaW * 0.42
  const y = P.spalleY + P.testaR * 0.8
  return (
    <path
      d={`M${x} ${y - 5} l4 2.4 -1.5 4.6 -5 0 -1.5 -4.6 Z`}
      fill="var(--sole)"
      {...sottile}
    />
  )
}
