'use client'

import { useActionState, useState } from 'react'

import { creaCliente, type StatoCliente } from '@/app/clienti/azioni'
import { Bottone } from '@/components/ui/Bottone'
import { AreaTesto, Campo } from '@/components/ui/Campo'
import * as copy from '@/content/copy'

const iniziale: StatoCliente = {}

export function NuovoCliente() {
  const [aperto, setAperto] = useState(false)
  const [stato, azione, inCorso] = useActionState(creaCliente, iniziale)

  if (!aperto) {
    return (
      <Bottone onClick={() => setAperto(true)}>
        <span aria-hidden>＋</span>
        {copy.clienti.nuovo}
      </Bottone>
    )
  }

  return (
    <form
      action={azione}
      className="anim-entra flex flex-col gap-5 rounded-3xl border-2 border-notte/15 bg-sabbia-chiara p-7"
    >
      <h2 className="text-2xl">{copy.clienti.nuovo}</h2>

      <Campo
        etichetta={copy.clienti.etichetta}
        aiuto={copy.clienti.etichetta_aiuto}
        name="etichetta"
        autoFocus
        required
      />
      <AreaTesto etichetta={copy.clienti.note} name="note" />

      <div className="rounded-2xl border-2 border-notte/15 bg-sabbia px-6 py-5">
        <h3 className="text-lg font-semibold">{copy.consenso.titolo}</h3>
        <p className="mt-2 text-base leading-relaxed text-notte/65">{copy.consenso.testo}</p>
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-base font-semibold">
          <input
            type="checkbox"
            name="consenso"
            required
            className="mt-1 h-6 w-6 min-h-0 shrink-0 accent-[var(--salvia)]"
          />
          <span>{copy.consenso.spunta}</span>
        </label>
      </div>

      {stato.errore ? (
        <p role="alert" className="rounded-2xl bg-corallo/15 px-5 py-3 text-base">
          {stato.errore}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Bottone type="submit" disabled={inCorso}>
          {inCorso ? copy.accesso.in_corso : copy.consenso.conferma}
        </Bottone>
        <Bottone type="button" variante="fantasma" onClick={() => setAperto(false)}>
          {copy.clienti.annulla}
        </Bottone>
      </div>
    </form>
  )
}
