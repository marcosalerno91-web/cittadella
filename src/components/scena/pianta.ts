/**
 * La planimetria della cittadella.
 *
 * La scena non e' piu' una vista frontale con quattro muri uno davanti
 * all'altro — erano illeggibili, ogni cinta nuova copriva la precedente. E'
 * una pianta assonometrica: si guarda da sopra e appena di lato, come una
 * mappa di citta' disegnata a mano. Cosi' niente si mette davanti a niente:
 * le cinte circondano invece di coprire.
 *
 * Qui c'e' solo la geometria. Come si disegna ogni cosa sta in Fortezza.tsx.
 */

import { BLOCCHI_FORTEZZA } from '@/config/engine'
import type { BloccoKey } from '@/lib/domain'

/**
 * Schiacciamento del piano di terra. 1 sarebbe la vista dall'alto perfetta,
 * 0 la vista frontale: a 0.55 si vede la pianta e si intuisce il volume.
 */
/**
 * Piu' e' basso, piu' la pianta e' larga e schiacciata. A 0.5 la mappa ha
 * all'incirca le proporzioni della fascia in cui vive nella fase 4, e i nomi
 * delle costruzioni restano leggibili da 80 cm.
 */
export const SCHIACCIA = 0.5

export interface PuntoSchermo {
  x: number
  y: number
}

/** Da un punto a terra (u verso destra, v verso chi guarda) al piano dello schermo. */
export function proietta(u: number, v: number, altezza = 0): PuntoSchermo {
  return { x: arrotonda(u), y: arrotonda(v * SCHIACCIA - altezza) }
}

export function arrotonda(v: number): number {
  return Math.round(v * 100) / 100
}

/** Punto sulla circonferenza di raggio r. Gradi da nord (in fondo), orari. */
export function suCerchio(raggio: number, gradi: number): { u: number; v: number } {
  const r = (gradi * Math.PI) / 180
  return { u: raggio * Math.sin(r), v: -raggio * Math.cos(r) }
}

// ---------------------------------------------------------------- tipi

export type TipoCostruzione =
  | 'torre_maestra'
  | 'torre'
  | 'muro_interno'
  | 'pozzo'
  | 'granaio'
  | 'deposito'
  | 'mura_esterne'
  | 'portone'
  | 'fossato'

export interface Costruzione {
  voceKey: string
  blocco: BloccoKey
  tipo: TipoCostruzione
  /** posizione a terra del baricentro */
  u: number
  v: number
  /** altezza in unita' di schermo */
  altezza: number
  /** per i muri e gli anelli: settore sulla circonferenza */
  anello?: { raggio: number; da: number; a: number }
  /** ingombro a terra, per l'inquadratura e per la fondazione */
  ingombro: { larghezza: number; profondita: number }
  /** dove si posa l'etichetta rispetto al baricentro, in unita' di schermo */
  etichetta: { dx: number; dy: number; ancoraggio: 'start' | 'middle' | 'end' }
}

// ---------------------------------------------------------------- misure

/** La piazza dove sta la famiglia. Nessuna costruzione la invade. */
export const PIAZZA = { u: 0, v: -6, raggio: 200 } as const

/**
 * Le fasce sono strette: se le cinte stanno larghe, la famiglia si perde.
 * Ognuna ha lo spazio che le serve e non un'unita' di piu'.
 */
const RAGGIO_MURA_INTERNE = 312
const RAGGIO_CORTILE = 396
const RAGGIO_MURA_ESTERNE = 478
const RAGGIO_FOSSATO = 528

export const ALTEZZE = {
  torre_maestra: 92,
  torre: 64,
  muro_interno: 34,
  cortile: 36,
  mura_esterne: 28,
  portone: 46,
  fossato: 0,
} as const

/** Larghezza del fossato, a terra. */
export const LARGHEZZA_FOSSATO = 40

/** Apertura del portone sulla cinta esterna, in gradi. */
export const VARCO_PORTONE = { da: 166, a: 194 } as const

// ---------------------------------------------------------------- la pianta

/**
 * Ogni voce delle mura e' una costruzione diversa. E' questo che toglie la
 * monotonia: non quattro muri sempre piu' grandi, ma quattro generi di
 * architettura.
 */
export const PIANTA: readonly Costruzione[] = [
  // ---------------------------------------- il mastio e le sue torri
  {
    voceKey: 'tcm',
    blocco: 'mastio',
    tipo: 'torre_maestra',
    u: 0,
    v: -232,
    altezza: ALTEZZE.torre_maestra,
    ingombro: { larghezza: 104, profondita: 78 },
    etichetta: { dx: 0, dy: -ALTEZZE.torre_maestra - 76, ancoraggio: 'middle' },
  },
  {
    voceKey: 'ltc',
    blocco: 'mastio',
    tipo: 'torre',
    u: -242,
    v: -84,
    altezza: ALTEZZE.torre,
    ingombro: { larghezza: 76, profondita: 58 },
    etichetta: { dx: -66, dy: -18, ancoraggio: 'end' },
  },
  {
    voceKey: 'critical_illness',
    blocco: 'mastio',
    tipo: 'torre',
    u: 242,
    v: -84,
    altezza: ALTEZZE.torre,
    ingombro: { larghezza: 76, profondita: 58 },
    etichetta: { dx: 66, dy: -18, ancoraggio: 'start' },
  },
  {
    voceKey: 'invalidita_permanente_grave',
    blocco: 'mastio',
    tipo: 'torre',
    u: 0,
    v: 216,
    altezza: ALTEZZE.torre,
    ingombro: { larghezza: 76, profondita: 58 },
    etichetta: { dx: 0, dy: 42, ancoraggio: 'middle' },
  },

  // ---------------------------------------- le mura interne, anello chiuso
  // I quattro tratti stanno sulle diagonali: al centro dietro ci sono gia' il
  // mastio e la cinta esterna, e tre etichette sulla stessa verticale non si
  // leggono piu'.
  ...anello('salute', 'muro_interno', RAGGIO_MURA_INTERNE, ALTEZZE.muro_interno, [
    { voceKey: 'rimborso_spese_mediche', da: 270, a: 360 },
    { voceKey: 'grandi_interventi', da: 0, a: 90 },
    { voceKey: 'ipi_infortunio', da: 90, a: 180 },
    { voceKey: 'assistenza', da: 180, a: 270 },
  ]),

  // ---------------------------------------- il cortile
  {
    voceKey: 'pip',
    blocco: 'risparmio',
    tipo: 'pozzo',
    ...suCerchio(RAGGIO_CORTILE, 270),
    altezza: ALTEZZE.cortile,
    ingombro: { larghezza: 74, profondita: 56 },
    etichetta: { dx: -50, dy: -ALTEZZE.cortile - 62, ancoraggio: 'end' },
  },
  {
    voceKey: 'pac',
    blocco: 'risparmio',
    tipo: 'granaio',
    ...suCerchio(RAGGIO_CORTILE, 90),
    altezza: ALTEZZE.cortile,
    ingombro: { larghezza: 82, profondita: 60 },
    etichetta: { dx: 50, dy: -ALTEZZE.cortile - 62, ancoraggio: 'start' },
  },
  {
    voceKey: 'premi_unici',
    blocco: 'risparmio',
    tipo: 'deposito',
    ...suCerchio(RAGGIO_CORTILE, 196),
    altezza: ALTEZZE.cortile - 8,
    ingombro: { larghezza: 78, profondita: 56 },
    etichetta: { dx: -58, dy: 34, ancoraggio: 'end' },
  },

  // ---------------------------------------- la cinta esterna
  {
    voceKey: 'casa',
    blocco: 'perimetro',
    tipo: 'mura_esterne',
    u: 0,
    v: -RAGGIO_MURA_ESTERNE,
    altezza: ALTEZZE.mura_esterne,
    anello: { raggio: RAGGIO_MURA_ESTERNE, da: VARCO_PORTONE.a, a: 360 + VARCO_PORTONE.da },
    ingombro: { larghezza: RAGGIO_MURA_ESTERNE * 2, profondita: RAGGIO_MURA_ESTERNE * 2 },
    etichetta: { dx: -262, dy: -ALTEZZE.mura_esterne - 26, ancoraggio: 'end' },
  },
  {
    voceKey: 'rc_capofamiglia',
    blocco: 'perimetro',
    tipo: 'portone',
    u: 0,
    v: RAGGIO_MURA_ESTERNE,
    altezza: ALTEZZE.portone,
    ingombro: { larghezza: 132, profondita: 62 },
    etichetta: { dx: 108, dy: 4, ancoraggio: 'start' },
  },
  {
    voceKey: 'tutela_legale',
    blocco: 'perimetro',
    tipo: 'fossato',
    u: 0,
    v: RAGGIO_FOSSATO,
    altezza: ALTEZZE.fossato,
    anello: { raggio: RAGGIO_FOSSATO, da: 0, a: 360 },
    ingombro: {
      larghezza: (RAGGIO_FOSSATO + LARGHEZZA_FOSSATO) * 2,
      profondita: (RAGGIO_FOSSATO + LARGHEZZA_FOSSATO) * 2,
    },
    etichetta: { dx: 0, dy: 34, ancoraggio: 'middle' },
  },
]

function anello(
  blocco: BloccoKey,
  tipo: TipoCostruzione,
  raggio: number,
  altezza: number,
  segmenti: { voceKey: string; da: number; a: number }[],
): Costruzione[] {
  return segmenti.map((s) => {
    const meta = (s.da + s.a) / 2
    const centro = suCerchio(raggio, meta)
    const fuori = suCerchio(raggio + 62, meta)
    return {
      voceKey: s.voceKey,
      blocco,
      tipo,
      u: centro.u,
      v: centro.v,
      altezza,
      anello: { raggio, da: s.da, a: s.a },
      ingombro: { larghezza: raggio * 2, profondita: raggio * 2 },
      etichetta: {
        // esce dal muro e resta orizzontale, mai ruotata con l'assonometria
        dx: arrotonda(fuori.u - centro.u),
        dy: arrotonda((fuori.v - centro.v) * SCHIACCIA + (meta > 90 && meta < 270 ? 20 : -altezza - 18)),
        ancoraggio: meta > 200 && meta < 340 ? 'end' : meta > 20 && meta < 160 ? 'start' : 'middle',
      },
    }
  })
}

/**
 * Spezza un arco nei tratti che non attraversano i fianchi (90 e 270 gradi).
 *
 * Serve perche' un anello intero non ha una sola profondita': la sua meta'
 * dietro sta dietro alla famiglia e quella davanti le sta davanti. Senza
 * questo, il fossato finiva disegnato sopra a tutta la scena.
 */
export function spezzaArco(da: number, a: number): { da: number; a: number }[] {
  const tagli = new Set<number>([da, a])
  // i fianchi della circonferenza sono a 90 e 270 gradi, e si ripetono ogni 180
  for (let g = -630; g <= 1170; g += 180) {
    if (g > Math.min(da, a) && g < Math.max(da, a)) tagli.add(g)
  }
  const ordinati = [...tagli].sort((x, y) => x - y)
  const pezzi: { da: number; a: number }[] = []
  for (let i = 1; i < ordinati.length; i += 1) {
    const inizio = ordinati[i - 1]
    const fine = ordinati[i]
    if (inizio === undefined || fine === undefined || fine - inizio < 0.5) continue
    pezzi.push({ da: inizio, a: fine })
  }
  return pezzi.length > 0 ? pezzi : [{ da, a }]
}

/** Quanto e' vicino a chi guarda il punto medio di un arco. */
export function profonditaArco(raggio: number, da: number, a: number): number {
  return suCerchio(raggio, (da + a) / 2).v
}

/** La costruzione che corrisponde a una voce. */
export function costruzioneDi(voceKey: string): Costruzione | undefined {
  return PIANTA.find((c) => c.voceKey === voceKey)
}

/** Le costruzioni di un blocco, nell'ordine in cui si affrontano. */
export function costruzioniDi(blocco: BloccoKey): Costruzione[] {
  const definizione = BLOCCHI_FORTEZZA.find((b) => b.key === blocco)
  if (!definizione) return []
  return definizione.voci
    .map((v) => costruzioneDi(v))
    .filter((c): c is Costruzione => Boolean(c))
}
