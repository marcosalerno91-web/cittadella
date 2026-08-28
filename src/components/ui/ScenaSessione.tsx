import type { ReactNode } from 'react'

/**
 * Cornice delle fasi di consulenza.
 *
 * Sta tutta in un'altezza di schermo: si lavora in due, seduti, e non si scorre
 * mentre si parla. Solo il contenuto della fase puo' scorrere, se proprio serve.
 */
export function ScenaSessione({
  barra,
  titolo,
  sottotitolo,
  children,
}: {
  barra: ReactNode
  titolo: string
  sottotitolo?: string
  children: ReactNode
}) {
  return (
    <main className="flex h-dvh flex-col overflow-hidden px-6 sm:px-10">
      {barra}
      <header className="anim-entra shrink-0 pb-3 text-center">
        <h1 className="text-[clamp(1.5rem,3vw,2.3rem)]">{titolo}</h1>
        {sottotitolo ? (
          <p className="mx-auto mt-0.5 max-w-3xl text-base text-notte/60">{sottotitolo}</p>
        ) : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col pb-5">{children}</div>
    </main>
  )
}
