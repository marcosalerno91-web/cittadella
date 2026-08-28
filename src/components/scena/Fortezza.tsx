/**
 * La cittadella vista in pianta.
 *
 * Si guarda da sopra e appena di lato, come una mappa di citta' disegnata a
 * mano: le cinte circondano invece di coprire, la famiglia al centro resta
 * sempre visibile, e ogni costruzione occupa uno spazio suo.
 *
 * Nessuno stato interno: la scena serve tale e quale nella fase 4, nelle due
 * domande finali e nei PDF, quindi riceve tutto dall'esterno.
 */

import { ContenutoAvatar } from '@/components/scena/Avatar'
import { TERRA, scalaPerEta } from '@/components/scena/RitrattoDiGruppo'
import {
  Deposito,
  Fossato,
  Granaio,
  Portone,
  Pozzo,
  SegmentoMura,
  Torre,
  TorreMaestra,
} from '@/components/scena/costruzioni'
import {
  LARGHEZZA_FOSSATO,
  PIANTA,
  PIAZZA,
  SCHIACCIA,
  arrotonda,
  profonditaArco,
  proietta,
  spezzaArco,
  suCerchio,
} from '@/components/scena/pianta'
import type { Costruzione } from '@/components/scena/pianta'
import { VIEWBOX } from '@/lib/avatar/tipi'
import * as copy from '@/content/copy'
import type { BloccoKey, FamilyMember, FortressItem, StatoVoce } from '@/lib/domain'

const NOTTE = 'var(--notte)'

/** Quanto e' grande la famiglia nella piazza. */
const SCALA_FAMIGLIA = 0.95
const PASSO_FAMIGLIA = 82

export interface PropsFortezza {
  membri: FamilyMember[]
  voci: FortressItem[]
  className?: string
  /** disegna tutte le voci come presenti: e' la cittadella completa */
  tuttoPieno?: boolean
  /** voce in discussione: si accende, il resto scende di saturazione */
  voceInCorso?: string | null
  /**
   * Rende toccabile ogni costruzione che non c'e' gia'.
   * E' cosi' che il cliente sceglie la cittadella che vorrebbe.
   */
  onTocca?: (voceKey: string) => void
  /** blocchi gia' raggiunti: i successivi non si disegnano ancora */
  cinteVisibili?: BloccoKey[]
  /** mostra il nome di ogni costruzione */
  conEtichette?: boolean
}

export function Fortezza({
  membri,
  voci,
  className = '',
  tuttoPieno = false,
  voceInCorso = null,
  onTocca,
  cinteVisibili,
  conEtichette = true,
}: PropsFortezza) {
  const presenti = PIANTA.filter((c) => !cinteVisibili || cinteVisibili.includes(c.blocco))

  function statoDi(voceKey: string): StatoVoce | null {
    if (tuttoPieno) return 'presente'
    return voci.find((v) => v.voce_key === voceKey)?.stato ?? null
  }

  /** Il cliente vuole questa costruzione. Vale solo per cio' che non c'e' gia'. */
  function desiderata(voceKey: string): boolean {
    if (tuttoPieno) return false
    if (statoDi(voceKey) === 'presente') return false
    return voci.find((v) => v.voce_key === voceKey)?.desiderata ?? false
  }

  // ------------------------------------------------------- inquadratura
  // Il campo si allarga da solo man mano che si costruisce: si parte stretti
  // sulla famiglia e sul mastio e si apre a ogni blocco nuovo.
  const inquadratura = campo(presenti, membri.length, conEtichette)

  // ------------------------------------------------------- ordine di disegno
  // Chi e' piu' vicino a chi guarda va disegnato dopo. Gli anelli si spezzano
  // ai fianchi: la loro meta' dietro sta dietro alla famiglia, quella davanti
  // le sta davanti. Senza questo il fossato finiva sopra a tutta la scena.
  const pezzi: { chiave: string; profondita: number; nodo: React.ReactNode }[] = []

  for (const c of presenti) {
    const stato = statoDi(c.voceKey)
    const scelta = desiderata(c.voceKey)

    if (c.anello) {
      for (const tratto of spezzaArco(c.anello.da, c.anello.a)) {
        pezzi.push({
          chiave: `${c.voceKey}-${tratto.da}`,
          profondita: profonditaArco(c.anello.raggio, tratto.da, tratto.a),
          nodo: (
            <g key={`${c.voceKey}-${tratto.da}`} className={classeDi(c.voceKey, voceInCorso)}>
              <TrattoDiAnello costruzione={c} tratto={tratto} stato={stato} scelta={scelta} />
            </g>
          ),
        })
      }
      continue
    }

    pezzi.push({
      chiave: c.voceKey,
      profondita: c.v,
      nodo: (
        <g key={c.voceKey} className={classeDi(c.voceKey, voceInCorso)}>
          <Edificio costruzione={c} stato={stato} scelta={scelta} />
        </g>
      ),
    })
  }

  pezzi.push({
    chiave: 'famiglia',
    profondita: PIAZZA.v,
    nodo: <FamigliaInPiazza key="famiglia" membri={membri} />,
  })

  pezzi.sort((a, b) => a.profondita - b.profondita)

  return (
    <svg
      viewBox={inquadratura}
      className={`${className} ${voceInCorso ? 'fortezza-attenzione' : ''}`}
      role="img"
      aria-label="La cittadella vista dall’alto"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'all 600ms var(--ease-scena)' }}
    >
      {/* la piazza dove sta la famiglia */}
      <ellipse
        cx={0}
        cy={arrotonda(PIAZZA.v * SCHIACCIA)}
        rx={PIAZZA.raggio}
        ry={arrotonda(PIAZZA.raggio * SCHIACCIA)}
        fill="var(--notte)"
        fillOpacity={0.05}
        stroke="var(--notte)"
        strokeOpacity={0.12}
        strokeWidth={3}
      />

      {pezzi.map((p) => p.nodo)}

      {/* i muri incerti portano il loro punto interrogativo qui sopra: un
          anello e' spezzato in piu' tratti e ne basta uno solo */}
      {presenti.map((c) => {
        if (!c.anello || statoDi(c.voceKey) !== 'non_so') return null
        const p = proietta(c.u, c.v)
        return (
          <g key={`incerto-${c.voceKey}`} className={classeDi(c.voceKey, voceInCorso)}>
            <PuntoInterrogativo x={p.x} y={arrotonda(p.y - c.altezza - 16)} />
          </g>
        )
      })}

      {/* l'alone di attenzione e le etichette stanno sopra a tutto */}
      {presenti.map((c) =>
        voceInCorso === c.voceKey ? (
          <AloneDiAttenzione
            key={`alone-${c.voceKey}`}
            costruzione={c}
            alzata={statoDi(c.voceKey) === 'presente' || statoDi(c.voceKey) === 'non_so'}
          />
        ) : null,
      )}

      {conEtichette
        ? presenti.map((c) => {
            const stato = statoDi(c.voceKey)
            if (stato === null) return null
            return (
              <g key={`nome-${c.voceKey}`} className={classeDi(c.voceKey, voceInCorso)}>
                <Etichetta costruzione={c} stato={stato} acceso={voceInCorso === c.voceKey} />
              </g>
            )
          })
        : null}

      {/* le zone toccabili, invisibili, sopra a tutto il resto */}
      {onTocca
        ? presenti.map((c) => {
            // cio' che c'e' gia' non si tocca: e' gia' nella cittadella
            if (statoDi(c.voceKey) === 'presente') return null
            return (
              <ZonaToccabile
                key={`tocco-${c.voceKey}`}
                costruzione={c}
                scelta={desiderata(c.voceKey)}
                onTocca={() => onTocca(c.voceKey)}
              />
            )
          })
        : null}
    </svg>
  )
}

/**
 * La classe che governa la messa a fuoco.
 *
 * La famiglia non porta mai questa classe: e' il motivo per cui esiste tutto
 * il resto, e non si spegne mai.
 */
function classeDi(voceKey: string, voceInCorso: string | null): string {
  return `elemento${voceInCorso === voceKey ? ' elemento--acceso' : ''}`
}

// ---------------------------------------------------------------- pezzi

/**
 * Un edificio: torre, pozzo, granaio, deposito, portone.
 *
 * Tre stati che si devono leggere a colpo d'occhio da 80 cm:
 *   presente             in piedi, colore salvia
 *   scelta dal cliente   in piedi, colore sole, contorno marcato, sorge
 *   ancora da costruire   traccia a terra
 */
function Edificio({
  costruzione: c,
  stato,
  scelta,
}: {
  costruzione: Costruzione
  stato: StatoVoce | null
  scelta: boolean
}) {
  const base = proietta(c.u, c.v)
  const inPiedi = stato === 'presente' || scelta

  if (!inPiedi) {
    return <Fondazione costruzione={c} tratteggiata={stato === 'assente'} />
  }

  return (
    <g
      className={`costruzione ${scelta ? 'costruzione--desiderata anim-sorge' : 'anim-posa'}`}
      opacity={stato === 'non_so' && !scelta ? 0.6 : 1}
    >
      <g transform={`translate(${base.x} ${base.y})`}>{corpoDi(c)}</g>
      {stato === 'non_so' && !scelta ? (
        <PuntoInterrogativo x={base.x} y={arrotonda(base.y - c.altezza - 18)} />
      ) : null}
    </g>
  )
}

/** Un tratto di anello: muro interno, cinta esterna, fossato. */
function TrattoDiAnello({
  costruzione: c,
  tratto,
  stato,
  scelta,
}: {
  costruzione: Costruzione
  tratto: { da: number; a: number }
  stato: StatoVoce | null
  scelta: boolean
}) {
  if (!c.anello) return null
  const base = proietta(c.u, c.v)
  const inPiedi = stato === 'presente' || scelta

  if (!inPiedi) {
    return <TracciaAnello costruzione={c} tratto={tratto} tratteggiata={stato === 'assente'} />
  }

  const passaIlPonte = tratto.da <= 180 && tratto.a >= 180

  return (
    <g
      className={`costruzione ${scelta ? 'costruzione--desiderata anim-sorge' : 'anim-posa'}`}
      opacity={stato === 'non_so' && !scelta ? 0.6 : 1}
    >
      <g transform={`translate(${base.x} ${base.y})`}>
        {c.tipo === 'fossato' ? (
          <Fossato
            raggio={c.anello.raggio}
            da={tratto.da}
            a={tratto.a}
            centroU={c.u}
            centroV={c.v}
            conPonte={passaIlPonte}
          />
        ) : (
          <SegmentoMura
            raggio={c.anello.raggio}
            da={tratto.da}
            a={tratto.a}
            altezza={c.altezza}
            centroU={c.u}
            centroV={c.v}
          />
        )}
      </g>
    </g>
  )
}

function corpoDi(c: Costruzione): React.ReactNode {
  switch (c.tipo) {
    case 'torre_maestra':
      return <TorreMaestra larghezza={c.ingombro.larghezza} altezza={c.altezza} />
    case 'torre':
      return <Torre larghezza={c.ingombro.larghezza} altezza={c.altezza} />
    case 'pozzo':
      return <Pozzo larghezza={c.ingombro.larghezza} altezza={c.altezza} />
    case 'granaio':
      return <Granaio larghezza={c.ingombro.larghezza} altezza={c.altezza} />
    case 'deposito':
      return <Deposito larghezza={c.ingombro.larghezza} altezza={c.altezza} />
    case 'portone':
      return <Portone larghezza={c.ingombro.larghezza} altezza={c.altezza} />
    default:
      return null
  }
}



/**
 * La costruzione non ancora affrontata, o quella che non c'e'.
 *
 * E' tracciata a terra: si vede lo spazio che occuperebbe. Non e' un allarme,
 * e' un cantiere.
 */
function Fondazione({
  costruzione: c,
  tratteggiata,
}: {
  costruzione: Costruzione
  tratteggiata: boolean
}) {
  const base = proietta(c.u, c.v)
  const colore = tratteggiata ? 'var(--corallo)' : NOTTE
  const comune = {
    fill: colore,
    fillOpacity: 0.04,
    stroke: colore,
    strokeWidth: tratteggiata ? 3 : 2.4,
    strokeOpacity: tratteggiata ? 0.75 : 0.28,
    strokeDasharray: tratteggiata ? '11 9' : '5 8',
  }

  const w = c.ingombro.larghezza
  const d = c.ingombro.profondita * SCHIACCIA
  return (
    <rect
      x={arrotonda(base.x - w / 2)}
      y={arrotonda(base.y - d / 2)}
      width={arrotonda(w)}
      height={arrotonda(d)}
      rx={8}
      {...comune}
    />
  )
}

/** La traccia a terra di un tratto di anello ancora da costruire. */
function TracciaAnello({
  costruzione: c,
  tratto,
  tratteggiata,
}: {
  costruzione: Costruzione
  tratto: { da: number; a: number }
  tratteggiata: boolean
}) {
  if (!c.anello) return null
  const base = proietta(c.u, c.v)
  const colore = tratteggiata ? 'var(--corallo)' : NOTTE

  // Una linea sola, non una fascia: quattordici costruzioni tutte da fare
  // disegnate come bande doppie diventavano una mappa rossa, cioe' un allarme.
  // Cosi' resta il tracciato di un cantiere.
  return (
    <g transform={`translate(${base.x} ${base.y})`}>
      <path
        d={lineaAnello(c, tratto)}
        fill="none"
        stroke={colore}
        strokeWidth={tratteggiata ? 3 : 2.4}
        strokeOpacity={tratteggiata ? 0.75 : 0.28}
        strokeDasharray={tratteggiata ? '13 10' : '5 8'}
      />
    </g>
  )
}

/** La linea di mezzeria di un tratto di anello. */
function lineaAnello(c: Costruzione, tratto: { da: number; a: number }): string {
  if (!c.anello) return ''
  const raggio = c.tipo === 'fossato' ? c.anello.raggio + LARGHEZZA_FOSSATO / 2 : c.anello.raggio
  const passi = Math.max(10, Math.round(Math.abs(tratto.a - tratto.da) / 4))
  const punti: string[] = []
  for (let i = 0; i <= passi; i += 1) {
    const gradi = tratto.da + ((tratto.a - tratto.da) * i) / passi
    const p = suCerchio(raggio, gradi)
    const s = proietta(p.u - c.u, p.v - c.v)
    punti.push(`${i === 0 ? 'M' : 'L'}${s.x} ${s.y}`)
  }
  return punti.join(' ')
}

/** Il nome della costruzione. Sempre orizzontale, sempre fuori dalle mura. */
function Etichetta({
  costruzione: c,
  stato,
  acceso,
}: {
  costruzione: Costruzione
  stato: StatoVoce
  acceso: boolean
}) {
  const base = proietta(c.u, c.v)
  const alzata = stato === 'assente' ? c.etichetta.dy + c.altezza * 0.78 : c.etichetta.dy
  return (
    <text
      x={arrotonda(base.x + c.etichetta.dx)}
      y={arrotonda(base.y + alzata)}
      textAnchor={c.etichetta.ancoraggio}
      fill={NOTTE}
      fontSize={22}
      fontWeight={acceso ? 700 : 600}
      fontFamily="var(--font-sans)"
      opacity={acceso ? 1 : 0.7}
      paintOrder="stroke"
      stroke="var(--sabbia)"
      strokeWidth={9}
      strokeLinejoin="round"
    >
      {copy.vociFortezzaBreve[c.voceKey] ?? copy.vociFortezza[c.voceKey]?.nome ?? c.voceKey}
    </text>
  )
}

/** Il bersaglio del tocco: invisibile, ma grande abbastanza per due dita. */
function ZonaToccabile({
  costruzione: c,
  scelta,
  onTocca,
}: {
  costruzione: Costruzione
  scelta: boolean
  onTocca: () => void
}) {
  const base = proietta(c.u, c.v)
  const nome = copy.vociFortezza[c.voceKey]?.nome ?? c.voceKey

  if (c.anello) {
    return (
      <path
        transform={`translate(${base.x} ${base.y})`}
        d={traccia(c, (c.tipo === 'fossato' ? LARGHEZZA_FOSSATO : 24) + 34, c.anello)}
        fill="transparent"
        role="button"
        tabIndex={0}
        aria-label={nome}
        aria-pressed={scelta}
        cursor="pointer"
        onClick={onTocca}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onTocca()
          }
        }}
      >
        <title>{nome}</title>
      </path>
    )
  }

  const w = c.ingombro.larghezza + 26
  const h = c.ingombro.profondita * SCHIACCIA + c.altezza + 26
  return (
    <rect
      x={arrotonda(base.x - w / 2)}
      y={arrotonda(base.y - h + (c.ingombro.profondita * SCHIACCIA) / 2)}
      width={arrotonda(w)}
      height={arrotonda(h)}
      rx={12}
      fill="transparent"
      role="button"
      tabIndex={0}
      aria-label={nome}
      aria-pressed={scelta}
      cursor="pointer"
      onClick={onTocca}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onTocca()
        }
      }}
    >
      <title>{nome}</title>
    </rect>
  )
}

/** Traccia a terra di un anello o di un suo tratto. */
function traccia(c: Costruzione, spessore: number, tratto?: { da: number; a: number }): string {
  if (!c.anello) return ''
  const raggio = c.anello.raggio
  const da = tratto?.da ?? c.anello.da
  const a = tratto?.a ?? c.anello.a
  const passi = Math.max(10, Math.round(Math.abs(a - da) / 5))
  const dentro: string[] = []
  const fuori: string[] = []

  for (let i = 0; i <= passi; i += 1) {
    const gradi = da + ((a - da) * i) / passi
    const pd = suCerchio(raggio - spessore / 2, gradi)
    const pf = suCerchio(raggio + spessore / 2, gradi)
    const a1 = proietta(pd.u - c.u, pd.v - c.v)
    const a2 = proietta(pf.u - c.u, pf.v - c.v)
    dentro.push(`${a1.x} ${a1.y}`)
    fuori.push(`${a2.x} ${a2.y}`)
  }

  return `M${dentro[0]} ${dentro.slice(1).map((p) => `L${p}`).join(' ')} L${fuori[fuori.length - 1]} ${fuori
    .slice(0, -1)
    .reverse()
    .map((p) => `L${p}`)
    .join(' ')} Z`
}

/** Il contorno che pulsa attorno alla costruzione di cui si sta parlando. */
function AloneDiAttenzione({ costruzione: c, alzata }: { costruzione: Costruzione; alzata: boolean }) {
  const base = proietta(c.u, c.v)
  const altezza = alzata ? c.altezza : 0
  if (c.anello) {
    // Un tratto di evidenziatore lungo il muro: il contorno della fascia
    // faceva un nastro spesso che copriva il muro stesso.
    return (
      <path
        className="alone"
        transform={`translate(${base.x} ${base.y})`}
        d={lineaAnello(c, c.anello)}
        fill="none"
        stroke="var(--sole)"
        strokeWidth={30}
        strokeLinecap="round"
        opacity={0.7}
      />
    )
  }

  const w = c.ingombro.larghezza + 30
  const d = c.ingombro.profondita * SCHIACCIA + 22
  return (
    <rect
      className="alone"
      x={arrotonda(base.x - w / 2)}
      y={arrotonda(base.y - d / 2 - altezza - 10)}
      width={arrotonda(w)}
      height={arrotonda(d + altezza + 10)}
      rx={16}
      fill="none"
      stroke="var(--sole)"
      strokeWidth={6}
    />
  )
}

function PuntoInterrogativo({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={17} fill="var(--nebbia)" stroke={NOTTE} strokeWidth={3.4} />
      <text
        x={x}
        y={y + 8}
        textAnchor="middle"
        fill={NOTTE}
        fontSize={24}
        fontWeight={700}
        fontFamily="var(--font-sans)"
      >
        ?
      </text>
    </g>
  )
}

// ---------------------------------------------------------------- famiglia

function FamigliaInPiazza({ membri }: { membri: FamilyMember[] }) {
  if (membri.length === 0) return null
  const larghezza = (membri.length - 1) * PASSO_FAMIGLIA
  const base = proietta(PIAZZA.u, PIAZZA.v)
  const partenza = base.x - larghezza / 2 - (VIEWBOX.larghezza * SCALA_FAMIGLIA) / 2

  return (
    <g>
      {membri.map((membro, indice) => {
        const s = arrotonda(SCALA_FAMIGLIA * scalaPerEta(membro.eta))
        return (
          <g
            key={membro.id}
            transform={`translate(${arrotonda(partenza + indice * PASSO_FAMIGLIA)} ${base.y}) scale(${s}) translate(0 ${-TERRA})`}
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

// ---------------------------------------------------------------- geometria

/** Il campo inquadrato: contiene le costruzioni presenti e la famiglia. */
function campo(presenti: Costruzione[], quantiMembri: number, conEtichette: boolean): string {
  const margine = 30
  let sx = -(larghezzaFamiglia(quantiMembri) / 2 + 20)
  let dx = -sx
  let cima = proietta(PIAZZA.u, PIAZZA.v).y - VIEWBOX.altezza * SCALA_FAMIGLIA
  let fondo = proietta(PIAZZA.u, PIAZZA.v).y + 20

  for (const c of presenti) {
    if (c.anello) {
      const r = c.anello.raggio + (c.tipo === 'fossato' ? LARGHEZZA_FOSSATO : 30)
      sx = Math.min(sx, -r)
      dx = Math.max(dx, r)
      cima = Math.min(cima, -r * SCHIACCIA - c.altezza - 26)
      fondo = Math.max(fondo, r * SCHIACCIA + 12)
      continue
    }
    const p = proietta(c.u, c.v)
    const meta = c.ingombro.larghezza / 2 + 16
    sx = Math.min(sx, p.x - meta)
    dx = Math.max(dx, p.x + meta)
    cima = Math.min(cima, p.y - c.altezza - 56)
    fondo = Math.max(fondo, p.y + (c.ingombro.profondita * SCHIACCIA) / 2 + 34)
  }

  if (conEtichette) {
    // le etichette non devono uscire dal campo: si stima la loro larghezza
    // dal numero di caratteri, e' un'approssimazione che basta
    for (const c of presenti) {
      const p = proietta(c.u, c.v)
      const testo = copy.vociFortezzaBreve[c.voceKey] ?? ''
      const largo = testo.length * 11
      const x = p.x + c.etichetta.dx
      const y = p.y + c.etichetta.dy
      const inizio =
        c.etichetta.ancoraggio === 'start' ? x : c.etichetta.ancoraggio === 'end' ? x - largo : x - largo / 2
      sx = Math.min(sx, inizio - 8)
      dx = Math.max(dx, inizio + largo + 8)
      cima = Math.min(cima, y - 26)
      fondo = Math.max(fondo, y + 12)
    }
  }

  const x = arrotonda(sx - margine)
  const y = arrotonda(cima - margine)
  const w = arrotonda(dx - sx + margine * 2)
  const h = arrotonda(fondo - cima + margine * 2)
  return `${x} ${y} ${w} ${h}`
}

function larghezzaFamiglia(quanti: number): number {
  if (quanti === 0) return VIEWBOX.larghezza * SCALA_FAMIGLIA
  return (quanti - 1) * PASSO_FAMIGLIA + VIEWBOX.larghezza * SCALA_FAMIGLIA
}
