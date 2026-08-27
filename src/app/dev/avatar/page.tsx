/**
 * Pagina di controllo visivo del motore avatar.
 *
 * Non fa parte del percorso di consulenza: serve a guardare tutti i mestieri
 * uno accanto all'altro e verificare che si riconoscano a colpo d'occhio.
 */

import { notFound } from 'next/navigation'

import { Avatar } from '@/components/scena/Avatar'
import { PROFESSIONI } from '@/lib/domain'
import { PELLI, CAPELLI, TAGLI } from '@/lib/avatar/palette'
import * as copy from '@/content/copy'

export const metadata = { title: 'Motore avatar' }

const ETA_CAMPIONE = [7, 16, 38, 72] as const

export default async function PaginaAvatar({
  searchParams,
}: {
  searchParams: Promise<{ grande?: string; solo?: string }>
}) {
  // ?grande=1 ingrandisce le figure: serve a controllare i dettagli di un
  // mestiere senza doverci mettere la faccia sopra allo schermo.
  // pagina di servizio: non esiste in produzione
  if (process.env.NODE_ENV === 'production') notFound()

  const parametri = await searchParams
  const grande = parametri.grande === '1'
  // ?solo=medico,operaio limita l'elenco: serve a guardare da vicino pochi
  // mestieri alla volta senza scorrere tutta la pagina.
  const filtro = (parametri.solo ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
  const elenco = filtro.length > 0 ? PROFESSIONI.filter((p) => filtro.includes(p)) : PROFESSIONI
  const misura = grande ? 'h-72' : 'h-40'
  const colonne = grande ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-6'

  return (
    <main className="mx-auto w-full max-w-[1400px] px-8 py-10">
      <h1 className="text-4xl">Motore avatar</h1>
      <p className="mt-2 text-lg text-notte/60">
        {PROFESSIONI.length} figure, {PELLI.length} incarnati, {CAPELLI.length} colori di capelli,{' '}
        {TAGLI.length} tagli. Un solo viewBox condiviso.
      </p>
      <a
        href={grande ? '/dev/avatar' : '/dev/avatar?grande=1'}
        className="mt-4 inline-block text-base font-semibold underline underline-offset-4"
      >
        {grande ? 'Vedi tutte in piccolo' : 'Ingrandisci le figure'}
      </a>

      <h2 className="mt-12 text-2xl">Le professioni</h2>
      <ul className={`mt-6 grid grid-cols-2 gap-6 ${colonne}`}>
        {elenco.map((professione, indice) => (
          <li
            key={professione}
            className="flex flex-col items-center rounded-3xl border-2 border-notte/12 bg-sabbia-chiara p-4"
          >
            <Avatar
              nome={professione}
              eta={professione === 'bambino' ? 6 : professione === 'tempo_libero' ? 72 : 38}
              professione={professione}
              seed={{ pelle: indice % PELLI.length, capelli: indice % CAPELLI.length, taglio: indice % TAGLI.length }}
              className={`${misura} w-auto`}
            />
            <span className="mt-2 text-center text-base font-semibold">
              {copy.professioni[professione]}
            </span>
            <span className="text-sm text-notte/45">{professione}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-2xl">Le quattro fasce d’eta’</h2>
      <ul className="mt-6 flex flex-wrap gap-8">
        {ETA_CAMPIONE.map((eta) => (
          <li key={eta} className="flex flex-col items-center">
            <Avatar nome={`eta-${eta}`} eta={eta} professione="casual" className="h-48 w-auto" />
            <span className="mt-2 text-base font-semibold">{eta} anni</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-14 text-2xl">Incarnati, capelli e tagli</h2>
      <ul className="mt-6 flex flex-wrap gap-6">
        {PELLI.map((_, i) => (
          <li key={i} className="flex flex-col items-center">
            <Avatar
              nome={`variante-${i}`}
              eta={34}
              professione="impiegato"
              seed={{ pelle: i, capelli: i, taglio: i }}
              className="h-40 w-auto"
            />
            <span className="mt-1 text-sm text-notte/50">{TAGLI[i]}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
