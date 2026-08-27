'use client'

import type { Dispatch, SetStateAction } from 'react'

import { Fortezza } from '@/components/scena/Fortezza'
import { AreaTesto } from '@/components/ui/Campo'
import { CardEmozioni } from '@/components/ui/CardEmozioni'
import * as copy from '@/content/copy'
import type { FamilyMember, FortressItem } from '@/lib/domain'
import type { EmotionsInput } from '@/lib/db/types'

interface Props {
  membri: FamilyMember[]
  voci: FortressItem[]
  emozioni: EmotionsInput
  /**
   * Accetta anche la forma funzionale: due tocchi ravvicinati sulle sagome
   * devono sommarsi, non sovrascriversi.
   */
  onCambia: Dispatch<SetStateAction<EmotionsInput>>
  soloLettura: boolean
}

/** 5a — La tua situazione oggi. Qui parla il cliente: l'app non commenta. */
export function FaseSituazioneOggi({ membri, voci, emozioni, onCambia, soloLettura }: Props) {
  return (
    <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,30rem)]">
      <section className="flex min-h-0 items-center justify-center overflow-hidden rounded-3xl border-2 border-notte/12 bg-sabbia-chiara p-4">
        <Fortezza membri={membri} voci={voci} className="min-h-0 w-full flex-1" />
      </section>

      <section className="flex min-h-0 flex-col gap-5 overflow-y-auto pr-1">
        <div>
          <h2 className="text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight">
            {copy.situazioneOggi.domanda}
          </h2>
          <p className="mt-2 text-base text-notte/55">{copy.situazioneOggi.aiuto}</p>
        </div>

        <AreaTesto
          value={emozioni.sentire_attuale}
          disabled={soloLettura}
          placeholder={copy.situazioneOggi.risposta_placeholder}
          onChange={(e) => {
            const testo = e.target.value
            onCambia((p) => ({ ...p, sentire_attuale: testo }))
          }}
          className="min-h-[9rem] text-lg"
        />

        <div>
          <h3 className="text-xl">{copy.situazioneOggi.emozioni_titolo}</h3>
          <p className="mb-3 text-base text-notte/55">{copy.situazioneOggi.emozioni_aiuto}</p>
          <CardEmozioni
            scelte={emozioni.emozioni_scelte}
            disabilitato={soloLettura}
            onCambia={(aggiorna) =>
            onCambia((p) => ({ ...p, emozioni_scelte: aggiorna(p.emozioni_scelte) }))
          }
          />
        </div>
      </section>
    </div>
  )
}

/** 5b — La cittadella completa: un metro, non un obiettivo. */
export function FaseCittadellaCompleta({
  membri,
  voci,
}: {
  membri: FamilyMember[]
  voci: FortressItem[]
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-5">
      <div className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-3xl border-2 border-notte/12 bg-sabbia-chiara p-4">
        <Fortezza membri={membri} voci={voci} tuttoPieno className="min-h-0 w-full flex-1" />
      </div>
      <div className="max-w-4xl shrink-0 text-center">
        <p className="text-xl leading-relaxed text-notte/75">{copy.cittadellaCompleta.testo}</p>
        <p className="mt-2 text-lg text-notte/50">{copy.cittadellaCompleta.nota}</p>
      </div>
    </div>
  )
}

/** 5c — La domanda che conta, e le sagome da toccare. */
export function FaseDesiderato({ membri, voci, emozioni, onCambia, soloLettura }: Props) {
  function alternaPriorita(voceKey: string) {
    if (soloLettura) return
    onCambia((precedente) => {
      const dentro = precedente.priorita_dichiarate.includes(voceKey)
      return {
        ...precedente,
        priorita_dichiarate: dentro
          ? precedente.priorita_dichiarate.filter((k) => k !== voceKey)
          : [...precedente.priorita_dichiarate, voceKey],
      }
    })
  }

  return (
    <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,30rem)]">
      <section className="flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-notte/12 bg-sabbia-chiara p-4">
        <Fortezza
          membri={membri}
          voci={voci}
          prioritarie={emozioni.priorita_dichiarate}
          onTocca={alternaPriorita}
          className="min-h-0 w-full flex-1"
        />
        <p className="shrink-0 pt-2 text-center text-base text-notte/55">
          {copy.desiderato.priorita_aiuto}
        </p>
      </section>

      <section className="flex min-h-0 flex-col gap-5 overflow-y-auto pr-1">
        <div>
          <h2 className="text-[clamp(1.7rem,2.8vw,2.4rem)] leading-tight">
            {copy.desiderato.domanda}
          </h2>
          <p className="mt-2 text-base text-notte/55">{copy.desiderato.aiuto}</p>
        </div>

        <AreaTesto
          value={emozioni.sentire_desiderato}
          disabled={soloLettura}
          placeholder={copy.desiderato.risposta_placeholder}
          onChange={(e) => {
            const testo = e.target.value
            onCambia((p) => ({ ...p, sentire_desiderato: testo }))
          }}
          className="min-h-[9rem] text-lg"
        />

        <div>
          <h3 className="text-xl">{copy.desiderato.emozioni_titolo}</h3>
          <p className="mb-3 text-base text-notte/55">{copy.desiderato.emozioni_aiuto}</p>
          <CardEmozioni
            scelte={emozioni.emozioni_desiderate}
            disabilitato={soloLettura}
            onCambia={(aggiorna) =>
            onCambia((p) => ({ ...p, emozioni_desiderate: aggiorna(p.emozioni_desiderate) }))
          }
          />
        </div>

        <div>
          <h3 className="text-xl">{copy.desiderato.priorita_titolo}</h3>
          <p className="text-base text-notte/55">
            {copy.desiderato.priorita_scelte.replace(
              '{n}',
              String(emozioni.priorita_dichiarate.length),
            )}
          </p>
          {emozioni.priorita_dichiarate.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {emozioni.priorita_dichiarate.map((key) => (
                <li
                  key={key}
                  className="rounded-2xl border-2 border-sole bg-sole/25 px-4 py-1.5 text-base font-semibold"
                >
                  {copy.vociFortezza[key]?.nome ?? key}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  )
}
