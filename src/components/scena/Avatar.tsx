/**
 * L'avatar montato: cinque strati, un solo viewBox.
 *
 * Emette SVG inline. Nessun file esterno, nessuno sprite: si compone in scena,
 * scala senza ricalcoli e finisce nei PDF cosi' com'e'.
 */

import { Braccia, Collo, Gambe, TestaCompleta } from '@/lib/avatar/corpo'
import { colorePelle, proporzioni, seedDaNome } from '@/lib/avatar/palette'
import { vestito } from '@/lib/avatar/professioni'
import { VIEWBOX_ATTR } from '@/lib/avatar/tipi'
import type { Espressione } from '@/lib/avatar/tipi'
import type { AvatarSeed, ProfessioneKey } from '@/lib/domain'

export interface PropsAvatar {
  nome: string
  eta: number
  professione: ProfessioneKey
  seed?: AvatarSeed
  espressione?: Espressione
  className?: string
  /** true quando l'avatar respira piano in scena */
  vivo?: boolean
}

export function Avatar({
  nome,
  eta,
  professione,
  seed,
  className = '',
  vivo = false,
}: PropsAvatar) {
  return (
    <svg
      viewBox={VIEWBOX_ATTR}
      className={`${className} ${vivo ? 'anim-respiro' : ''}`}
      role="img"
      aria-label={nome ? `${nome}, ${eta} anni` : 'Persona'}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
    >
      <ContenutoAvatar nome={nome} eta={eta} professione={professione} seed={seed} />
    </svg>
  )
}

/**
 * Lo stesso avatar senza il tag <svg>: serve quando piu' avatar vivono dentro
 * un'unica scena SVG (ritratto di gruppo, curva del ciclo di vita, PDF).
 */
export function ContenutoAvatar({
  nome,
  eta,
  professione,
  seed,
}: Omit<PropsAvatar, 'className' | 'vivo'>) {
  const P = proporzioni(eta)
  const semi = seed ?? seedDaNome(nome, eta)
  const pelle = colorePelle(semi)
  const abito = vestito(professione)

  const { Corpo, Copricapo, Accessorio, AccessorioDietro } = abito

  return (
    <g>
      <Gambe P={P} colore={abito.gambe} />
      <Collo P={P} pelle={pelle} />
      {AccessorioDietro ? <AccessorioDietro P={P} /> : null}
      <Corpo P={P} />
      {/* le braccia si posano sopra al capo: la loro cima sale oltre la linea
          delle spalle, cosi' il giunto si chiude e la figura resta un corpo solo */}
      <Braccia P={P} colore={abito.manica} pelle={pelle} manicaFino={abito.manicaFino} />
      <TestaCompleta P={P} seed={semi} />
      {Copricapo ? <Copricapo P={P} /> : null}
      {Accessorio ? <Accessorio P={P} /> : null}
    </g>
  )
}
