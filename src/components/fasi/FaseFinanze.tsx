'use client'

import { useMemo, useState } from 'react'

import { Avatar } from '@/components/scena/Avatar'
import { Granaio } from '@/components/scena/Granaio'
import { CampoEuro } from '@/components/ui/CampoEuro'
import { livelloScorta } from '@/config/engine'
import { calcolaCrm, euro, percentuale } from '@/lib/engine/crm'
import * as copy from '@/content/copy'
import { RENDITE_KEYS, USCITE_KEYS } from '@/lib/domain'
import type { FamilyMember, RenditaKey, UscitaKey } from '@/lib/domain'
import type { FinancesInput } from '@/lib/db/types'

type Gruppo = 'entrate' | 'uscite' | 'scorta'

interface Props {
  membri: FamilyMember[]
  finanze: FinancesInput
  onCambia: (finanze: FinancesInput) => void
  soloLettura: boolean
}

export function FaseFinanze({ membri, finanze, onCambia, soloLettura }: Props) {
  const [gruppo, setGruppo] = useState<Gruppo>('entrate')
  const risultato = useMemo(() => calcolaCrm(finanze), [finanze])

  function redditoDi(memberId: string): number {
    return finanze.redditi.find((r) => r.member_id === memberId)?.importo ?? 0
  }

  function cambiaReddito(memberId: string, importo: number) {
    const altri = finanze.redditi.filter((r) => r.member_id !== memberId)
    onCambia({ ...finanze, redditi: [...altri, { member_id: memberId, importo }] })
  }

  const passi: { chiave: Gruppo; etichetta: string }[] = [
    { chiave: 'entrate', etichetta: copy.finanze.entrate_titolo },
    { chiave: 'uscite', etichetta: copy.finanze.uscite_titolo },
    { chiave: 'scorta', etichetta: copy.scorta.titolo },
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <nav className="flex shrink-0 flex-wrap justify-center gap-2">
        {passi.map((passo) => (
          <button
            key={passo.chiave}
            type="button"
            onClick={() => setGruppo(passo.chiave)}
            className={`rounded-2xl border-2 px-6 py-2 text-lg font-semibold ${
              gruppo === passo.chiave
                ? 'border-notte bg-sole'
                : 'border-notte/20 bg-sabbia-chiara hover:border-notte/50'
            }`}
          >
            {passo.etichetta}
          </button>
        ))}
      </nav>

      <div key={gruppo} className="anim-entra grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="min-h-0 overflow-y-auto pr-1">
          {gruppo === 'entrate' ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h2 className="text-xl">{copy.finanze.lavoro_titolo}</h2>
                <p className="text-base text-notte/55">{copy.finanze.entrate_sottotitolo}</p>
                {membri.map((membro) => (
                  <CampoEuro
                    key={membro.id}
                    etichetta={membro.nome}
                    aiuto={`${membro.eta} ${copy.cicloVita.anni}`}
                    valore={redditoDi(membro.id)}
                    disabilitato={soloLettura}
                    onCambia={(v) => cambiaReddito(membro.id, v)}
                    accanto={
                      <Avatar
                        nome={membro.nome}
                        eta={membro.eta}
                        professione={membro.professione_key}
                        seed={membro.avatar_seed}
                        className="h-14 w-auto"
                      />
                    }
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-xl">{copy.finanze.rendite_titolo}</h2>
                <p className="text-base text-notte/55">{copy.finanze.rendite_sottotitolo}</p>
                {RENDITE_KEYS.map((chiave: RenditaKey) => (
                  <CampoEuro
                    key={chiave}
                    etichetta={copy.rendite[chiave].label}
                    aiuto={copy.rendite[chiave].aiuto}
                    valore={finanze.rendite[chiave]}
                    disabilitato={soloLettura}
                    onCambia={(v) =>
                      onCambia({ ...finanze, rendite: { ...finanze.rendite, [chiave]: v } })
                    }
                  />
                ))}
              </div>
            </div>
          ) : null}

          {gruppo === 'uscite' ? (
            <div className="flex flex-col gap-3">
              <p className="text-base text-notte/55">{copy.finanze.uscite_sottotitolo}</p>
              {USCITE_KEYS.map((chiave: UscitaKey) => (
                <CampoEuro
                  key={chiave}
                  etichetta={copy.uscite[chiave].label}
                  aiuto={copy.uscite[chiave].aiuto}
                  valore={finanze.uscite[chiave]}
                  disabilitato={soloLettura}
                  onCambia={(v) =>
                    onCambia({ ...finanze, uscite: { ...finanze.uscite, [chiave]: v } })
                  }
                />
              ))}
            </div>
          ) : null}

          {gruppo === 'scorta' ? <RaccontoScorta risultato={risultato} /> : null}
        </section>

        {/* ------------------------------------------- la scorta, sempre in vista */}
        <aside className="flex min-h-0 flex-col items-center justify-center gap-4 rounded-3xl border-2 border-notte/12 bg-sabbia-chiara p-6">
          <Granaio
            crmMensile={risultato.crm_mensile}
            crmPercentuale={risultato.crm_percentuale}
            className="min-h-0 w-auto flex-1"
          />
          <div className="shrink-0 text-center">
            <p className="text-4xl font-semibold tabular-nums">{euro(risultato.crm_mensile)}</p>
            <p className="text-base text-notte/55">{copy.scorta.mensile}</p>
          </div>
          <dl className="flex shrink-0 gap-6 text-center text-base">
            <div>
              <dt className="text-notte/50">{copy.finanze.totale_entrate}</dt>
              <dd className="text-lg font-semibold tabular-nums">{euro(risultato.entrate_totali)}</dd>
            </div>
            <div>
              <dt className="text-notte/50">{copy.finanze.totale_uscite}</dt>
              <dd className="text-lg font-semibold tabular-nums">{euro(risultato.uscite_totali)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}

function RaccontoScorta({ risultato }: { risultato: ReturnType<typeof calcolaCrm> }) {
  const livello = livelloScorta(risultato.crm_percentuale, risultato.crm_mensile)
  const testo = copy.scortaTesti[livello]

  return (
    <div className="flex h-full flex-col justify-center gap-6">
      <div>
        <h2 className="text-3xl">{testo.titolo}</h2>
        <p className="mt-3 max-w-2xl text-xl leading-relaxed text-notte/70">{testo.testo}</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border-2 border-notte/12 bg-sabbia-chiara px-6 py-4">
          <dt className="text-base text-notte/55">{copy.scorta.mensile}</dt>
          <dd className="text-3xl font-semibold tabular-nums">{euro(risultato.crm_mensile)}</dd>
        </div>
        <div className="rounded-2xl border-2 border-notte/12 bg-sabbia-chiara px-6 py-4">
          <dt className="text-base text-notte/55">{copy.scorta.annuale}</dt>
          <dd className="text-3xl font-semibold tabular-nums">{euro(risultato.crm_annuale)}</dd>
        </div>
        <div className="rounded-2xl border-2 border-notte/12 bg-sabbia-chiara px-6 py-4">
          <dt className="text-base text-notte/55">{copy.scorta.percentuale}</dt>
          <dd className="text-3xl font-semibold tabular-nums">
            {percentuale(risultato.crm_percentuale)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
