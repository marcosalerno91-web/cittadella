'use client'

import Link from 'next/link'

import { RitrattoDiGruppo } from '@/components/scena/RitrattoDiGruppo'
import { Bottone } from '@/components/ui/Bottone'
import * as copy from '@/content/copy'
import type { FamilyMember } from '@/lib/domain'

interface Props {
  membri: FamilyMember[]
  sessionId: string
  conclusa: boolean
  onConcludi: () => void
  onRiapri: () => void
}

export function FaseChiusura({ membri, sessionId, conclusa, onConcludi, onRiapri }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 text-center">
      <RitrattoDiGruppo membri={membri} className="max-h-[26vh] min-h-0 w-full" conNomi={false} />

      <div className="max-w-3xl">
        <h2 className="text-[clamp(1.8rem,3vw,2.6rem)]">
          {conclusa ? copy.chiusura.conclusa_titolo : copy.chiusura.titolo}
        </h2>
        <p className="mt-4 text-xl leading-relaxed text-notte/75">{copy.chiusura.testo}</p>
        <p className="mt-3 text-lg text-notte/50">{copy.chiusura.nota}</p>
      </div>

      {conclusa ? (
        <div className="flex flex-col items-center gap-5">
          <p className="text-lg text-notte/60">{copy.chiusura.conclusa_testo}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/report/${sessionId}/consulente`}
              className="rounded-2xl border-2 border-notte bg-sole px-7 py-3 text-lg font-semibold"
            >
              {copy.output.pdf_consulente}
            </Link>
            <Link
              href={`/report/${sessionId}/cliente`}
              className="rounded-2xl border-2 border-notte bg-sabbia-chiara px-7 py-3 text-lg font-semibold"
            >
              {copy.output.pdf_cliente}
            </Link>
            <a
              href={`/api/sessione/${sessionId}/export`}
              className="rounded-2xl border-2 border-notte/25 bg-sabbia-chiara px-7 py-3 text-lg font-semibold"
            >
              {copy.output.json}
            </a>
          </div>
          <Bottone variante="fantasma" onClick={onRiapri}>
            {copy.chiusura.riapri}
          </Bottone>
        </div>
      ) : (
        <Bottone onClick={onConcludi}>{copy.chiusura.concludi}</Bottone>
      )}
    </div>
  )
}
