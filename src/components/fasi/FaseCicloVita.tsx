'use client'

import { ContenutoAvatar } from '@/components/scena/Avatar'
import { scalaPerEta } from '@/components/scena/RitrattoDiGruppo'
import { CICLO_VITA, TEMPI, faseVita } from '@/config/engine'
import { ascissa, capacita } from '@/lib/engine/ciclo'
import { VIEWBOX } from '@/lib/avatar/tipi'
import * as copy from '@/content/copy'
import type { FamilyMember } from '@/lib/domain'

/** Coordinate della scena. Il grafico e' un'illustrazione, non un chart. */
const SCENA = {
  larghezza: 1000,
  altezza: 500,
  sinistra: 76,
  destra: 962,
  base: 384,
  cima: 92,
} as const

/** Altezza dell'avatar in coordinate di scena. */
const ALTEZZA_AVATAR = VIEWBOX.altezza * 0.52

function ascissaScena(eta: number): number {
  return arrotonda(SCENA.sinistra + ascissa(eta) * (SCENA.destra - SCENA.sinistra))
}

function ordinataScena(eta: number): number {
  return arrotonda(SCENA.base - capacita(eta) * (SCENA.base - SCENA.cima))
}

/** Vedi la nota in Fortezza.tsx: attributi SVG arrotondati, niente idratazioni infelici. */
function arrotonda(v: number): number {
  return Math.round(v * 100) / 100
}

/** La curva, campionata di due anni in due anni. */
function tracciatoCurva(): string {
  const punti: string[] = []
  for (let eta = CICLO_VITA.eta_minima; eta <= CICLO_VITA.eta_massima; eta += 2) {
    punti.push(`${eta === 0 ? 'M' : 'L'}${ascissaScena(eta).toFixed(1)} ${ordinataScena(eta).toFixed(1)}`)
  }
  return punti.join(' ')
}

const CAMPITURE = [
  { fase: 'studio' as const, da: CICLO_VITA.eta_minima, a: CICLO_VITA.fine_studio, colore: 'var(--salvia)' },
  { fase: 'lavoro' as const, da: CICLO_VITA.fine_studio, a: CICLO_VITA.fine_lavoro, colore: 'var(--sole)' },
  { fase: 'tempo_libero' as const, da: CICLO_VITA.fine_lavoro, a: CICLO_VITA.eta_massima, colore: 'var(--corallo)' },
]

/**
 * Due persone di eta' vicina stanno sullo stesso punto della curva: giusto cosi',
 * e' li' che si trovano. A non potersi sovrapporre sono i nomi, che vengono
 * impilati; e quando il punto e' troppo in basso, il nome passa sopra la testa.
 */
function disponiEtichette(membri: FamilyMember[]): Map<string, { y: number; sopra: boolean }> {
  const ordinati = [...membri].sort((a, b) => a.eta - b.eta)
  const posizioni = new Map<string, { y: number; sopra: boolean }>()

  let gruppoX = -Infinity
  let livello = 0

  for (const membro of ordinati) {
    const x = ascissaScena(membro.eta)
    const y = ordinataScena(membro.eta)
    livello = Math.abs(x - gruppoX) < 96 ? livello + 1 : 0
    gruppoX = x

    const sotto = y + 28 + livello * 46
    // sotto l'asse non si scrive: in quel caso il nome sale sopra la figura
    const sopra = sotto + 22 > SCENA.base
    posizioni.set(membro.id, {
      y: arrotonda(sopra ? y - ALTEZZA_AVATAR * scalaPerEta(membro.eta) - 30 - livello * 46 : sotto),
      sopra,
    })
  }

  return posizioni
}

export function FaseCicloVita({ membri }: { membri: FamilyMember[] }) {
  const curva = tracciatoCurva()
  const etichette = disponiEtichette(membri)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <svg
        viewBox={`0 0 ${SCENA.larghezza} ${SCENA.altezza}`}
        className="min-h-0 w-full flex-1"
        role="img"
        aria-label="Il ciclo della vita: dove si trova ciascuno"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* campiture */}
        {CAMPITURE.map((c) => {
          const x1 = ascissaScena(c.da)
          const x2 = ascissaScena(c.a)
          return (
            <g key={c.fase}>
              <rect
                x={x1}
                y={SCENA.cima - 34}
                width={x2 - x1}
                height={SCENA.base - SCENA.cima + 34}
                fill={c.colore}
                opacity={0.13}
              />
              <text
                x={(x1 + x2) / 2}
                y={SCENA.cima - 46}
                textAnchor="middle"
                fill="var(--notte)"
                fontSize="30"
                fontWeight="600"
                fontFamily="var(--font-display)"
              >
                {copy.cicloVita.campiture[c.fase]}
              </text>
            </g>
          )
        })}

        {/* confini fra le campiture */}
        {[CICLO_VITA.fine_studio, CICLO_VITA.fine_lavoro].map((eta) => (
          <path
            key={eta}
            d={`M${ascissaScena(eta)} ${SCENA.cima - 34} V${SCENA.base}`}
            stroke="var(--notte)"
            strokeWidth={2}
            strokeDasharray="6 8"
            opacity={0.35}
          />
        ))}

        {/* assi */}
        <path
          d={`M${SCENA.sinistra} ${SCENA.cima - 34} V${SCENA.base} H${SCENA.destra}`}
          stroke="var(--notte)"
          strokeWidth={4}
        />
        <text
          x={SCENA.destra}
          y={SCENA.base + 34}
          textAnchor="end"
          fill="var(--notte)"
          fontSize="20"
          fontFamily="var(--font-sans)"
          opacity={0.6}
        >
          {copy.cicloVita.asse_x}
        </text>
        <text
          transform={`translate(${SCENA.sinistra - 16} ${(SCENA.base + SCENA.cima) / 2}) rotate(-90)`}
          textAnchor="middle"
          fill="var(--notte)"
          fontSize="20"
          fontFamily="var(--font-sans)"
          opacity={0.6}
        >
          {copy.cicloVita.asse_y}
        </text>

        {/* la curva */}
        <path d={curva} stroke="var(--notte)" strokeWidth={6} />

        {/* la famiglia, agganciata alla curva */}
        {[...membri]
          .sort((a, b) => a.eta - b.eta)
          .map((membro, indice) => {
          const x = ascissaScena(membro.eta)
          const y = ordinataScena(membro.eta)
          const scala = arrotonda(0.52 * scalaPerEta(membro.eta))
          const etichetta = etichette.get(membro.id) ?? { y: y + 28, sopra: false }
          return (
            <g
              key={membro.id}
              className="anim-posa"
              style={{ animationDelay: `${indice * TEMPI.stagger_avatar_ms}ms` }}
            >
              <circle cx={x} cy={y} r={7} fill="var(--sole)" stroke="var(--notte)" strokeWidth={4} />
              <g
                transform={`translate(${x - (VIEWBOX.larghezza * scala) / 2} ${y - VIEWBOX.altezza * scala - 4}) scale(${scala})`}
              >
                <ContenutoAvatar
                  nome={membro.nome}
                  eta={membro.eta}
                  professione={membro.professione_key}
                  seed={membro.avatar_seed}
                />
              </g>
              <text
                x={x}
                y={etichetta.y}
                textAnchor="middle"
                fill="var(--notte)"
                fontSize="21"
                fontWeight="600"
                fontFamily="var(--font-sans)"
                paintOrder="stroke"
                stroke="var(--sabbia)"
                strokeWidth={6}
                strokeLinejoin="round"
              >
                {membro.nome}
              </text>
              <text
                x={x}
                y={etichetta.y + 22}
                textAnchor="middle"
                fill="var(--notte)"
                fontSize="18"
                fontFamily="var(--font-sans)"
                opacity={0.6}
                paintOrder="stroke"
                stroke="var(--sabbia)"
                strokeWidth={6}
                strokeLinejoin="round"
              >
                {membro.eta} {copy.cicloVita.anni}
              </text>
            </g>
          )
        })}
      </svg>

      <ul className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {membri.map((membro, indice) => (
          <li
            key={membro.id}
            className="anim-entra rounded-2xl border-2 border-notte/12 bg-sabbia-chiara px-5 py-3 text-base"
            style={{ animationDelay: `${400 + indice * TEMPI.stagger_avatar_ms}ms` }}
          >
            {copy.frasiCicloVita[faseVita(membro.eta)].replace('{nome}', membro.nome)}
          </li>
        ))}
      </ul>
    </div>
  )
}
