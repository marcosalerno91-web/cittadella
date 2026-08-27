import type { ReactNode } from 'react'

/**
 * Cornice di ogni schermata: fondo sabbia, una sola cosa al centro,
 * tipografia grande. Non contiene mai piu' di una domanda.
 */
export function Scena({
  titolo,
  sottotitolo,
  children,
  azioni,
  ampiezza = 'media',
}: {
  titolo?: string
  sottotitolo?: string
  children: ReactNode
  azioni?: ReactNode
  ampiezza?: 'stretta' | 'media' | 'piena'
}) {
  const larghezza =
    ampiezza === 'stretta' ? 'max-w-2xl' : ampiezza === 'piena' ? 'max-w-[1400px]' : 'max-w-5xl'

  return (
    <main className="flex min-h-dvh flex-col items-center px-6 py-8 sm:px-10">
      <div className={`flex w-full flex-1 flex-col ${larghezza}`}>
        {titolo ? (
          <header className="anim-entra mb-8 text-center">
            <h1 className="text-[clamp(2rem,4.2vw,3rem)]">{titolo}</h1>
            {sottotitolo ? (
              <p className="mx-auto mt-3 max-w-3xl text-xl text-notte/65">{sottotitolo}</p>
            ) : null}
          </header>
        ) : null}
        <div className="flex flex-1 flex-col">{children}</div>
        {azioni ? (
          <footer className="mt-10 flex flex-wrap items-center justify-between gap-4">{azioni}</footer>
        ) : null}
      </div>
    </main>
  )
}
