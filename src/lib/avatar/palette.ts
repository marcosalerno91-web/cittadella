import { AVATAR } from '@/config/engine'
import { FIGURE, LUNGHEZZE } from '@/lib/domain'
import type { AvatarSeed, Figura, LunghezzaCapelli, ProfessioneKey } from '@/lib/domain'
import type { FasciaEta, Proporzioni } from '@/lib/avatar/tipi'

/** Quattro incarnati naturali, ben distanziati. */
export const PELLI: readonly string[] = ['#F4D2B6', '#D49A6F', '#AC7442', '#6B4020']

/** Quattro colori di capelli naturali. L'ultimo e' il grigio dei capelli bianchi. */
export const TINTE: readonly string[] = ['#2B2118', '#6B4423', '#C08A45', '#9AA0A6']

const INDICE_GRIGIO = 3

export function colorePelle(seed: AvatarSeed): string {
  return PELLI[modulo(seed.pelle, PELLI.length)] ?? PELLI[0]!
}

export function coloreCapelli(seed: AvatarSeed): string {
  return TINTE[modulo(seed.tinta, TINTE.length)] ?? TINTE[0]!
}

function modulo(v: number, n: number): number {
  const i = Math.trunc(Number.isFinite(v) ? v : 0)
  return ((i % n) + n) % n
}

// ---------------------------------------------------------------- dal nome

function impronta(testo: string): number {
  let h = 2166136261
  for (let i = 0; i < testo.length; i += 1) {
    h ^= testo.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * Nomi italiani in -a che sono maschili. Sono pochi e ricorrenti: vale la pena
 * elencarli invece di sbagliare su meta' dei Luca che entrano in studio.
 */
const MASCHILI_IN_A = new Set([
  'andrea', 'luca', 'nicola', 'elia', 'mattia', 'battista', 'geremia', 'tobia', 'enea',
])

/** Nomi femminili che non finiscono in -a. */
const FEMMINILI_ALTRE = new Set([
  'alice', 'beatrice', 'agnese', 'irene', 'adele', 'ester', 'noemi', 'ruth', 'iris',
  'lara', 'nives', 'consuelo', 'ingrid', 'miriam', 'rachele', 'gaia', 'sofie', 'maud',
])

/**
 * Figura dedotta dal nome. E' un tentativo, non una regola: si corregge con un
 * tocco, ed e' per questo che il controllo sta sempre in vista.
 */
export function figuraDaNome(nome: string): Figura {
  const pulito = nome.trim().toLowerCase().split(/[\s'’-]/)[0] ?? ''
  if (!pulito) return 'femminile'
  if (FEMMINILI_ALTRE.has(pulito)) return 'femminile'
  if (pulito.endsWith('a')) return MASCHILI_IN_A.has(pulito) ? 'maschile' : 'femminile'
  if (pulito.endsWith('o') || pulito.endsWith('i') || pulito.endsWith('u')) return 'maschile'
  // i nomi italiani in -e sono in maggioranza maschili (Davide, Michele, Simone)
  return 'maschile'
}

/**
 * Incarnato e colore dei capelli, derivati dal nome. Nessun controllo in
 * interfaccia: due "Marta" della stessa eta' nascono uguali.
 *
 * Sopra l'eta' del tempo libero i capelli diventano grigi: e' l'unica cosa che
 * l'eta' decide al posto del nome.
 */
export function seedDaNome(nome: string, eta: number): AvatarSeed {
  const n = impronta(nome.trim().toLowerCase())
  const senior = eta >= AVATAR.fascia_senior
  return {
    figura: figuraDaNome(nome),
    capelli: 'corti',
    pelle: n % PELLI.length,
    // il grigio resta ai capelli bianchi: sotto, si sceglie fra gli altri tre
    tinta: senior ? INDICE_GRIGIO : Math.floor(n / 7) % INDICE_GRIGIO,
  }
}

/**
 * Riporta alla forma corrente un aspetto salvato.
 *
 * Le sessioni aperte prima della v1.1 hanno `capelli` e `taglio` numerici e non
 * hanno `figura`: si ricostruisce quello che manca dal nome, senza perdere la
 * sessione.
 */
export function seedNormalizzato(grezzo: unknown, nome: string, eta: number): AvatarSeed {
  const predefinito = seedDaNome(nome, eta)
  if (!grezzo || typeof grezzo !== 'object') return predefinito

  const v = grezzo as Partial<Record<keyof AvatarSeed, unknown>>
  const figura = FIGURE.includes(v.figura as Figura) ? (v.figura as Figura) : predefinito.figura
  const capelli = LUNGHEZZE.includes(v.capelli as LunghezzaCapelli)
    ? (v.capelli as LunghezzaCapelli)
    : predefinito.capelli

  return {
    figura,
    capelli,
    pelle: typeof v.pelle === 'number' ? modulo(v.pelle, PELLI.length) : predefinito.pelle,
    tinta: typeof v.tinta === 'number' ? modulo(v.tinta, TINTE.length) : predefinito.tinta,
  }
}

// ---------------------------------------------------------------- fasce

export function fasciaDaEta(eta: number): FasciaEta {
  if (eta < AVATAR.fascia_bambino) return 'bambino'
  if (eta < AVATAR.fascia_ragazzo) return 'ragazzo'
  if (eta < AVATAR.fascia_senior) return 'adulto'
  return 'senior'
}

/** Misure comuni alla fascia, indipendenti dalla figura. */
const COMUNI: Record<FasciaEta, Omit<Proporzioni, 'figura' | 'spalleW' | 'vitaW' | 'svasatura'>> = {
  bambino: { fascia: 'bambino', testaX: 50, testaY: 48, testaR: 26, colloY: 74, spalleY: 84, vitaY: 110, ancheY: 116, piediY: 152, passoW: 13, arto: 10 },
  ragazzo: { fascia: 'ragazzo', testaX: 50, testaY: 42, testaR: 23, colloY: 65, spalleY: 74, vitaY: 110, ancheY: 116, piediY: 154, passoW: 14, arto: 10 },
  adulto: { fascia: 'adulto', testaX: 50, testaY: 39, testaR: 22, colloY: 61, spalleY: 70, vitaY: 110, ancheY: 117, piediY: 155, passoW: 15, arto: 11 },
  senior: { fascia: 'senior', testaX: 50, testaY: 41, testaR: 22, colloY: 63, spalleY: 72, vitaY: 111, ancheY: 117, piediY: 155, passoW: 14, arto: 11 },
}

function scheletro(
  fascia: FasciaEta,
  variabili: { spalleW: number; vitaW: number; svasatura: number; passoW?: number },
): Proporzioni {
  return { ...COMUNI[fascia], ...variabili, figura: 'maschile' }
}

/**
 * Scheletri: uno per fascia d'eta' e per figura.
 *
 * La differenza fra le due figure sta nel rapporto fra spalle e fianchi e in
 * una vita appena segnata. Da bambini e' quasi nulla, come nella realta'.
 */
const SCHELETRI: Record<FasciaEta, Record<Figura, Proporzioni>> = {
  // Le due figure si distinguono per il rapporto spalle-fianchi e per la vita.
  // I fianchi non superano mai le spalle di piu' di un'unita': oltre, le braccia
  // finirebbero dentro la sagoma invece di cadere lungo i fianchi.
  bambino: {
    maschile: scheletro('bambino', { spalleW: 24, vitaW: 21, svasatura: 0 }),
    femminile: scheletro('bambino', { spalleW: 22, vitaW: 22, svasatura: 2 }),
  },
  ragazzo: {
    maschile: scheletro('ragazzo', { spalleW: 28, vitaW: 22, svasatura: 0 }),
    femminile: scheletro('ragazzo', { spalleW: 24, vitaW: 25, svasatura: 5, passoW: 15 }),
  },
  adulto: {
    maschile: scheletro('adulto', { spalleW: 31, vitaW: 23, svasatura: 0 }),
    femminile: scheletro('adulto', { spalleW: 26, vitaW: 27, svasatura: 7, passoW: 16 }),
  },
  senior: {
    maschile: scheletro('senior', { spalleW: 29, vitaW: 25, svasatura: 0 }),
    femminile: scheletro('senior', { spalleW: 25, vitaW: 26, svasatura: 5, passoW: 15 }),
  },
}

export function proporzioni(eta: number, figura: Figura): Proporzioni {
  const perFascia = SCHELETRI[fasciaDaEta(eta)]
  return { ...perFascia[figura], figura }
}

/**
 * Professione suggerita in base all'eta'. Il consulente puo' sempre cambiarla:
 * e' un suggerimento, non una regola.
 */
export function professioneSuggerita(eta: number): ProfessioneKey | null {
  if (eta < AVATAR.eta_bambino) return 'bambino'
  if (eta < AVATAR.eta_studente) return 'studente'
  if (eta >= AVATAR.fascia_senior) return AVATAR.professione_pensione
  return null
}
