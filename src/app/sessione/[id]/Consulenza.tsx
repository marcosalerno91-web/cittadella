'use client'

import { useCallback, useMemo, useState } from 'react'

import {
  cambiaFase,
  concludiSessione,
  riapriSessione,
  salvaEmozioni,
  salvaFinanze,
  salvaFortezza,
  salvaMembri,
} from '@/app/sessione/[id]/azioni'
import { BarraFase } from '@/components/scena/BarraFase'
import { FaseChiusura } from '@/components/fasi/FaseChiusura'
import { FaseCicloVita } from '@/components/fasi/FaseCicloVita'
import {
  FaseCittadellaCompleta,
  FaseDesiderato,
  FaseSituazioneOggi,
} from '@/components/fasi/FaseDomande'
import { FaseFinanze } from '@/components/fasi/FaseFinanze'
import { FaseFortezza } from '@/components/fasi/FaseFortezza'
import { FaseNucleo } from '@/components/fasi/FaseNucleo'
import { ScenaSessione } from '@/components/ui/ScenaSessione'
import { useSalvataggio, type StatoSalvataggio } from '@/lib/use-salvataggio'
import * as copy from '@/content/copy'
import { FASI } from '@/lib/domain'
import type {
  FamilyMember,
  FaseKey,
  FortressItem,
  SessionBundle,
  StatoVoce,
} from '@/lib/domain'
import type { EmotionsInput, FinancesInput, MemberInput } from '@/lib/db/types'

export function Consulenza({ bundle }: { bundle: SessionBundle }) {
  const sessionId = bundle.session.id
  const [conclusa, setConclusa] = useState(bundle.session.stato === 'conclusa')
  const soloLettura = conclusa

  const [fase, setFase] = useState<FaseKey>(bundle.session.fase_corrente)
  const [membri, setMembri] = useState<FamilyMember[]>(bundle.members)
  const [finanze, setFinanze] = useState<FinancesInput>({
    redditi: bundle.finances.redditi,
    rendite: bundle.finances.rendite,
    uscite: bundle.finances.uscite,
  })
  const [voci, setVoci] = useState<FortressItem[]>(bundle.fortress)
  const [emozioni, setEmozioni] = useState<EmotionsInput>({
    sentire_attuale: bundle.emotions.sentire_attuale,
    sentire_desiderato: bundle.emotions.sentire_desiderato,
    emozioni_scelte: bundle.emotions.emozioni_scelte,
    emozioni_desiderate: bundle.emotions.emozioni_desiderate,
    priorita_dichiarate: bundle.emotions.priorita_dichiarate,
  })

  // ------------------------------------------------------------ salvataggi

  const salvataggioMembri = useSalvataggio({
    valore: membri,
    chiave: `cittadella:${sessionId}:membri`,
    attivo: !soloLettura,
    salva: useCallback(
      async (valore: FamilyMember[]) => {
        const puliti: MemberInput[] = valore
          .filter((m) => m.nome.trim().length > 0)
          .map((m, indice) => ({
            // gli id creati nel browser non sono uuid: li genera il database
            ...(m.id.startsWith('nuovo-') ? {} : { id: m.id }),
            nome: m.nome,
            eta: m.eta,
            professione_key: m.professione_key,
            professione_libera: m.professione_libera,
            ruolo_famiglia: m.ruolo_famiglia,
            avatar_seed: m.avatar_seed,
            ordine: indice,
          }))
        await salvaMembri(sessionId, puliti)
      },
      [sessionId],
    ),
  })

  const salvataggioFinanze = useSalvataggio({
    valore: finanze,
    chiave: `cittadella:${sessionId}:finanze`,
    attivo: !soloLettura,
    salva: useCallback(
      async (valore: FinancesInput) => {
        await salvaFinanze(sessionId, valore)
      },
      [sessionId],
    ),
  })

  const salvataggioFortezza = useSalvataggio({
    valore: voci,
    chiave: `cittadella:${sessionId}:fortezza`,
    attivo: !soloLettura,
    salva: useCallback(
      async (valore: FortressItem[]) => {
        await salvaFortezza(
          sessionId,
          valore.map((v) => ({
            voce_key: v.voce_key,
            stato: v.stato,
            nota: v.nota,
            desiderata: v.desiderata,
          })),
        )
      },
      [sessionId],
    ),
  })

  const salvataggioEmozioni = useSalvataggio({
    valore: emozioni,
    chiave: `cittadella:${sessionId}:emozioni`,
    attivo: !soloLettura,
    salva: useCallback(
      async (valore: EmotionsInput) => {
        await salvaEmozioni(sessionId, valore)
      },
      [sessionId],
    ),
  })

  const salvataggi = [
    salvataggioMembri,
    salvataggioFinanze,
    salvataggioFortezza,
    salvataggioEmozioni,
  ]
  const statoComplessivo: StatoSalvataggio = salvataggi.some((s) => s.stato === 'errore')
    ? 'errore'
    : salvataggi.some((s) => s.stato === 'salvo')
      ? 'salvo'
      : salvataggi.some((s) => s.stato === 'salvato')
        ? 'salvato'
        : 'fermo'

  // ------------------------------------------------------------ navigazione

  const membriValidi = useMemo(() => membri.filter((m) => m.nome.trim().length > 0), [membri])

  const vaiA = useCallback(
    async (destinazione: FaseKey) => {
      setFase(destinazione)
      if (soloLettura) return
      try {
        await cambiaFase(sessionId, destinazione)
      } catch {
        // la fase e' solo un segnalibro: se la rete non risponde si prosegue
      }
    },
    [sessionId, soloLettura],
  )

  const indice = FASI.indexOf(fase)
  const precedente = indice > 0 ? FASI[indice - 1] : undefined
  const successiva = indice < FASI.length - 1 ? FASI[indice + 1] : undefined

  async function avanti() {
    await Promise.all(salvataggi.map((s) => s.salvaOra().catch(() => undefined)))
    if (successiva) await vaiA(successiva)
  }

  // ------------------------------------------------------------ modifiche

  function rispondiVoce(voceKey: string, stato: StatoVoce) {
    setVoci((attuali) => attuali.map((v) => (v.voce_key === voceKey ? { ...v, stato } : v)))
  }

  function annotaVoce(voceKey: string, nota: string) {
    setVoci((attuali) => attuali.map((v) => (v.voce_key === voceKey ? { ...v, nota } : v)))
  }

  /** Il cliente sceglie una costruzione per la cittadella che vorrebbe. */
  function scegliVoce(voceKey: string) {
    setVoci((attuali) =>
      attuali.map((v) => (v.voce_key === voceKey ? { ...v, desiderata: !v.desiderata } : v)),
    )
  }

  async function concludi() {
    await Promise.all(salvataggi.map((s) => s.salvaOra().catch(() => undefined)))
    await concludiSessione(sessionId)
    setConclusa(true)
  }

  async function riapri() {
    await riapriSessione(sessionId)
    setConclusa(false)
  }

  // ------------------------------------------------------------ blocchi avanzamento

  // Dalla v1.2 il testo libero e' facoltativo: le carte bastano, e la frase
  // esatta e' un di piu' prezioso ma non obbligatorio.
  const bloccatoAvanti = fase === 'nucleo' && membriValidi.length === 0

  const testi = copy.fasi[fase] ?? { titolo: '', sottotitolo: '' }

  return (
    <ScenaSessione
      titolo={fase === 'cittadella_completa' ? copy.cittadellaCompleta.titolo : testi.titolo}
      sottotitolo={fase === 'fortezza' ? undefined : testi.sottotitolo || undefined}
      barra={
        <BarraFase
          fase={fase}
          etichettaCliente={bundle.client.etichetta}
          stato={statoComplessivo}
          indietro={precedente ? () => void vaiA(precedente) : undefined}
          avanti={successiva ? () => void avanti() : undefined}
          avantiBloccato={bloccatoAvanti}
        />
      }
    >
      <div key={fase} className="anim-entra flex min-h-0 flex-1 flex-col">
        {fase === 'nucleo' ? (
          <FaseNucleo membri={membri} onCambia={setMembri} soloLettura={soloLettura} />
        ) : null}

        {fase === 'ciclo_vita' ? <FaseCicloVita membri={membriValidi} /> : null}

        {fase === 'finanze' ? (
          <FaseFinanze
            membri={membriValidi}
            finanze={finanze}
            onCambia={setFinanze}
            soloLettura={soloLettura}
          />
        ) : null}

        {fase === 'fortezza' ? (
          <FaseFortezza
            membri={membriValidi}
            voci={voci}
            onRispondi={rispondiVoce}
            onAnnota={annotaVoce}
            soloLettura={soloLettura}
          />
        ) : null}

        {fase === 'situazione_oggi' ? (
          <FaseSituazioneOggi
            membri={membriValidi}
            voci={voci}
            emozioni={emozioni}
            onCambia={setEmozioni}
            soloLettura={soloLettura}
          />
        ) : null}

        {fase === 'cittadella_completa' ? (
          <FaseCittadellaCompleta membri={membriValidi} voci={voci} />
        ) : null}

        {fase === 'desiderato' ? (
          <FaseDesiderato
            membri={membriValidi}
            voci={voci}
            emozioni={emozioni}
            onCambia={setEmozioni}
            onSceglie={scegliVoce}
            soloLettura={soloLettura}
          />
        ) : null}

        {fase === 'chiusura' ? (
          <FaseChiusura
            membri={membriValidi}
            sessionId={sessionId}
            conclusa={conclusa}
            onConcludi={() => void concludi()}
            onRiapri={() => void riapri()}
          />
        ) : null}
      </div>
    </ScenaSessione>
  )
}
