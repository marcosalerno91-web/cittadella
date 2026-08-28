/**
 * I pezzi di architettura della cittadella, disegnati in assonometria.
 *
 * Ogni blocco della fortezza ha un genere suo — torri, muri, edifici di
 * cortile, cinta e fossato — perche' quattro muri sempre piu' grandi erano
 * monotoni oltre che illeggibili.
 *
 * Ogni pezzo si disegna attorno all'origine (0,0) del proprio punto a terra:
 * chi lo usa lo trasla dove serve.
 */

import { LARGHEZZA_FOSSATO, SCHIACCIA, arrotonda, proietta, suCerchio } from '@/components/scena/pianta'

const NOTTE = 'var(--notte)'
const TRATTO = 3.4
const SOTTILE = 2.2

const contorno = {
  stroke: NOTTE,
  strokeWidth: TRATTO,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
}
const sottile = { ...contorno, strokeWidth: SOTTILE }

/** I colori delle costruzioni in piedi. Le pareti in ombra sono piu' cupe. */
const PIETRA = { luce: 'var(--salvia)', ombra: '#4A8570', tetto: 'var(--corallo)' }
const LEGNO = { luce: '#C08A55', ombra: '#9A6B44' }

// ---------------------------------------------------------------- aiutanti

/**
 * Un prisma a base rettangolare visto da sopra e di lato: due facce e un
 * tetto. E' il mattone con cui sono fatte quasi tutte le costruzioni.
 */
function Prisma({
  larghezza: w,
  profondita: d,
  altezza: h,
  luce,
  ombra,
}: {
  larghezza: number
  profondita: number
  altezza: number
  luce: string
  ombra: string
}) {
  const sx = -w / 2
  const dx = w / 2
  const dietro = -(d / 2) * SCHIACCIA
  const avanti = (d / 2) * SCHIACCIA

  return (
    <g>
      {/* faccia frontale */}
      <path
        d={`M${sx} ${avanti - h} h${w} v${h} h${-w} z`}
        fill={luce}
        {...contorno}
      />
      {/* faccia laterale destra, in ombra */}
      <path
        d={`M${dx} ${avanti - h} L${dx} ${avanti} L${dx} ${dietro} L${dx} ${dietro - h} z`}
        fill={ombra}
        {...sottile}
      />
      {/* tetto piano */}
      <path
        d={`M${sx} ${avanti - h} L${dx} ${avanti - h} L${dx} ${dietro - h} L${sx} ${dietro - h} z`}
        fill={ombra}
        {...contorno}
      />
    </g>
  )
}

/** Merli sulla sommita': e' quello che fa leggere un muro come muro. */
function Merli({ larghezza, y, quanti, colore }: { larghezza: number; y: number; quanti: number; colore: string }) {
  const passo = larghezza / (quanti * 2 - 1)
  return (
    <g>
      {Array.from({ length: quanti }, (_, i) => (
        <rect
          key={i}
          x={arrotonda(-larghezza / 2 + i * passo * 2)}
          y={arrotonda(y - 11)}
          width={arrotonda(passo)}
          height={13}
          rx={2}
          fill={colore}
          stroke={NOTTE}
          strokeWidth={SOTTILE}
        />
      ))}
    </g>
  )
}

// ---------------------------------------------------------------- torri

export function TorreMaestra({ larghezza, altezza }: { larghezza: number; altezza: number }) {
  const d = larghezza * 0.72
  return (
    <g>
      <Prisma larghezza={larghezza} profondita={d} altezza={altezza} luce={PIETRA.luce} ombra={PIETRA.ombra} />
      <Merli larghezza={larghezza} y={(d / 2) * SCHIACCIA - altezza} quanti={4} colore={PIETRA.luce} />
      {/* portone e feritoie: si legge che ci si abita */}
      <path
        d={`M${-larghezza * 0.13} ${(d / 2) * SCHIACCIA} v-26 a${larghezza * 0.13} ${larghezza * 0.13} 0 0 1 ${larghezza * 0.26} 0 v26 z`}
        fill={NOTTE}
        {...sottile}
      />
      {[-0.26, 0.26].map((f) => (
        <rect
          key={f}
          x={arrotonda(larghezza * f - 5)}
          y={arrotonda((d / 2) * SCHIACCIA - altezza * 0.66)}
          width={10}
          height={18}
          rx={5}
          fill={NOTTE}
          opacity={0.85}
        />
      ))}
      {/* bandiera */}
      <path
        d={`M0 ${arrotonda((d / 2) * SCHIACCIA - altezza - 11)} v-30`}
        stroke={NOTTE}
        strokeWidth={TRATTO}
        strokeLinecap="round"
      />
      <path
        d={`M2 ${arrotonda((d / 2) * SCHIACCIA - altezza - 41)} l26 8 -26 8 z`}
        fill="var(--sole)"
        {...sottile}
      />
    </g>
  )
}

export function Torre({ larghezza, altezza }: { larghezza: number; altezza: number }) {
  const d = larghezza * 0.78
  return (
    <g>
      <Prisma larghezza={larghezza} profondita={d} altezza={altezza} luce={PIETRA.luce} ombra={PIETRA.ombra} />
      {/* tetto conico: distingue le torri d'angolo dal mastio */}
      <path
        d={`M${-larghezza / 2 - 7} ${arrotonda((d / 2) * SCHIACCIA - altezza)} L0 ${arrotonda((d / 2) * SCHIACCIA - altezza - 40)} L${larghezza / 2 + 7} ${arrotonda((d / 2) * SCHIACCIA - altezza)} z`}
        fill={PIETRA.tetto}
        {...contorno}
      />
      <rect
        x={-7}
        y={arrotonda((d / 2) * SCHIACCIA - altezza * 0.6)}
        width={14}
        height={20}
        rx={7}
        fill={NOTTE}
        opacity={0.85}
      />
    </g>
  )
}

// ---------------------------------------------------------------- muri ad anello

/**
 * Un tratto di muro che segue la circonferenza. Il nastro e' costruito da due
 * polilinee: quella a terra e quella alzata dell'altezza del muro.
 */
export function SegmentoMura({
  raggio,
  da,
  a,
  altezza,
  centroU,
  centroV,
  conMerli = true,
}: {
  raggio: number
  da: number
  a: number
  altezza: number
  /** il muro si disegna in coordinate relative al proprio baricentro */
  centroU: number
  centroV: number
  conMerli?: boolean
}) {
  const passi = Math.max(8, Math.round(Math.abs(a - da) / 5))
  const base: string[] = []
  const cima: string[] = []

  for (let i = 0; i <= passi; i += 1) {
    const gradi = da + ((a - da) * i) / passi
    const { u, v } = suCerchio(raggio, gradi)
    const p = proietta(u - centroU, v - centroV)
    base.push(`${p.x} ${p.y}`)
    cima.push(`${p.x} ${arrotonda(p.y - altezza)}`)
  }

  const nastro = `M${base[0]} ${base.slice(1).map((p) => `L${p}`).join(' ')} L${cima[cima.length - 1]} ${cima
    .slice(0, -1)
    .reverse()
    .map((p) => `L${p}`)
    .join(' ')} Z`

  return (
    <g>
      <path d={nastro} fill={PIETRA.luce} {...contorno} />
      <path
        d={`M${cima[0]} ${cima.slice(1).map((p) => `L${p}`).join(' ')}`}
        fill="none"
        stroke={NOTTE}
        strokeWidth={TRATTO}
        strokeLinecap="round"
      />
      {conMerli ? <MerliSuArco raggio={raggio} da={da} a={a} altezza={altezza} centroU={centroU} centroV={centroV} /> : null}
    </g>
  )
}

function MerliSuArco({
  raggio,
  da,
  a,
  altezza,
  centroU,
  centroV,
}: {
  raggio: number
  da: number
  a: number
  altezza: number
  centroU: number
  centroV: number
}) {
  const quanti = Math.max(3, Math.round(Math.abs(a - da) / 12))
  return (
    <g>
      {Array.from({ length: quanti }, (_, i) => {
        const gradi = da + ((a - da) * (i + 0.5)) / quanti
        const { u, v } = suCerchio(raggio, gradi)
        const p = proietta(u - centroU, v - centroV, altezza)
        return (
          <rect
            key={i}
            x={arrotonda(p.x - 7)}
            y={arrotonda(p.y - 12)}
            width={14}
            height={14}
            rx={2}
            fill={PIETRA.luce}
            stroke={NOTTE}
            strokeWidth={SOTTILE}
          />
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------- cortile

/** Il pozzo: la pensione che ci si costruisce da soli. */
export function Pozzo({ larghezza, altezza }: { larghezza: number; altezza: number }) {
  const r = larghezza / 2
  const ry = r * SCHIACCIA
  const h = altezza * 0.42
  return (
    <g>
      {/* vera del pozzo */}
      <path d={`M${-r} ${-h} v${h} a${r} ${ry} 0 0 0 ${r * 2} 0 v${-h} z`} fill={LEGNO.ombra} {...contorno} />
      <ellipse cx={0} cy={-h} rx={r} ry={ry} fill="#5E86A8" {...contorno} />
      <ellipse cx={0} cy={-h} rx={r * 0.62} ry={ry * 0.62} fill="#3E6A8C" {...sottile} />
      {/* montanti e tetto */}
      <path
        d={`M${-r * 0.72} ${-h} v${-altezza * 0.72} M${r * 0.72} ${-h} v${-altezza * 0.72}`}
        stroke={NOTTE}
        strokeWidth={TRATTO}
        strokeLinecap="round"
      />
      <path
        d={`M${-r - 6} ${arrotonda(-h - altezza * 0.72)} L0 ${arrotonda(-h - altezza * 1.12)} L${r + 6} ${arrotonda(-h - altezza * 0.72)} z`}
        fill={PIETRA.tetto}
        {...contorno}
      />
    </g>
  )
}

/**
 * Il granaio: lo stesso della fase 3, visto da qui.
 * Corpo di legno, tetto corallo, porta ad arco: il cliente lo riconosce.
 */
export function Granaio({ larghezza, altezza }: { larghezza: number; altezza: number }) {
  const w = larghezza
  const d = larghezza * 0.7
  const corpo = altezza * 0.66
  const avanti = (d / 2) * SCHIACCIA
  const dietro = -(d / 2) * SCHIACCIA

  return (
    <g>
      <Prisma larghezza={w} profondita={d} altezza={corpo} luce={LEGNO.luce} ombra={LEGNO.ombra} />
      {/* doghe verticali, come nella scena della scorta */}
      <path
        d={[-0.28, 0, 0.28].map((f) => `M${arrotonda(w * f)} ${arrotonda(avanti - corpo)} v${corpo}`).join(' ')}
        stroke={NOTTE}
        strokeWidth={1.8}
        opacity={0.32}
      />
      {/* porta ad arco */}
      <path
        d={`M${-w * 0.14} ${avanti} v-20 a${w * 0.14} ${w * 0.14} 0 0 1 ${w * 0.28} 0 v20 z`}
        fill={NOTTE}
        {...sottile}
      />
      {/* tetto a doppia falda, corallo */}
      <path
        d={`M${-w / 2 - 8} ${arrotonda(avanti - corpo)} L0 ${arrotonda(avanti - altezza - 14)} L${w / 2 + 8} ${arrotonda(avanti - corpo)} z`}
        fill={PIETRA.tetto}
        {...contorno}
      />
      <path
        d={`M0 ${arrotonda(avanti - altezza - 14)} L0 ${arrotonda(dietro - altezza - 14)} L${w / 2 + 8} ${arrotonda(dietro - corpo)} L${w / 2 + 8} ${arrotonda(avanti - corpo)} z`}
        fill="#C25A45"
        {...sottile}
      />
    </g>
  )
}

/** Il deposito: il capitale gia' messo a frutto, al sicuro. */
export function Deposito({ larghezza, altezza }: { larghezza: number; altezza: number }) {
  const d = larghezza * 0.68
  const avanti = (d / 2) * SCHIACCIA
  return (
    <g>
      <Prisma larghezza={larghezza} profondita={d} altezza={altezza} luce={PIETRA.luce} ombra={PIETRA.ombra} />
      {/* portellone rinforzato */}
      <rect
        x={arrotonda(-larghezza * 0.22)}
        y={arrotonda(avanti - altezza * 0.72)}
        width={arrotonda(larghezza * 0.44)}
        height={arrotonda(altezza * 0.72)}
        rx={3}
        fill={LEGNO.ombra}
        {...sottile}
      />
      <path
        d={`M${arrotonda(-larghezza * 0.22)} ${arrotonda(avanti - altezza * 0.42)} h${arrotonda(larghezza * 0.44)}`}
        stroke={NOTTE}
        strokeWidth={SOTTILE}
      />
      <circle cx={0} cy={arrotonda(avanti - altezza * 0.36)} r={5} fill="var(--sole)" stroke={NOTTE} strokeWidth={SOTTILE} />
    </g>
  )
}

// ---------------------------------------------------------------- cinta esterna

/** Il portone con il corpo di guardia. */
export function Portone({ larghezza, altezza }: { larghezza: number; altezza: number }) {
  const w = larghezza
  const torretta = w * 0.26
  const d = 54
  const avanti = (d / 2) * SCHIACCIA

  return (
    <g>
      {/* le due torrette di guardia */}
      {[-1, 1].map((lato) => (
        <g key={lato} transform={`translate(${arrotonda((lato * (w / 2 - torretta / 2)))} 0)`}>
          <Prisma
            larghezza={torretta}
            profondita={d}
            altezza={altezza}
            luce={PIETRA.luce}
            ombra={PIETRA.ombra}
          />
          <Merli larghezza={torretta} y={avanti - altezza} quanti={2} colore={PIETRA.luce} />
        </g>
      ))}
      {/* il varco fra le due */}
      <path
        d={`M${-w / 2 + torretta} ${avanti} v${-altezza * 0.62} q${(w - torretta * 2) / 2} ${-altezza * 0.34} ${w - torretta * 2} 0 v${altezza * 0.62} z`}
        fill={LEGNO.ombra}
        {...contorno}
      />
      <path
        d={[-0.12, 0, 0.12].map((f) => `M${arrotonda(w * f)} ${arrotonda(avanti)} v${arrotonda(-altezza * 0.72)}`).join(' ')}
        stroke={NOTTE}
        strokeWidth={1.8}
        opacity={0.4}
      />
    </g>
  )
}

/** Un'increspatura sull'acqua, dove non passa il ponte. */
function Onde({ punto }: { punto: string | undefined }) {
  if (!punto) return null
  const [sx, sy] = punto.split(' ')
  const x = Number(sx)
  const y = Number(sy)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return (
    <path
      d={`M${arrotonda(x - 16)} ${arrotonda(y + LARGHEZZA_FOSSATO * SCHIACCIA * 0.45)} q9 -6 18 0 t18 0`}
      fill="none"
      stroke="#A8C4D8"
      strokeWidth={3}
      strokeLinecap="round"
    />
  )
}

/** Un tratto del fossato. Il ponte levatoio si disegna solo dove passa. */
export function Fossato({
  raggio,
  da,
  a,
  centroU,
  centroV,
  conPonte,
}: {
  raggio: number
  da: number
  a: number
  centroU: number
  centroV: number
  conPonte: boolean
}) {
  const passi = Math.max(10, Math.round(Math.abs(a - da) / 4))
  const esterno: string[] = []
  const interno: string[] = []

  for (let i = 0; i <= passi; i += 1) {
    const gradi = da + ((a - da) * i) / passi
    const dentro = suCerchio(raggio, gradi)
    const fuori = suCerchio(raggio + LARGHEZZA_FOSSATO, gradi)
    const pd = proietta(dentro.u - centroU, dentro.v - centroV)
    const pf = proietta(fuori.u - centroU, fuori.v - centroV)
    interno.push(`${pd.x} ${pd.y}`)
    esterno.push(`${pf.x} ${pf.y}`)
  }

  const acqua = `M${interno[0]} ${interno.slice(1).map((p) => `L${p}`).join(' ')} L${esterno[esterno.length - 1]} ${esterno
    .slice(0, -1)
    .reverse()
    .map((p) => `L${p}`)
    .join(' ')} Z`

  const dentro180 = suCerchio(raggio, 180)
  const fuori180 = suCerchio(raggio + LARGHEZZA_FOSSATO + 8, 180)
  const pi = proietta(dentro180.u - centroU, dentro180.v - centroV)
  const pe = proietta(fuori180.u - centroU, fuori180.v - centroV)

  return (
    <g>
      <path d={acqua} fill="#5E86A8" {...contorno} />
      {conPonte ? (
        <>
          <path
            d={`M${arrotonda(pi.x - 34)} ${arrotonda(pi.y)} h68 L${arrotonda(pe.x + 40)} ${arrotonda(pe.y)} h-80 z`}
            fill={LEGNO.luce}
            {...contorno}
          />
          <path
            d={`M${arrotonda(pi.x - 26)} ${arrotonda((pi.y + pe.y) / 2)} h52`}
            stroke={NOTTE}
            strokeWidth={1.8}
            opacity={0.45}
          />
        </>
      ) : (
        <Onde punto={interno[Math.floor(passi / 2)]} />
      )}
    </g>
  )
}
