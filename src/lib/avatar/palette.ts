import { AVATAR } from '@/config/engine'
import { FIGURE, INCARNATI, LUNGHEZZE } from '@/lib/domain'
import type {
  AvatarSeed,
  Figura,
  Incarnato,
  LunghezzaCapelli,
  ProfessioneKey,
} from '@/lib/domain'
import type { FasciaEta, Proporzioni } from '@/lib/avatar/tipi'

/**
 * Quattro incarnati, ben distanziati ma non a salti: due tonalita' sole
 * sarebbero un gradino che davanti a una famiglia vera si vede.
 */
export const PELLI: Record<Incarnato, string> = {
  chiaro: '#F4D2B6',
  olivastro: '#DBA97D',
  ambrato: '#B87B47',
  scuro: '#7A4A24',
}

/**
 * Il colore dei capelli non ha un comando: segue l'incarnato su tonalita'
 * coerenti. Sopra l'eta' del tempo libero diventa grigio.
 */
const CAPELLI_PER_INCARNATO: Record<Incarnato, string> = {
  chiaro: '#8A6234',
  olivastro: '#5E3C1E',
  ambrato: '#3E2716',
  scuro: '#241A14',
}

export const GRIGIO = '#9AA0A6'

export function colorePelle(seed: AvatarSeed): string {
  return PELLI[seed.incarnato] ?? PELLI.chiaro
}

export function coloreCapelli(seed: AvatarSeed, eta: number): string {
  if (eta >= AVATAR.fascia_senior) return GRIGIO
  return CAPELLI_PER_INCARNATO[seed.incarnato] ?? CAPELLI_PER_INCARNATO.chiaro
}

// ---------------------------------------------------------------- dal nome

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
 *
 * E' l'unica cosa che il nome decide. L'incarnato no: dedurre il colore della
 * pelle da un nome sarebbe sbagliato, e infatti si sceglie.
 */
export function figuraDaNome(nome: string): Figura {
  const pulito = nome.trim().toLowerCase().split(/[\s'\u2019-]/)[0] ?? ''
  if (!pulito) return 'femminile'
  if (FEMMINILI_ALTRE.has(pulito)) return 'femminile'
  if (pulito.endsWith('a')) return MASCHILI_IN_A.has(pulito) ? 'maschile' : 'femminile'
  if (pulito.endsWith('o') || pulito.endsWith('i') || pulito.endsWith('u')) return 'maschile'
  // i nomi italiani in -e sono in maggioranza maschili (Davide, Michele, Simone)
  return 'maschile'
}

/** L'aspetto di partenza di una persona appena aggiunta alla scena. */
export function seedDaNome(nome: string): AvatarSeed {
  return { figura: figuraDaNome(nome), capelli: 'corti', incarnato: 'chiaro' }
}

/**
 * Riporta alla forma corrente un aspetto salvato.
 *
 * Le sessioni aperte prima della v1.2 hanno `pelle` e `tinta` numerici: si
 * riparte da `chiaro`, che e' il predefinito, senza perdere la sessione.
 */
export function seedNormalizzato(grezzo: unknown, nome: string): AvatarSeed {
  const predefinito = seedDaNome(nome)
  if (!grezzo || typeof grezzo !== 'object') return predefinito

  const v = grezzo as Partial<Record<keyof AvatarSeed, unknown>>
  // 'lunghi' e' stato sostituito da 'raccolti': chi l'aveva scelto se lo ritrova
  const capelli = v.capelli === 'lunghi' ? 'raccolti' : v.capelli

  return {
    figura: FIGURE.includes(v.figura as Figura) ? (v.figura as Figura) : predefinito.figura,
    capelli: LUNGHEZZE.includes(capelli as LunghezzaCapelli)
      ? (capelli as LunghezzaCapelli)
      : predefinito.capelli,
    incarnato: INCARNATI.includes(v.incarnato as Incarnato)
      ? (v.incarnato as Incarnato)
      : predefinito.incarnato,
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
