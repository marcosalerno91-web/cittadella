/**
 * Le mura della cittadella.
 *
 * Quattro cinte concentriche attorno alla famiglia, viste da poco piu' in alto
 * dell'orizzonte. Ogni voce e' un mattone: pieno quando c'e', sagoma
 * tratteggiata quando e' ancora da costruire, in nebbia con un punto
 * interrogativo quando non si sa.
 *
 * Nessuno stato interno: la scena serve tale e quale nella fase 4, nelle due
 * domande finali e nei PDF, quindi riceve tutto dall'esterno.
 */

import { ContenutoAvatar } from '@/components/scena/Avatar'
import { TERRA, scalaPerEta } from '@/components/scena/RitrattoDiGruppo'
import { BLOCCHI_FORTEZZA } from '@/config/engine'
import { VIEWBOX } from '@/lib/avatar/tipi'
import * as copy from '@/content/copy'
import type { BloccoKey, FamilyMember, FortressItem, StatoVoce } from '@/lib/domain'

/** Centro della cittadella: e' qui che sta la famiglia. */
const CENTRO = { x: 470, y: 300 } as const
/** Schiacciamento verticale delle cinte: le vediamo da poco piu' in alto. */
const SCHIACCIAMENTO = 0.34

interface Cinta {
  raggio: number
  altezza: number
  /** semi-apertura dell'arco su cui si posano i mattoni, in gradi */
  apertura: number
}

/** Dal centro verso l'esterno. Il mastio e' il piu' alto e il piu' vicino. */
const CINTE: Record<BloccoKey, Cinta> = {
  mastio: { raggio: 212, altezza: 70, apertura: 56 },
  salute: { raggio: 312, altezza: 58, apertura: 44 },
  risparmio: { raggio: 402, altezza: 48, apertura: 33 },
  perimetro: { raggio: 488, altezza: 40, apertura: 29 },
}

/** Quanto e' grande la famiglia in scena. E' lei il centro: non va rimpicciolita. */
const SCALA_FAMIGLIA = 0.62
const PASSO_FAMIGLIA = 60

/**
 * La famiglia sta un po' piu' indietro del centro: cosi' il muro che le passa
 * davanti le arriva ai piedi e non la nasconde.
 */
const ARRETRAMENTO = 30

export interface PropsFortezza {
  membri: FamilyMember[]
  voci: FortressItem[]
  className?: string
  /** disegna tutte le voci come presenti: e' la cittadella completa */
  tuttoPieno?: boolean
  /** voce in discussione: viene messa in evidenza */
  voceInCorso?: string | null
  /** voci che il cliente ha indicato come prioritarie */
  prioritarie?: string[]
  /** rende toccabili le sagome ancora da costruire */
  onTocca?: (voceKey: string) => void
  /** cinte gia' raggiunte: le successive restano da disegnare */
  cinteVisibili?: BloccoKey[]
}

export function Fortezza({
  membri,
  voci,
  className = '',
  tuttoPieno = false,
  voceInCorso = null,
  prioritarie = [],
  onTocca,
  cinteVisibili,
}: PropsFortezza) {
  const cinte = BLOCCHI_FORTEZZA.filter((b) => !cinteVisibili || cinteVisibili.includes(b.key))

  function statoDi(voceKey: string): StatoVoce | null {
    if (tuttoPieno) return 'presente'
    return voci.find((v) => v.voce_key === voceKey)?.stato ?? null
  }

  // Si parte stretti sulla famiglia e sul mastio, e l'inquadratura si allarga
  // man mano che si costruiscono le cinte: e' il racconto che apre il campo.
  //
  // Il campo si misura sui mattoni, non sui cerchi interi: i profili delle cinte
  // escono dai bordi ed e' giusto cosi', le mura proseguono oltre la scena.
  const margine = 30
  let sinistraUtile = CENTRO.x - (larghezzaFamiglia(membri.length) / 2 + 10)
  let cimaUtile = CENTRO.y - ARRETRAMENTO - ALTEZZA_FAMIGLIA
  let fondoUtile = CENTRO.y + 10

  for (const blocco of cinte) {
    const cinta = CINTE[blocco.key]
    const meta = larghezzaDaPassi(
      blocco.voci.map((_, i) =>
        puntoSuCinta(cinta.raggio, angoloDiPosto(cinta, blocco.voci.length, i)).x,
      ),
    ) / 2
    // il mattone piu' a sinistra e' quello all'angolo negativo estremo;
    // e' anche il piu' in alto, perche' le cinte sono viste di tre quarti
    const estremo = puntoSuCinta(cinta.raggio, -cinta.apertura)
    const frontale = puntoSuCinta(cinta.raggio, 0)
    sinistraUtile = Math.min(sinistraUtile, estremo.x - meta)
    cimaUtile = Math.min(cimaUtile, estremo.y - cinta.altezza)
    fondoUtile = Math.max(fondoUtile, frontale.y)
  }

  const sinistra = arrotonda(sinistraUtile - margine)
  const larghezza = arrotonda((CENTRO.x - sinistraUtile + margine) * 2)
  const cima = arrotonda(cimaUtile - margine)
  const inquadratura = `${sinistra} ${cima} ${larghezza} ${arrotonda(fondoUtile + margine - cima)}`

  return (
    <svg
      viewBox={inquadratura}
      className={className}
      role="img"
      aria-label="La cittadella e le sue mura"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'all 600ms var(--ease-scena)' }}
    >
      {/* i profili delle cinte, che si chiudono dietro la famiglia */}
      {[...cinte].reverse().map((blocco) => (
        <path
          key={`profilo-${blocco.key}`}
          d={ellisse(CINTE[blocco.key].raggio)}
          stroke="var(--notte)"
          strokeWidth={2.5}
          opacity={0.14}
        />
      ))}

      {/* la famiglia al centro: le mura che le stanno davanti la coprono ai piedi */}
      <FamigliaAlCentro membri={membri} />

      {/* i mattoni, dal fondo verso chi guarda */}
      {cinte.map((blocco) => {
        const cinta = CINTE[blocco.key]
        const totale = blocco.voci.length
        const posti = blocco.voci.map((voceKey, indice) => {
          const gradi = angoloDiPosto(cinta, totale, indice)
          return { voceKey, indice, gradi, punto: puntoSuCinta(cinta.raggio, gradi) }
        })
        const larghezzaMattone = larghezzaDaPassi(posti.map((p) => p.punto.x))

        // chi e' piu' in basso e' piu' vicino: va disegnato dopo
        const ordinati = [...posti].sort((a, b) => a.punto.y - b.punto.y)

        return (
          <g key={blocco.key}>
            {ordinati.map(({ voceKey, indice, punto }) => (
              <Mattone
                key={voceKey}
                x={punto.x}
                y={punto.y}
                larghezza={larghezzaMattone}
                altezza={cinta.altezza}
                stato={statoDi(voceKey)}
                evidenziato={voceInCorso === voceKey}
                prioritario={prioritarie.includes(voceKey)}
                blocco={blocco.key}
                voceKey={voceKey}
                ritardo={indice * 110}
                onTocca={onTocca}
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/** Altezza della famiglia in scena, per non tagliarle la testa. */
const ALTEZZA_FAMIGLIA = VIEWBOX.altezza * SCALA_FAMIGLIA

/** Dove si posa il mattone numero `indice` di una cinta da `totale` voci. */
function angoloDiPosto(cinta: Cinta, totale: number, indice: number): number {
  if (totale <= 1) return 0
  return -cinta.apertura + ((cinta.apertura * 2) / (totale - 1)) * indice
}

/** Ingombro orizzontale della famiglia in scena. */
function larghezzaFamiglia(quanti: number): number {
  if (quanti === 0) return VIEWBOX.larghezza * SCALA_FAMIGLIA
  return (quanti - 1) * PASSO_FAMIGLIA + VIEWBOX.larghezza * SCALA_FAMIGLIA
}

/** Un mattone e' largo quanto lo spazio che ha, mai di piu'. */
function larghezzaDaPassi(ascisse: number[]): number {
  if (ascisse.length < 2) return 104
  const ordinate = [...ascisse].sort((a, b) => a - b)
  let minimo = Infinity
  for (let i = 1; i < ordinate.length; i += 1) {
    minimo = Math.min(minimo, (ordinate[i] ?? 0) - (ordinate[i - 1] ?? 0))
  }
  return arrotonda(Math.min(Math.max(minimo * 0.86, 44), 116))
}

function Mattone({
  x,
  y,
  larghezza,
  altezza,
  stato,
  evidenziato,
  prioritario,
  blocco,
  voceKey,
  ritardo,
  onTocca,
}: {
  x: number
  y: number
  larghezza: number
  altezza: number
  stato: StatoVoce | null
  evidenziato: boolean
  prioritario: boolean
  blocco: BloccoKey
  voceKey: string
  ritardo: number
  onTocca?: (voceKey: string) => void
}) {
  // finche' non c'e' una risposta si vede solo la fondazione: il muro cresce
  // man mano che la famiglia racconta cosa ha gia'
  const altezzaEffettiva = arrotonda(stato === null ? altezza * 0.34 : altezza)
  const sx = arrotonda(x - larghezza / 2)
  const sy = y - altezzaEffettiva
  const toccabile = Boolean(onTocca) && stato !== null && stato !== 'presente'
  const etichetta = copy.vociFortezza[voceKey]?.nome ?? voceKey

  const forma = { x: sx, y: sy, width: larghezza, height: altezzaEffettiva, rx: 8 }

  return (
    <g
      className={stato ? 'anim-posa' : undefined}
      style={stato ? { animationDelay: `${ritardo}ms` } : undefined}
      role={toccabile ? 'button' : undefined}
      tabIndex={toccabile ? 0 : undefined}
      aria-label={etichetta}
      aria-pressed={toccabile ? prioritario : undefined}
      cursor={toccabile ? 'pointer' : undefined}
      onClick={toccabile && onTocca ? () => onTocca(voceKey) : undefined}
      onKeyDown={
        toccabile && onTocca
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onTocca(voceKey)
              }
            }
          : undefined
      }
    >
      {stato === 'presente' ? (
        <g>
          <rect {...forma} fill="var(--salvia)" stroke="var(--notte)" strokeWidth={4} />
          <path
            d={`M${sx} ${sy + altezzaEffettiva / 3} h${larghezza} M${sx} ${sy + (altezzaEffettiva * 2) / 3} h${larghezza}`}
            stroke="var(--notte)"
            strokeWidth={1.6}
            opacity={0.3}
          />
          <Merlatura x={sx} y={sy} larghezza={larghezza} colore="var(--salvia)" />
        </g>
      ) : null}

      {stato === 'non_so' ? (
        <g>
          <rect {...forma} fill="var(--nebbia)" stroke="var(--notte)" strokeWidth={4} />
          <text
            x={x}
            y={sy + altezzaEffettiva / 2 + 10}
            textAnchor="middle"
            fill="var(--notte)"
            fontSize="28"
            fontWeight="700"
            fontFamily="var(--font-sans)"
            opacity={0.7}
          >
            ?
          </text>
        </g>
      ) : null}

      {stato === 'assente' ? (
        <rect
          {...forma}
          fill="var(--corallo)"
          fillOpacity={prioritario ? 0.28 : 0.07}
          stroke="var(--corallo)"
          strokeWidth={4}
          strokeDasharray="11 9"
        />
      ) : null}

      {/* voce non ancora affrontata: appena accennata */}
      {stato === null ? (
        <rect
          {...forma}
          fill="var(--notte)"
          fillOpacity={0.04}
          stroke="var(--notte)"
          strokeWidth={2.5}
          strokeOpacity={0.2}
        />
      ) : null}

      {prioritario ? (
        <circle cx={x} cy={sy - 13} r={9} fill="var(--sole)" stroke="var(--notte)" strokeWidth={3} />
      ) : null}

      {evidenziato ? (
        <rect
          x={sx - 9}
          y={sy - 9}
          width={larghezza + 18}
          height={altezzaEffettiva + 18}
          rx={14}
          stroke="var(--sole)"
          strokeWidth={5}
        />
      ) : null}

      <title>{`${copy.blocchi[blocco].titolo} — ${etichetta}`}</title>
    </g>
  )
}

/** Merli in cima al mattone: e' quello che lo fa leggere come muro. */
function Merlatura({
  x,
  y,
  larghezza,
  colore,
}: {
  x: number
  y: number
  larghezza: number
  colore: string
}) {
  const quanti = 3
  const passo = larghezza / (quanti * 2 - 1)
  return (
    <g>
      {Array.from({ length: quanti }, (_, i) => (
        <rect
          key={i}
          x={x + i * passo * 2}
          y={y - 11}
          width={passo}
          height={13}
          rx={2}
          fill={colore}
          stroke="var(--notte)"
          strokeWidth={3.4}
        />
      ))}
    </g>
  )
}

function FamigliaAlCentro({ membri }: { membri: FamilyMember[] }) {
  if (membri.length === 0) return null
  const passo = PASSO_FAMIGLIA
  const scalaBase = SCALA_FAMIGLIA
  const larghezza = (membri.length - 1) * passo
  const partenza = arrotonda(CENTRO.x - larghezza / 2 - (VIEWBOX.larghezza * scalaBase) / 2)

  return (
    <g>
      {membri.map((membro, indice) => {
        const s = arrotonda(scalaBase * scalaPerEta(membro.eta))
        return (
          <g
            key={membro.id}
            transform={`translate(${partenza + indice * passo} ${CENTRO.y - ARRETRAMENTO}) scale(${s}) translate(0 ${-TERRA})`}
          >
            <ContenutoAvatar
              nome={membro.nome}
              eta={membro.eta}
              professione={membro.professione_key}
              seed={membro.avatar_seed}
            />
          </g>
        )
      })}
    </g>
  )
}

/**
 * Punto sulla cinta. Gli angoli sono in gradi a partire dal punto piu' vicino a
 * chi guarda, positivi verso destra.
 */
function puntoSuCinta(raggio: number, gradi: number): { x: number; y: number } {
  const r = (gradi * Math.PI) / 180
  return {
    x: arrotonda(CENTRO.x + Math.sin(r) * raggio),
    y: arrotonda(CENTRO.y + Math.cos(r) * raggio * SCHIACCIAMENTO),
  }
}

/**
 * Le coordinate si arrotondano prima di finire negli attributi SVG.
 * Senza, server e browser possono scrivere lo stesso numero con un'ultima cifra
 * diversa e React se ne lamenta in fase di idratazione.
 */
function arrotonda(v: number): number {
  return Math.round(v * 100) / 100
}

function ellisse(raggio: number): string {
  const punti: string[] = []
  for (let g = 0; g <= 360; g += 6) {
    const p = puntoSuCinta(raggio, g)
    punti.push(`${g === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
  }
  return `${punti.join(' ')} Z`
}
