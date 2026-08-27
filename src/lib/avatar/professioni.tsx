/**
 * Composizione: da professione_key a vestiario + accessorio.
 *
 * Aggiungere un mestiere significa aggiungere una riga qui, riusando i
 * mattoncini di vestiario.tsx e accessori.tsx. Il fallback e' 'casual':
 * outfit neutro, nessun accessorio.
 */

import type { ComponentType } from 'react'

import * as A from '@/lib/avatar/accessori'
import * as V from '@/lib/avatar/vestiario'
import type { ProfessioneKey } from '@/lib/domain'
import type { Proporzioni } from '@/lib/avatar/tipi'

type Pezzo = ComponentType<{ P: Proporzioni }>

/**
 * Tessuti fuori palette. Sono pochi e volutamente spenti: servono a rendere
 * riconoscibile il mestiere senza litigare con i sei colori del prodotto.
 */
const TESSUTI = {
  denim: '#4C6C93',
  jeans_chiaro: '#6E8CB0',
  grigio: '#8A9099',
  antracite: '#3A4048',
  bianco: '#FFFFFF',
  bordeaux: '#8C4A52',
  verde_scuro: '#3F7A63',
  marrone: '#9A6B44',
  blu_notte: '#2B4670',
} as const

export interface Vestito {
  /** colore dei pantaloni o della gonna */
  gambe: string
  /** colore della manica */
  manica: string
  /** quanta parte del braccio copre la manica, 0..1 */
  manicaFino: number
  /** capo che copre il busto */
  Corpo: Pezzo
  /** copricapo, disegnato sopra i capelli */
  Copricapo?: Pezzo
  /** oggetto disegnato per ultimo, sopra tutto */
  Accessorio?: Pezzo
  /** oggetto disegnato prima del busto (zaini, bretelle) */
  AccessorioDietro?: Pezzo
}

function capo(colore: string, allunga = 0): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => (
    <V.Capo P={P} colore={colore} allunga={allunga} />
  )
  Componente.displayName = 'Capo'
  return Componente
}

function comodo(colore: string): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => <V.Comodo P={P} colore={colore} />
  Componente.displayName = 'Comodo'
  return Componente
}

function camicia(coloreCamicia: string, cravatta?: string): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => (
    <>
      <V.Capo P={P} colore={coloreCamicia} />
      <V.Colletto P={P} colore={coloreCamicia} />
      {cravatta ? <V.Cravatta P={P} colore={cravatta} /> : <V.Bottoni P={P} />}
    </>
  )
  Componente.displayName = 'Camicia'
  return Componente
}

function giaccaSuCamicia(coloreGiacca: string, cravatta: string): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => (
    <>
      <V.Giacca P={P} colore={coloreGiacca} />
      <V.Cravatta P={P} colore={cravatta} />
    </>
  )
  Componente.displayName = 'GiaccaSuCamicia'
  return Componente
}

function conGrembiule(sotto: string, grembiule: string): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => (
    <>
      <V.Capo P={P} colore={sotto} />
      <V.Grembiule P={P} colore={grembiule} />
    </>
  )
  Componente.displayName = 'ConGrembiule'
  return Componente
}

function conSalopette(sotto: string, salopette: string): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => (
    <>
      <V.Capo P={P} colore={sotto} />
      <V.Salopette P={P} colore={salopette} />
    </>
  )
  Componente.displayName = 'ConSalopette'
  return Componente
}

function divisaSanitaria(colore: string): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => (
    <>
      <V.Capo P={P} colore={colore} />
      <V.Scollo P={P} />
    </>
  )
  Componente.displayName = 'DivisaSanitaria'
  return Componente
}

function divisaOrdine(colore: string): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => (
    <>
      <V.Capo P={P} colore={colore} />
      <V.Colletto P={P} colore={colore} />
      <V.Bottoni P={P} quanti={4} />
      <A.Distintivo P={P} />
    </>
  )
  Componente.displayName = 'DivisaOrdine'
  return Componente
}

function conGilet(sotto: string): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => (
    <>
      <V.Capo P={P} colore={sotto} />
      <V.Gilet P={P} />
    </>
  )
  Componente.displayName = 'ConGilet'
  return Componente
}

function camiceMedico(): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => (
    <>
      <V.Capo P={P} colore={TESSUTI.blu_notte} />
      <V.Camice P={P} />
    </>
  )
  Componente.displayName = 'CamiceMedico'
  return Componente
}

function felpa(colore: string): Pezzo {
  const Componente = ({ P }: { P: Proporzioni }) => <V.Felpa P={P} colore={colore} />
  Componente.displayName = 'Felpa'
  return Componente
}

function copricapo(Componente: ComponentType<{ P: Proporzioni; colore: string }>, colore: string): Pezzo {
  const Involucro = ({ P }: { P: Proporzioni }) => <Componente P={P} colore={colore} />
  Involucro.displayName = 'Copricapo'
  return Involucro
}

export const VESTITI: Record<ProfessioneKey, Vestito> = {
  bambino: {
    gambe: TESSUTI.jeans_chiaro,
    manica: 'var(--sole)',
    manicaFino: 0.35,
    Corpo: comodo('var(--sole)'),
    Accessorio: A.Peluche,
  },
  studente: {
    gambe: TESSUTI.denim,
    manica: 'var(--salvia)',
    manicaFino: 0.4,
    Corpo: comodo('var(--salvia)'),
    AccessorioDietro: A.Zaino,
    Accessorio: A.Cartella,
  },
  medico: {
    gambe: TESSUTI.blu_notte,
    manica: TESSUTI.bianco,
    manicaFino: 0.85,
    Corpo: camiceMedico(),
    Accessorio: A.Stetoscopio,
  },
  infermiere: {
    gambe: 'var(--salvia)',
    manica: 'var(--salvia)',
    manicaFino: 0.4,
    Corpo: divisaSanitaria('var(--salvia)'),
    Copricapo: copricapo(V.Cuffia, 'var(--salvia)'),
  },
  insegnante: {
    gambe: TESSUTI.antracite,
    manica: 'var(--corallo)',
    manicaFino: 0.8,
    Corpo: camicia('var(--corallo)'),
    Accessorio: A.Libro,
  },
  impiegato: {
    gambe: TESSUTI.antracite,
    manica: TESSUTI.bianco,
    manicaFino: 0.85,
    Corpo: camicia(TESSUTI.bianco, 'var(--notte)'),
    Accessorio: A.Laptop,
  },
  operaio: {
    gambe: TESSUTI.denim,
    manica: 'var(--corallo)',
    manicaFino: 0.4,
    Corpo: conSalopette('var(--corallo)', TESSUTI.denim),
    Copricapo: copricapo(V.Casco, 'var(--sole)'),
  },
  artigiano: {
    gambe: TESSUTI.denim,
    manica: 'var(--sabbia-scura)',
    manicaFino: 0.45,
    Corpo: conGrembiule('var(--sabbia-scura)', TESSUTI.marrone),
    Accessorio: A.ChiaveInglese,
  },
  agricoltore: {
    gambe: TESSUTI.denim,
    manica: 'var(--salvia)',
    manicaFino: 0.8,
    Corpo: conSalopette('var(--salvia)', TESSUTI.denim),
    Copricapo: V.CappelloPaglia,
    Accessorio: A.Forcone,
  },
  commerciante: {
    gambe: TESSUTI.antracite,
    manica: 'var(--sabbia-scura)',
    manicaFino: 0.5,
    Corpo: conGrembiule('var(--sabbia-scura)', 'var(--salvia)'),
    Accessorio: A.Cassetta,
  },
  ristoratore: {
    gambe: TESSUTI.antracite,
    manica: TESSUTI.bianco,
    manicaFino: 0.85,
    Corpo: V.GiaccaCuoco,
    Copricapo: V.CappelloCuoco,
    Accessorio: A.Padella,
  },
  avvocato: {
    gambe: TESSUTI.antracite,
    manica: '#2A2F3A',
    manicaFino: 0.9,
    Corpo: V.Toga,
    Accessorio: A.Faldone,
  },
  commercialista: {
    gambe: TESSUTI.antracite,
    manica: TESSUTI.blu_notte,
    manicaFino: 0.9,
    Corpo: giaccaSuCamicia(TESSUTI.blu_notte, 'var(--corallo)'),
    Accessorio: A.Calcolatrice,
  },
  tecnico_progettista: {
    gambe: TESSUTI.grigio,
    manica: 'var(--sabbia-chiara)',
    manicaFino: 0.5,
    Corpo: camicia('var(--sabbia-chiara)'),
    Copricapo: copricapo(V.Casco, 'var(--sabbia-chiara)'),
    Accessorio: A.RulloDisegni,
  },
  forze_ordine: {
    gambe: TESSUTI.blu_notte,
    manica: TESSUTI.blu_notte,
    manicaFino: 0.9,
    Corpo: divisaOrdine(TESSUTI.blu_notte),
    Copricapo: copricapo(V.Berretto, TESSUTI.blu_notte),
  },
  autotrasportatore: {
    gambe: TESSUTI.denim,
    manica: TESSUTI.grigio,
    manicaFino: 0.45,
    Corpo: conGilet(TESSUTI.grigio),
    Accessorio: A.Volante,
  },
  benessere: {
    gambe: TESSUTI.antracite,
    manica: '#2A2F3A',
    manicaFino: 0.45,
    Corpo: conGrembiule('#2A2F3A', TESSUTI.bordeaux),
    Accessorio: A.Forbici,
  },
  informatico: {
    gambe: TESSUTI.denim,
    manica: TESSUTI.antracite,
    manicaFino: 0.9,
    Corpo: felpa(TESSUTI.antracite),
    Accessorio: A.Laptop,
  },
  sport: {
    gambe: 'var(--notte)',
    manica: 'var(--notte)',
    manicaFino: 0.35,
    Corpo: capo('var(--notte)', 2),
    Accessorio: A.Fischietto,
  },
  cura_casa: {
    gambe: TESSUTI.jeans_chiaro,
    manica: 'var(--corallo)',
    manicaFino: 0.5,
    Corpo: comodo('var(--corallo)'),
    Accessorio: A.Cesto,
  },
  tempo_libero: {
    gambe: 'var(--sabbia-scura)',
    manica: 'var(--salvia)',
    manicaFino: 0.4,
    Corpo: comodo('var(--salvia)'),
    Copricapo: V.CappelloSole,
  },
  casual: {
    gambe: TESSUTI.denim,
    manica: 'var(--nebbia)',
    manicaFino: 0.5,
    Corpo: comodo('var(--nebbia)'),
  },
}

export function vestito(professione: ProfessioneKey): Vestito {
  return VESTITI[professione] ?? VESTITI.casual
}
