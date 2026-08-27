/**
 * Strati 1, 2 e 5: silhouette, pelle, capelli, espressione.
 *
 * Tutto e' disegnato in funzione delle Proporzioni della fascia d'eta': cambiando
 * fascia cambiano i numeri, non i tracciati.
 */

import { colorePelle, coloreCapelli, taglio } from '@/lib/avatar/palette'
import { TRATTO, TRATTO_SOTTILE } from '@/lib/avatar/tipi'
import type { ContestoAvatar, Proporzioni } from '@/lib/avatar/tipi'

const NOTTE = 'var(--notte)'

/** Gambe e scarpe. Vanno sotto a tutto il resto. */
export function Gambe({ P, colore }: { P: Proporzioni; colore: string }) {
  const meta = P.passoW / 2
  const larghezza = P.arto
  const scarpaY = P.piediY - 7
  return (
    <g>
      {[-1, 1].map((lato) => {
        const x = P.testaX + lato * meta - larghezza / 2
        return (
          <g key={lato}>
            <rect
              x={x}
              y={P.ancheY - 6}
              width={larghezza}
              height={scarpaY - P.ancheY + 8}
              rx={larghezza / 2}
              fill={colore}
              stroke={NOTTE}
              strokeWidth={TRATTO}
            />
            <path
              d={`M${x - 1.5} ${scarpaY} h${larghezza + 5} a4 4 0 0 1 4 4 v1 a2 2 0 0 1 -2 2 h${-(larghezza + 7)} a3 3 0 0 1 -3 -3 z`}
              fill={NOTTE}
              stroke={NOTTE}
              strokeWidth={TRATTO_SOTTILE}
              strokeLinejoin="round"
            />
          </g>
        )
      })}
    </g>
  )
}

/** Braccia lungo i fianchi, con la mano in fondo. */
export function Braccia({
  P,
  colore,
  pelle,
  manicaFino = 0.55,
}: {
  P: Proporzioni
  colore: string
  pelle: string
  /** quanta parte del braccio e' coperta dalla manica, 0..1 */
  manicaFino?: number
}) {
  const spessore = P.arto * 0.86
  const cima = P.spalleY - 2
  const fondo = P.vitaY + 10
  const finoA = cima + (fondo - cima) * manicaFino

  return (
    <g>
      {[-1, 1].map((lato) => {
        // il braccio entra sotto la spalla: e' il busto, disegnato dopo, a
        // coprirne l'attacco e a farlo leggere come un corpo solo
        const x = P.testaX + lato * (P.spalleW - spessore * 0.16) - spessore / 2
        return (
          <g key={lato}>
            {/* braccio nudo, completo: la manica ci si posa sopra */}
            <rect
              x={x}
              y={cima}
              width={spessore}
              height={fondo - cima}
              rx={spessore / 2}
              fill={pelle}
              stroke={NOTTE}
              strokeWidth={TRATTO}
            />
            {manicaFino > 0 ? (
              <path
                d={`M${x} ${cima + spessore / 2} a${spessore / 2} ${spessore / 2} 0 0 1 ${spessore} 0 V${finoA} h${-spessore} z`}
                fill={colore}
                stroke={NOTTE}
                strokeWidth={TRATTO}
                strokeLinejoin="round"
              />
            ) : null}
            {/* mano */}
            <circle
              cx={x + spessore / 2}
              cy={fondo}
              r={spessore * 0.56}
              fill={pelle}
              stroke={NOTTE}
              strokeWidth={TRATTO}
            />
          </g>
        )
      })}
    </g>
  )
}

/** Busto nudo: il capo di vestiario si posa sopra questa forma. */
export function Busto({ P, colore }: { P: Proporzioni; colore: string }) {
  return (
    <path
      d={sagomaBusto(P)}
      fill={colore}
      stroke={NOTTE}
      strokeWidth={TRATTO}
      strokeLinejoin="round"
    />
  )
}

/** Il tracciato del busto, riusato da ogni capo di vestiario. */
export function sagomaBusto(P: Proporzioni, allunga = 0): string {
  const sx = P.testaX - P.spalleW
  const dx = P.testaX + P.spalleW
  const vsx = P.testaX - P.vitaW
  const vdx = P.testaX + P.vitaW
  const fondo = P.ancheY + allunga
  return [
    `M${sx + 6} ${P.spalleY}`,
    `Q${sx} ${P.spalleY} ${sx} ${P.spalleY + 5}`,
    `L${vsx} ${fondo - 6}`,
    `Q${vsx} ${fondo} ${vsx + 6} ${fondo}`,
    `L${vdx - 6} ${fondo}`,
    `Q${vdx} ${fondo} ${vdx} ${fondo - 6}`,
    `L${dx} ${P.spalleY + 5}`,
    `Q${dx} ${P.spalleY} ${dx - 6} ${P.spalleY}`,
    'Z',
  ].join(' ')
}

export function Collo({ P, pelle }: { P: Proporzioni; pelle: string }) {
  const w = P.testaR * 0.5
  return (
    <rect
      x={P.testaX - w / 2}
      y={P.colloY - 4}
      width={w}
      height={P.spalleY - P.colloY + 8}
      rx={4}
      fill={pelle}
      stroke={NOTTE}
      strokeWidth={TRATTO}
    />
  )
}

export function Testa({ P, pelle }: { P: Proporzioni; pelle: string }) {
  return (
    <g>
      {/* orecchie */}
      {[-1, 1].map((lato) => (
        <circle
          key={lato}
          cx={P.testaX + lato * (P.testaR - 1)}
          cy={P.testaY + P.testaR * 0.15}
          r={P.testaR * 0.19}
          fill={pelle}
          stroke={NOTTE}
          strokeWidth={TRATTO_SOTTILE}
        />
      ))}
      <rect
        x={P.testaX - P.testaR}
        y={P.testaY - P.testaR}
        width={P.testaR * 2}
        height={P.testaR * 2.02}
        rx={P.testaR * 0.72}
        fill={pelle}
        stroke={NOTTE}
        strokeWidth={TRATTO}
      />
    </g>
  )
}

/** Un solo set in v1. La firma prevede gia' gli altri. */
export function Viso({ P }: { P: Proporzioni; espressione?: 'sorriso' }) {
  const occhioY = P.testaY + P.testaR * 0.05
  const dx = P.testaR * 0.38
  const r = P.testaR * 0.105
  return (
    <g>
      {[-1, 1].map((lato) => (
        <circle key={lato} cx={P.testaX + lato * dx} cy={occhioY} r={r} fill={NOTTE} />
      ))}
      <path
        d={`M${P.testaX - P.testaR * 0.28} ${P.testaY + P.testaR * 0.42} q${P.testaR * 0.28} ${P.testaR * 0.3} ${P.testaR * 0.56} 0`}
        fill="none"
        stroke={NOTTE}
        strokeWidth={TRATTO_SOTTILE}
        strokeLinecap="round"
      />
    </g>
  )
}

export function Capelli({ P, colore, stile }: { P: Proporzioni; colore: string; stile: string }) {
  const { testaX: x, testaY: y, testaR: r } = P
  const contorno = { fill: colore, stroke: NOTTE, strokeWidth: TRATTO, strokeLinejoin: 'round' as const }

  if (stile === 'rasato') {
    return (
      <path
        d={`M${x - r} ${y - r * 0.28} a${r} ${r * 0.9} 0 0 1 ${r * 2} 0 q${-r} ${-r * 0.32} ${-r * 2} 0 z`}
        {...contorno}
      />
    )
  }

  if (stile === 'riccio') {
    return (
      <g {...contorno}>
        {/* i riccioli si posano sulla calotta, non fluttuano sopra */}
        {[-0.78, -0.42, 0, 0.42, 0.78].map((f) => (
          <circle key={f} cx={x + r * f} cy={y - r * (0.62 - 0.22 * f * f)} r={r * 0.34} />
        ))}
        <path
          d={`M${x - r * 1.04} ${y - r * 0.12} a${r * 1.04} ${r * 1.0} 0 0 1 ${r * 2.08} 0 q${-r * 1.04} ${-r * 0.42} ${-r * 2.08} 0 z`}
        />
      </g>
    )
  }

  if (stile === 'lungo') {
    return (
      <g {...contorno}>
        <path
          d={`M${x - r * 1.06} ${y + r * 0.9} L${x - r * 1.06} ${y - r * 0.16} a${r * 1.06} ${r} 0 0 1 ${r * 2.12} 0 L${x + r * 1.06} ${y + r * 0.9} q${-r * 0.3} ${r * 0.2} ${-r * 0.42} ${-r * 0.1} L${x + r * 0.66} ${y - r * 0.3} q${-r * 0.66} ${r * 0.3} ${-r * 1.32} 0 L${x - r * 0.64} ${y + r * 0.8} q${-r * 0.12} ${r * 0.3} ${-r * 0.42} ${r * 0.1} z`}
        />
      </g>
    )
  }

  if (stile === 'raccolto') {
    return (
      <g {...contorno}>
        <circle cx={x} cy={y - r * 1.1} r={r * 0.42} />
        <path
          d={`M${x - r * 1.02} ${y - r * 0.06} a${r * 1.02} ${r * 0.98} 0 0 1 ${r * 2.04} 0 q${-r * 0.26} ${-r * 0.56} ${-r * 1.02} ${-r * 0.56} q${-r * 0.76} 0 ${-r * 1.02} ${r * 0.56} z`}
        />
      </g>
    )
  }

  if (stile === 'medio') {
    return (
      <g {...contorno}>
        <path
          d={`M${x - r * 1.04} ${y + r * 0.3} L${x - r * 1.04} ${y - r * 0.14} a${r * 1.04} ${r} 0 0 1 ${r * 2.08} 0 L${x + r * 1.04} ${y + r * 0.3} q${-r * 0.24} ${r * 0.12} ${-r * 0.36} ${-r * 0.1} L${x + r * 0.68} ${y - r * 0.3} q${-r * 0.68} ${r * 0.28} ${-r * 1.36} 0 L${x - r * 0.68} ${y + r * 0.2} q${-r * 0.12} ${r * 0.22} ${-r * 0.36} ${r * 0.1} z`}
        />
      </g>
    )
  }

  // corto
  return (
    <path
      d={`M${x - r * 1.02} ${y - r * 0.1} a${r * 1.02} ${r * 0.98} 0 0 1 ${r * 2.04} 0 q${-r * 0.16} ${-r * 0.44} ${-r * 0.62} ${-r * 0.36} q${-r * 0.4} ${-r * 0.34} ${-r * 0.86} ${-r * 0.02} q${-r * 0.42} ${-r * 0.06} ${-r * 0.56} ${r * 0.38} z`}
      {...contorno}
    />
  )
}

/** Strato pelle + capelli + espressione, pronto da montare sopra il vestiario. */
export function TestaCompleta({ P, seed }: Pick<ContestoAvatar, 'P' | 'seed'>) {
  return (
    <g>
      <Testa P={P} pelle={colorePelle(seed)} />
      <Viso P={P} />
      <Capelli P={P} colore={coloreCapelli(seed)} stile={taglio(seed)} />
    </g>
  )
}
