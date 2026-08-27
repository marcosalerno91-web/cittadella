'use client'

import { useActionState, useState } from 'react'

import { accedi, registra, type StatoAccesso } from '@/app/accedi/azioni'
import { Bottone } from '@/components/ui/Bottone'
import { Campo } from '@/components/ui/Campo'
import { StemmaCittadella } from '@/components/scena/StemmaCittadella'
import * as copy from '@/content/copy'

const inizialeAccesso: StatoAccesso = {}

export function ModuloAccesso() {
  const [nuovo, setNuovo] = useState(false)
  const [statoAccesso, azioneAccesso, inCorsoAccesso] = useActionState(accedi, inizialeAccesso)
  const [statoRegistra, azioneRegistra, inCorsoRegistra] = useActionState(registra, inizialeAccesso)

  const stato = nuovo ? statoRegistra : statoAccesso
  const inCorso = nuovo ? inCorsoRegistra : inCorsoAccesso

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-10">
      <div className="anim-entra w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <StemmaCittadella className="h-28 w-28" />
          <h1 className="mt-4 text-5xl">{copy.app.nome}</h1>
          <p className="mt-3 text-xl text-notte/65">{copy.accesso.sottotitolo}</p>
        </div>

        <form
          action={nuovo ? azioneRegistra : azioneAccesso}
          className="flex flex-col gap-5 rounded-3xl border-2 border-notte/15 bg-sabbia-chiara p-7"
        >
          <h2 className="text-2xl">{nuovo ? copy.accesso.registrati : copy.accesso.titolo}</h2>

          {nuovo ? (
            <>
              <Campo etichetta={copy.accesso.nome_consulente} name="nome" autoComplete="name" required />
              <Campo
                etichetta={copy.accesso.nome_agenzia}
                name="agenzia"
                autoComplete="organization"
              />
            </>
          ) : null}

          <Campo
            etichetta={copy.accesso.email}
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <Campo
            etichetta={copy.accesso.password}
            name="password"
            type="password"
            autoComplete={nuovo ? 'new-password' : 'current-password'}
            required
            minLength={nuovo ? 8 : undefined}
          />

          {stato.errore ? (
            <p role="alert" className="rounded-2xl bg-corallo/15 px-5 py-3 text-base text-notte">
              {stato.errore}
            </p>
          ) : null}

          <Bottone type="submit" disabled={inCorso}>
            {inCorso ? copy.accesso.in_corso : nuovo ? copy.accesso.registrati : copy.accesso.entra}
          </Bottone>

          <button
            type="button"
            onClick={() => setNuovo((v) => !v)}
            className="text-base font-semibold text-notte/60 underline underline-offset-4 hover:text-notte"
          >
            {nuovo ? copy.accesso.gia_registrato : copy.accesso.registrati}
          </button>
        </form>
      </div>
    </main>
  )
}
