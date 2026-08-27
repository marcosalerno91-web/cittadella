/**
 * Posizione sulla curva del ciclo di vita.
 *
 * La curva di Modigliani qui e' un'illustrazione, non un modello: sale durante
 * lo studio, tiene il plateau negli anni di lavoro, scende nel tempo libero.
 * Serve solo a dare a ciascun avatar un punto dove posarsi.
 */

import { CICLO_VITA, faseVita } from '@/config/engine'

/** Capacita' di produrre reddito, 0..1, per una data eta'. */
export function capacita(eta: number): number {
  const { fine_studio, fine_lavoro, eta_massima } = CICLO_VITA
  const e = Math.min(Math.max(eta, 0), eta_massima)

  // le tre tratte si toccano: a fine studio e a fine lavoro il valore e' PLATEAU
  // in entrambe le formule, cosi' la curva non ha gradini
  if (e <= fine_studio) {
    return PLATEAU * morbida(e / fine_studio)
  }
  if (e <= fine_lavoro) {
    // gobba appena accennata a meta' carriera
    const t = (e - fine_studio) / (fine_lavoro - fine_studio)
    return PLATEAU + (1 - PLATEAU) * Math.sin(t * Math.PI)
  }
  // discesa dolce che non tocca mai lo zero: il tempo libero non e' il nulla
  const t = (e - fine_lavoro) / (eta_massima - fine_lavoro)
  return CODA + (PLATEAU - CODA) * (1 - morbida(t))
}

/** Quota raggiunta a fine studio e ritrovata a fine lavoro. */
const PLATEAU = 0.92
/** Quota a novant'anni. */
const CODA = 0.2

/** Ease-in-out: niente spigoli. */
function morbida(t: number): number {
  const x = Math.min(Math.max(t, 0), 1)
  return x * x * (3 - 2 * x)
}

/** Frazione 0..1 sull'asse orizzontale. */
export function ascissa(eta: number): number {
  const { eta_minima, eta_massima } = CICLO_VITA
  const e = Math.min(Math.max(eta, eta_minima), eta_massima)
  return (e - eta_minima) / (eta_massima - eta_minima)
}

export { faseVita }
