'use client'

import { MAX_EMOZIONI } from '@/config/engine'
import { emozioniDi } from '@/content/copy'
import type { InsiemeEmozioni } from '@/content/copy'

interface Props {
  /** i due momenti pescano da due insiemi diversi */
  insieme: InsiemeEmozioni
  scelte: string[]
  /** riceve la trasformazione da applicare, non il risultato gia' calcolato */
  onCambia: (aggiorna: (precedenti: string[]) => string[]) => void
  disabilitato?: boolean
}

/**
 * Le emozioni si scelgono da una griglia di carte.
 *
 * Le carte sono tutte identiche: nessuna icona, nessuna faccina, e soprattutto
 * nessun colore per direzione. Se il cliente vedesse che "paura" e' rossa e
 * "sicurezza" verde risponderebbe a un test invece di dire come sta.
 *
 * La griglia regge da otto a sedici carte senza cambiare impaginazione: gli
 * elenchi in copy.ts cambieranno.
 */
export function CardEmozioni({ insieme, scelte, onCambia, disabilitato = false }: Props) {
  const carte = emozioniDi(insieme)

  /**
   * Solo le chiavi che esistono ancora contano verso il limite di tre.
   * Gli elenchi in copy.ts cambieranno: una sessione salvata con parole vecchie
   * deve tornare scegliibile, non trovarsi la griglia bloccata su niente.
   */
  const valide = scelte.filter((k) => carte.some((c) => c.chiave === k))

  function alterna(chiave: string) {
    if (disabilitato) return
    onCambia((precedenti) => {
      const vive = precedenti.filter((k) => carte.some((c) => c.chiave === k))
      if (vive.includes(chiave)) return vive.filter((k) => k !== chiave)
      if (vive.length >= MAX_EMOZIONI) return vive
      return [...vive, chiave]
    })
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
      {carte.map((carta) => {
        const scelta = valide.includes(carta.chiave)
        // alla terza le altre si attenuano, senza messaggi di errore
        const piena = !scelta && valide.length >= MAX_EMOZIONI
        return (
          <li key={carta.chiave}>
            <button
              type="button"
              disabled={disabilitato || piena}
              aria-pressed={scelta}
              onClick={() => alterna(carta.chiave)}
              className={`flex h-full w-full items-center justify-center rounded-2xl border-2 px-2 py-4 text-center text-lg font-semibold leading-tight transition-colors duration-200 ${
                scelta
                  ? 'border-notte bg-sole'
                  : `border-notte/20 bg-sabbia ${piena ? 'opacity-35' : 'hover:border-notte/60'}`
              }`}
            >
              {carta.etichetta}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
