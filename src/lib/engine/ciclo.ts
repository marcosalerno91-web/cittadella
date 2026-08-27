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

  if (e <= fine_studio) {
    // salita morbida: da 0 a 1 con un ease-in-out
    const t = e / fine_studio
    return t * t * (3 - 2 * t)
  }
  if (e <= fine_lavoro) {
    // plateau con una gobba appena accennata a meta' carriera
    const t = (e - fine_studio) / (fine_lavoro - fine_studio)
    return 1 - 0.08 * Math.cos(t * Math.PI * 2 - Math.PI) - 0.08
  }
  // discesa dolce, senza mai toccare lo zero: il tempo libero non e' il nulla
  const t = (e - fine_lavoro) / (eta_massima - fine_lavoro)
  return 0.92 * (1 - t * t * (3 - 2 * t)) * 0.6 + 0.18
}

/** Frazione 0..1 sull'asse orizzontale. */
export function ascissa(eta: number): number {
  const { eta_minima, eta_massima } = CICLO_VITA
  const e = Math.min(Math.max(eta, eta_minima), eta_massima)
  return (e - eta_minima) / (eta_massima - eta_minima)
}

export { faseVita }
