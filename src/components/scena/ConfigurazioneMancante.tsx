import { StemmaCittadella } from '@/components/scena/StemmaCittadella'

/**
 * Quello che si vede al posto dell'applicazione quando in produzione mancano
 * le credenziali Supabase.
 *
 * Senza, l'applicazione ripiegherebbe sul driver a file — che in sviluppo va
 * benissimo e in produzione e' una trappola: su un disco effimero i dati
 * spariscono a ogni riavvio, e nessuno se ne accorge finche' non e' tardi.
 * Meglio non partire.
 */
export function ConfigurazioneMancante() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <StemmaCittadella className="h-14 w-14" />
          <div>
            <h1 className="text-3xl">La cittadella non ha ancora un database</h1>
            <p className="text-lg text-notte/60">
              In produzione servono le credenziali Supabase: senza, i dati non
              sopravvivrebbero al primo riavvio.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border-2 border-sole bg-sabbia-chiara p-7">
          <p className="text-lg leading-relaxed">
            Fuori da qui l’applicazione puo’ girare su un file locale, ed e’ come si
            sviluppa. Qui no: il disco e’ effimero e ogni consulenza andrebbe persa
            senza che nessuno se ne accorga. Quindi non parte.
          </p>

          <h2 className="mt-6 text-xl">Cosa impostare</h2>
          <ul className="mt-2 flex flex-col gap-2 text-lg">
            <li>
              <code className="rounded bg-notte/8 px-1.5 py-0.5 text-base">
                NEXT_PUBLIC_SUPABASE_URL
              </code>
            </li>
            <li>
              <code className="rounded bg-notte/8 px-1.5 py-0.5 text-base">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
            </li>
          </ul>

          <p className="mt-5 text-base leading-relaxed text-notte/60">
            Poi vanno eseguite, in ordine, le migration di{' '}
            <code className="text-notte/75">supabase/migrations/</code> e la prova{' '}
            <code className="text-notte/75">supabase/tests/isolamento.sql</code>. Se le
            policy non reggono, l’applicazione lo dira’ con un’altra pagina: e’ la
            guardia dell’isolamento fra agenzie.
          </p>
        </div>
      </div>
    </main>
  )
}
