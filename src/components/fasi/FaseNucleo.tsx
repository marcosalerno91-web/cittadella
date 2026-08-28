'use client'

import { useState } from 'react'

import { Avatar } from '@/components/scena/Avatar'
import { RitrattoDiGruppo } from '@/components/scena/RitrattoDiGruppo'
import { Bottone } from '@/components/ui/Bottone'
import { Campo } from '@/components/ui/Campo'
import { SceltaAspetto } from '@/components/ui/SceltaAspetto'
import { SelettoreProfessione } from '@/components/ui/SelettoreProfessione'
import { StepperEta } from '@/components/ui/StepperEta'
import { professioneSuggerita, seedDaNome } from '@/lib/avatar/palette'
import * as copy from '@/content/copy'
import { RUOLI_FAMIGLIA } from '@/lib/domain'
import type { FamilyMember, RuoloFamiglia } from '@/lib/domain'

interface Props {
  membri: FamilyMember[]
  onCambia: (membri: FamilyMember[]) => void
  soloLettura: boolean
}

/**
 * Chi ha scelto la figura a mano non se la vede piu' cambiare digitando il nome.
 * Vive fuori dallo stato React perche' e' una preferenza dell'incontro, non un
 * dato della sessione: non va salvata e non va ricostruita alla ripresa.
 */
const figuraToccata = new Set<string>()

export function FaseNucleo({ membri, onCambia, soloLettura }: Props) {
  // indice del membro aperto in modifica: e' lui che si veste in tempo reale
  const [aperto, setAperto] = useState<number>(membri.length > 0 ? 0 : -1)

  function aggiorna(indice: number, patch: Partial<FamilyMember>) {
    onCambia(
      membri.map((m, i) => {
        if (i !== indice) return m
        const unito = { ...m, ...patch }
        // sopra l'eta' del tempo libero i capelli diventano grigi
        if (patch.eta !== undefined) {
          const dalNome = seedDaNome(unito.nome, unito.eta)
          unito.avatar_seed = { ...unito.avatar_seed, tinta: dalNome.tinta }
        }
        // eta' cambiata: se il mestiere non e' stato scelto a mano, si adegua
        if (patch.eta !== undefined && !m.professione_libera) {
          const suggerita = professioneSuggerita(unito.eta)
          if (suggerita && meritaSuggerimento(m.professione_key, m.eta)) {
            unito.professione_key = suggerita
          }
        }
        return unito
      }),
    )
  }

  function aggiungi() {
    const eta = membri.length === 0 ? 40 : 8
    const nuovo: FamilyMember = {
      id: `nuovo-${Date.now()}-${membri.length}`,
      session_id: '',
      nome: '',
      eta,
      // si parte dal suggerimento dell'eta': cosi' cambiando eta' la figura segue
      professione_key: professioneSuggerita(eta) ?? 'impiegato',
      professione_libera: null,
      ruolo_famiglia: membri.length === 0 ? 'intestatario' : 'figlio',
      avatar_seed: seedDaNome('', eta),
      ordine: membri.length,
    }
    onCambia([...membri, nuovo])
    setAperto(membri.length)
  }

  function rimuovi(indice: number) {
    onCambia(membri.filter((_, i) => i !== indice).map((m, i) => ({ ...m, ordine: i })))
    setAperto((v) => (v >= indice ? Math.max(v - 1, membri.length > 1 ? 0 : -1) : v))
  }

  function sposta(indice: number, direzione: -1 | 1) {
    const destinazione = indice + direzione
    if (destinazione < 0 || destinazione >= membri.length) return
    const copia = [...membri]
    const a = copia[indice]
    const b = copia[destinazione]
    if (!a || !b) return
    copia[indice] = b
    copia[destinazione] = a
    onCambia(copia.map((m, i) => ({ ...m, ordine: i })))
    setAperto(destinazione)
  }

  const inModifica = aperto >= 0 ? membri[aperto] : undefined

  return (
    <div className="grid min-h-0 flex-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      {/* ------------------------------------------------ scena, a sinistra */}
      <section className="flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-notte/12 bg-sabbia-chiara px-6 py-6">
        {membri.length === 0 ? (
          <p className="max-w-sm text-center text-xl text-notte/55">{copy.nucleo.vuoto}</p>
        ) : inModifica ? (
          // durante la digitazione si guarda la persona che si sta creando
          <>
            <Avatar
              key={`${inModifica.id}-${inModifica.professione_key}-${inModifica.eta}`}
              nome={inModifica.nome}
              eta={inModifica.eta}
              professione={inModifica.professione_key}
              seed={inModifica.avatar_seed}
              className="anim-posa min-h-0 w-auto flex-1"
              vivo
            />
            <p className="mt-4 shrink-0 text-center text-3xl font-semibold">
              {inModifica.nome || copy.nucleo.nome_placeholder}
            </p>
            <p className="shrink-0 text-lg text-notte/55">
              {inModifica.eta} {copy.cicloVita.anni}
            </p>
          </>
        ) : (
          <RitrattoDiGruppo membri={membri} className="max-h-full min-h-0 w-full flex-1" animato />
        )}

        {membri.length > 1 && inModifica ? (
          <div className="mt-4 w-full shrink-0 border-t-2 border-notte/10 pt-4">
            <RitrattoDiGruppo
              membri={membri}
              className="mx-auto max-h-[15vh] w-full"
              conNomi={false}
            />
          </div>
        ) : null}
      </section>

      {/* ------------------------------------------- pannello, a destra */}
      <section className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
        <ul className="flex flex-wrap gap-2">
          {membri.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setAperto(i)}
                className={`rounded-2xl border-2 px-4 py-2 text-base font-semibold ${
                  i === aperto
                    ? 'border-notte bg-sole'
                    : 'border-notte/20 bg-sabbia-chiara hover:border-notte/50'
                }`}
              >
                {m.nome || '…'}
              </button>
            </li>
          ))}
          {!soloLettura ? (
            <li>
              <button
                type="button"
                onClick={aggiungi}
                className="rounded-2xl border-2 border-dashed border-notte/35 px-4 py-2 text-base font-semibold hover:border-notte"
              >
                ＋ {copy.nucleo.aggiungi}
              </button>
            </li>
          ) : null}
        </ul>

        {inModifica && aperto >= 0 ? (
          <div className="flex flex-col gap-5 rounded-3xl border-2 border-notte/15 bg-sabbia-chiara p-6">
            <Campo
              etichetta={copy.nucleo.nome}
              placeholder={copy.nucleo.nome_placeholder}
              value={inModifica.nome}
              disabled={soloLettura}
              autoComplete="off"
              onChange={(e) => {
                const nome = e.target.value
                const patch: Partial<FamilyMember> = { nome }
                // incarnato e tinta seguono sempre il nome: non hanno controllo.
                // La figura segue solo finche' non e' stata scelta a mano.
                const dalNome = seedDaNome(nome, inModifica.eta)
                patch.avatar_seed = {
                  ...inModifica.avatar_seed,
                  pelle: dalNome.pelle,
                  tinta: dalNome.tinta,
                  ...(figuraToccata.has(inModifica.id) ? {} : { figura: dalNome.figura }),
                }
                aggiorna(aperto, patch)
              }}
            />

            <StepperEta
              valore={inModifica.eta}
              onCambia={(eta) => aggiorna(aperto, { eta })}
            />

            <SelettoreProfessione
              valore={inModifica.professione_key}
              libera={inModifica.professione_libera}
              onCambia={(professione_key, professione_libera) =>
                aggiorna(aperto, { professione_key, professione_libera })
              }
            />

            <div className="flex flex-col gap-2">
              <span className="text-base font-semibold text-notte/70">{copy.nucleo.ruolo}</span>
              <div className="flex flex-wrap gap-2">
                {RUOLI_FAMIGLIA.map((ruolo) => (
                  <button
                    key={ruolo}
                    type="button"
                    disabled={soloLettura}
                    onClick={() => aggiorna(aperto, { ruolo_famiglia: ruolo as RuoloFamiglia })}
                    className={`rounded-2xl border-2 px-4 py-2 text-base ${
                      inModifica.ruolo_famiglia === ruolo
                        ? 'border-notte bg-salvia/25 font-semibold'
                        : 'border-notte/20 hover:border-notte/50'
                    }`}
                  >
                    {copy.ruoliFamiglia[ruolo]}
                  </button>
                ))}
              </div>
            </div>

            <SceltaAspetto
              seed={inModifica.avatar_seed}
              disabilitato={soloLettura}
              onCambia={(avatar_seed) => {
                if (avatar_seed.figura !== inModifica.avatar_seed.figura) {
                  figuraToccata.add(inModifica.id)
                }
                aggiorna(aperto, { avatar_seed })
              }}
            />

            {!soloLettura ? (
              <div className="flex flex-wrap gap-2 border-t-2 border-notte/10 pt-4">
                <Bottone variante="quieto" onClick={() => sposta(aperto, -1)}>
                  ← {copy.nucleo.sposta_su}
                </Bottone>
                <Bottone variante="quieto" onClick={() => sposta(aperto, 1)}>
                  {copy.nucleo.sposta_giu} →
                </Bottone>
                <Bottone variante="fantasma" onClick={() => rimuovi(aperto)}>
                  {copy.nucleo.rimuovi}
                </Bottone>
              </div>
            ) : null}
          </div>
        ) : null}

        {membri.length > 0 && aperto >= 0 ? (
          <Bottone variante="quieto" onClick={() => setAperto(-1)}>
            {copy.nucleo.ritratto_titolo} →
          </Bottone>
        ) : null}
      </section>
    </div>
  )
}

/**
 * Il suggerimento automatico di professione scatta solo se quella attuale era
 * a sua volta un suggerimento: se il consulente ha scelto a mano, non si tocca.
 */
function meritaSuggerimento(attuale: string, etaPrecedente: number): boolean {
  const precedente = professioneSuggerita(etaPrecedente)
  return attuale === precedente || attuale === 'impiegato' || attuale === 'casual'
}
