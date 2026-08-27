'use client'

import Link from 'next/link'

import * as copy from '@/content/copy'

/** Non finisce sulla carta: e' la barra che sta a video sopra i fogli. */
export function BarraStampa({ sessionId, titolo }: { sessionId: string; titolo: string }) {
  return (
    <div className="solo-schermo mx-auto flex w-full max-w-[182mm] flex-wrap items-center justify-between gap-4 px-2 py-5">
      <div>
        <h1 className="text-2xl">{titolo}</h1>
        <Link
          href={`/sessione/${sessionId}`}
          className="text-base text-notte/60 underline underline-offset-4"
        >
          ← {copy.output.torna}
        </Link>
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-2xl border-2 border-notte bg-sole px-7 py-3 text-lg font-semibold"
      >
        {copy.output.stampa}
      </button>
    </div>
  )
}
