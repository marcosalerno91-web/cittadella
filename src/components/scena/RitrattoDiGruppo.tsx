/**
 * La famiglia tutta insieme in scena.
 *
 * E' un unico SVG: gli avatar condividono lo stesso viewBox e vengono
 * traslati e scalati sulla linea di terra. Torna identico nel PDF, nelle fasi
 * successive e ovunque serva far rivedere il nucleo.
 */

import { ContenutoAvatar } from '@/components/scena/Avatar'
import { VIEWBOX } from '@/lib/avatar/tipi'
import type { FamilyMember } from '@/lib/domain'

/** Linea di terra condivisa: e' su questa che tutti poggiano i piedi. */
export const TERRA = 156

/**
 * I bambini sono piu' bassi degli adulti. La statura cresce con l'eta' fino a
 * diciotto anni, poi si ferma.
 */
export function scalaPerEta(eta: number): number {
  if (eta >= 18) return 1
  // arrotondata: finisce dentro attributi SVG, e server e browser devono
  // scrivere esattamente la stessa stringa
  return Math.round((0.62 + 0.38 * (Math.max(eta, 0) / 18)) * 1000) / 1000
}

export interface PropsRitratto {
  membri: FamilyMember[]
  className?: string
  /** mostra nome ed eta' sotto ciascuno */
  conNomi?: boolean
  /** entrata sfalsata degli avatar */
  animato?: boolean
  passo?: number
}

export function RitrattoDiGruppo({
  membri,
  className = '',
  conNomi = true,
  animato = false,
  passo = 96,
}: PropsRitratto) {
  if (membri.length === 0) return null

  const larghezza = VIEWBOX.larghezza + (membri.length - 1) * passo
  const altezza = VIEWBOX.altezza + (conNomi ? 34 : 4)

  return (
    <svg
      viewBox={`0 0 ${larghezza} ${altezza}`}
      className={className}
      role="img"
      aria-label={`La famiglia: ${membri.map((m) => m.nome).join(', ')}`}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {membri.map((membro, indice) => {
        const s = scalaPerEta(membro.eta)
        const x = indice * passo
        return (
          <g
            key={membro.id}
            className={animato ? 'anim-posa' : undefined}
            style={animato ? { animationDelay: `${indice * 110}ms` } : undefined}
          >
            <g transform={`translate(${x} ${TERRA}) scale(${s}) translate(0 ${-TERRA})`}>
              <ContenutoAvatar
                nome={membro.nome}
                eta={membro.eta}
                professione={membro.professione_key}
                seed={membro.avatar_seed}
              />
            </g>
            {conNomi ? (
              <text
                x={x + VIEWBOX.larghezza / 2}
                y={VIEWBOX.altezza + 20}
                textAnchor="middle"
                fill="var(--notte)"
                fontSize="15"
                fontWeight="600"
                fontFamily="var(--font-sans)"
              >
                {membro.nome}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
