import type { AvatarSeed, Figura, ProfessioneKey } from '@/lib/domain'

/**
 * Tutti gli avatar condividono questo viewBox. E' la ragione per cui si possono
 * comporre in scena, allineare sulla curva e mettere nei PDF senza ricalcoli.
 */
export const VIEWBOX = { larghezza: 100, altezza: 165 } as const
export const VIEWBOX_ATTR = `0 0 ${VIEWBOX.larghezza} ${VIEWBOX.altezza}`

export type FasciaEta = 'bambino' | 'ragazzo' | 'adulto' | 'senior'

/**
 * Scheletro dell'avatar per una fascia d'eta'. Ogni capo di vestiario e ogni
 * accessorio si disegna in funzione di questi punti: cambiando la fascia
 * cambiano le proporzioni, non i disegni.
 */
export interface Proporzioni {
  fascia: FasciaEta
  figura: Figura
  /** testa */
  testaX: number
  testaY: number
  testaR: number
  /** collo */
  colloY: number
  /** spalle */
  spalleY: number
  spalleW: number
  /** vita */
  vitaY: number
  /** quanto il busto rientra a meta' altezza prima di riaprirsi. 0 = dritto */
  svasatura: number
  vitaW: number
  /** fine del busto / inizio gambe */
  ancheY: number
  /** piedi */
  piediY: number
  /** distanza fra i due assi delle gambe */
  passoW: number
  /** spessore di braccia e gambe */
  arto: number
}

/** Un solo set di espressioni in v1, ma l'API ne prevede altri. */
export type Espressione = 'sorriso'

export interface ContestoAvatar {
  P: Proporzioni
  seed: AvatarSeed
  professione: ProfessioneKey
  espressione: Espressione
}

/** Spessore uniforme dei contorni: e' la firma dello stile. */
export const TRATTO = 3.2
export const TRATTO_SOTTILE = 2.4
