/**
 * Pagina di controllo visivo del motore avatar.
 *
 * Non fa parte del percorso di consulenza: serve a guardare tutte le figure
 * una accanto all'altra e verificare che si riconoscano a colpo d'occhio.
 */

import { notFound } from 'next/navigation'

import { Avatar } from '@/components/scena/Avatar'

import { FIGURE, INCARNATI, LUNGHEZZE, PROFESSIONI } from '@/lib/domain'
import type { AvatarSeed } from '@/lib/domain'
import * as copy from '@/content/copy'

export const metadata = { title: 'Motore avatar' }

/** Un campione per fascia: bambino, ragazzo, adulto, senior. */
const FASCE: { eta: number; nome: string }[] = [
  { eta: 7, nome: 'bambino' },
  { eta: 16, nome: 'ragazzo' },
  { eta: 38, nome: 'adulto' },
  { eta: 72, nome: 'senior' },
]

export default async function PaginaAvatar({
  searchParams,
}: {
  searchParams: Promise<{ grande?: string; solo?: string }>
}) {
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
        Due figure per {FASCE.length} fasce d’eta’, {LUNGHEZZE.length} lunghezze di capelli:{' '}
        {FIGURE.length * LUNGHEZZE.length} combinazioni per fascia, per ciascuno dei{' '}
        {INCARNATI.length} incarnati. Il colore dei capelli segue l’incarnato e non ha comando.
      </p>
      <a
        href={grande ? '/dev/avatar' : '/dev/avatar?grande=1'}
        className="mt-4 inline-block text-base font-semibold underline underline-offset-4"
      >
        {grande ? 'Vedi tutte in piccolo' : 'Ingrandisci le figure'}
      </a>

      {/* ------------------------------------------ le sei combinazioni */}
      <h2 className="mt-12 text-2xl">Le sei combinazioni, fascia per fascia</h2>
      <p className="mt-1 text-base text-notte/55">
        Sono tutte le scelte estetiche che il consulente puo’ fare. Non ce ne sono altre.
      </p>

      {FASCE.map((fascia) => (
        <section key={fascia.nome} className="mt-8">
          <h3 className="text-xl">
            {fascia.nome} <span className="text-notte/50">· {fascia.eta} anni</span>
          </h3>
          <ul className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-6">
            {FIGURE.flatMap((figura) =>
              LUNGHEZZE.map((capelli) => {
                const seed: AvatarSeed = { figura, capelli, incarnato: 'olivastro' }
                return (
                  <li
                    key={`${figura}-${capelli}`}
                    className="flex flex-col items-center rounded-3xl border-2 border-notte/12 bg-sabbia-chiara p-3"
                  >
                    <Avatar
                      nome={`${figura}-${capelli}`}
                      eta={fascia.eta}
                      professione="casual"
                      seed={seed}
                      className={`${grande ? 'h-56' : 'h-36'} w-auto`}
                    />
                    <span className="mt-2 text-center text-sm font-semibold leading-tight">
                      {copy.figure[figura]}
                    </span>
                    <span className="text-center text-sm text-notte/50">
                      {copy.lunghezze[capelli]}
                    </span>
                  </li>
                )
              }),
            )}
          </ul>
        </section>
      ))}

      {/* ------------------------------------------ i mestieri */}
      <h2 className="mt-14 text-2xl">Le professioni</h2>
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
              seed={{
                figura: indice % 2 === 0 ? 'femminile' : 'maschile',
                capelli: LUNGHEZZE[indice % LUNGHEZZE.length] ?? 'corti',
                incarnato: INCARNATI[indice % INCARNATI.length] ?? 'chiaro',
              }}
              className={`${misura} w-auto`}
            />
            <span className="mt-2 text-center text-base font-semibold">
              {copy.professioni[professione]}
            </span>
            <span className="text-sm text-notte/45">{professione}</span>
          </li>
        ))}
      </ul>

      {/* ------------------------------------------ gli incarnati */}
      <h2 className="mt-14 text-2xl">I quattro incarnati</h2>
      <p className="mt-1 text-base text-notte/55">
        Si scelgono con un tocco. Il colore dei capelli li segue, e sopra l’eta’ del
        tempo libero diventa grigio.
      </p>
      <ul className="mt-4 flex flex-wrap gap-6">
        {INCARNATI.flatMap((incarnato) =>
          [34, 72].map((eta) => (
            <li key={`${incarnato}-${eta}`} className="flex flex-col items-center">
              <Avatar
                nome={incarnato}
                eta={eta}
                professione="impiegato"
                seed={{ figura: 'femminile', capelli: 'raccolti', incarnato }}
                className="h-40 w-auto"
              />
              <span className="mt-1 text-sm font-semibold">{copy.incarnati[incarnato]}</span>
              <span className="text-sm text-notte/50">{eta} anni</span>
            </li>
          )),
        )}
      </ul>
    </main>
  )
}
