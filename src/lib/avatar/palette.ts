import { AVATAR } from '@/config/engine'
import type { AvatarSeed, ProfessioneKey } from '@/lib/domain'
import type { FasciaEta, Proporzioni } from '@/lib/avatar/tipi'

export const PELLI: readonly string[] = [
  '#F4D2B6',
  '#E9B994',
  '#D49A6F',
  '#AC7442',
  '#7C4C24',
  '#5B341B',
]

export const CAPELLI: readonly string[] = [
  '#2B2118',
  '#5A3A22',
  '#8B5A32',
  '#BE8A45',
  '#E0C173',
  '#9AA0A6',
]

export const TAGLI = ['corto', 'medio', 'lungo', 'raccolto', 'riccio', 'rasato'] as const
export type Taglio = (typeof TAGLI)[number]

export const VARIANTI = 6

export function colorePelle(seed: AvatarSeed): string {
  return PELLI[modulo(seed.pelle, PELLI.length)] ?? '#F4D2B6'
}

export function coloreCapelli(seed: AvatarSeed): string {
  return CAPELLI[modulo(seed.capelli, CAPELLI.length)] ?? '#2B2118'
}

export function taglio(seed: AvatarSeed): Taglio {
  return TAGLI[modulo(seed.taglio, TAGLI.length)] ?? 'corto'
}

function modulo(v: number, n: number): number {
  const i = Math.trunc(Number.isFinite(v) ? v : 0)
  return ((i % n) + n) % n
}

/** Seme deterministico a partire dal nome: due "Marta" nascono uguali. */
export function seedDaNome(nome: string, eta: number): AvatarSeed {
  let h = 2166136261
  const testo = `${nome.trim().toLowerCase()}|${Math.floor(eta / 10)}`
  for (let i = 0; i < testo.length; i += 1) {
    h ^= testo.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const n = Math.abs(h)
  return {
    pelle: n % PELLI.length,
    capelli: Math.floor(n / 7) % CAPELLI.length,
    taglio: Math.floor(n / 53) % TAGLI.length,
  }
}

// ---------------------------------------------------------------- fasce

export function fasciaDaEta(eta: number): FasciaEta {
  if (eta < AVATAR.fascia_bambino) return 'bambino'
  if (eta < AVATAR.fascia_ragazzo) return 'ragazzo'
  if (eta < AVATAR.fascia_senior) return 'adulto'
  return 'senior'
}

const SCHELETRI: Record<FasciaEta, Proporzioni> = {
  bambino: {
    fascia: 'bambino',
    testaX: 50,
    testaY: 48,
    testaR: 26,
    colloY: 74,
    spalleY: 84,
    spalleW: 23,
    vitaY: 110,
    vitaW: 21,
    ancheY: 116,
    piediY: 152,
    passoW: 13,
    arto: 10,
  },
  ragazzo: {
    fascia: 'ragazzo',
    testaX: 50,
    testaY: 42,
    testaR: 23,
    colloY: 65,
    spalleY: 74,
    spalleW: 26,
    vitaY: 110,
    vitaW: 22,
    ancheY: 116,
    piediY: 154,
    passoW: 14,
    arto: 10,
  },
  adulto: {
    fascia: 'adulto',
    testaX: 50,
    testaY: 39,
    testaR: 22,
    colloY: 61,
    spalleY: 70,
    spalleW: 29,
    vitaY: 110,
    vitaW: 24,
    ancheY: 117,
    piediY: 155,
    passoW: 15,
    arto: 11,
  },
  senior: {
    fascia: 'senior',
    testaX: 50,
    testaY: 41,
    testaR: 22,
    colloY: 63,
    spalleY: 72,
    spalleW: 27,
    vitaY: 111,
    vitaW: 25,
    ancheY: 117,
    piediY: 155,
    passoW: 14,
    arto: 11,
  },
}

export function proporzioni(eta: number): Proporzioni {
  return SCHELETRI[fasciaDaEta(eta)]
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
