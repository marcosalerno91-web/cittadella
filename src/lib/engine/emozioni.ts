/**
 * Lo spostamento fra come il cliente si sente oggi e come vorrebbe sentirsi.
 *
 * E' la riga da cui partono i prospetti, e vive solo nel dossier del
 * consulente: il metadato di direzione non si vede mai a schermo ne' nelle
 * pagine per la famiglia.
 */

import { direzioni, emozioneDi } from '@/content/copy'
import type { Emozione } from '@/content/copy'

export interface Spostamento {
  oggi: Emozione[]
  desiderate: Emozione[]
  /** quante fra quelle di oggi allontanano o lasciano fermi */
  quanteVia: number
  /** quante fra quelle di oggi avvicinano */
  quanteVerso: number
  /** la frase da stampare, gia' composta */
  frase: string
}

export function leggiSpostamento(
  scelteOggi: string[],
  scelteDesiderate: string[],
): Spostamento {
  const oggi = scelteOggi
    .map((k) => emozioneDi('oggi', k))
    .filter((e): e is Emozione => Boolean(e))
  const desiderate = scelteDesiderate
    .map((k) => emozioneDi('desiderato', k))
    .filter((e): e is Emozione => Boolean(e))

  const quanteVia = oggi.filter((e) => e.direzione !== 'avvicina').length
  const quanteVerso = oggi.filter((e) => e.direzione === 'avvicina').length

  return { oggi, desiderate, quanteVia, quanteVerso, frase: componi(oggi, desiderate, quanteVia) }
}

function componi(oggi: Emozione[], desiderate: Emozione[], quanteVia: number): string {
  if (oggi.length === 0 || desiderate.length === 0) return ''

  const partenza =
    quanteVia === 0
      ? `da ${plurale(oggi.length, 'un’emozione che avvicina', 'emozioni che avvicinano')}`
      : quanteVia === oggi.length
        ? `da ${plurale(quanteVia, 'un’emozione che allontana', 'emozioni che allontanano')}`
        : `da ${quanteVia} che ${quanteVia === 1 ? 'allontana' : 'allontanano'} e ${oggi.length - quanteVia} che ${oggi.length - quanteVia === 1 ? 'avvicina' : 'avvicinano'}`

  return `${partenza} verso ${plurale(desiderate.length, 'un’emozione che avvicina', 'emozioni che avvicinano')}.`
}

function plurale(n: number, uno: string, molti: string): string {
  return n === 1 ? uno : `${n} ${molti}`
}

/** "Apprensione, Rimpianto (allontanano) · Fiducia (avvicina)" */
export function elencaConDirezione(emozioni: Emozione[]): string {
  const gruppi = new Map<Emozione['direzione'], string[]>()
  for (const e of emozioni) {
    gruppi.set(e.direzione, [...(gruppi.get(e.direzione) ?? []), e.etichetta])
  }
  return [...gruppi.entries()]
    .map(([direzione, etichette]) => {
      const verbo =
        etichette.length === 1 ? direzioni[direzione] : `${direzioni[direzione].replace(/a$/, 'ano')}`
      return `${etichette.join(', ')} (${verbo})`
    })
    .join(' · ')
}
