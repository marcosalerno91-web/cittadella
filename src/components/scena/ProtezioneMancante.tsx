import { StemmaCittadella } from '@/components/scena/StemmaCittadella'
import type { Verdetto } from '@/lib/db/guardia-rls'

/**
 * Quello che si vede al posto dell'applicazione quando le policy non reggono.
 *
 * Non e' una schermata per il cliente: e' per chi ha collegato il database.
 * Deve dire esattamente cosa manca e quale file eseguire.
 */
export function ProtezioneMancante({ verdetto }: { verdetto: Extract<Verdetto, { protetto: false }> }) {
  const file =
    verdetto.causa === 'migration'
      ? 'supabase/migrations/0001_init.sql'
      : 'supabase/migrations/0001_init.sql (rieseguilo: e’ idempotente)'

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <StemmaCittadella className="h-14 w-14" />
          <div>
            <h1 className="text-3xl">Le mura del database non sono in piedi</h1>
            <p className="text-lg text-notte/60">
              L’applicazione non parte finche’ l’isolamento fra agenzie non e’ garantito.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border-2 border-corallo/50 bg-sabbia-chiara p-7">
          <p className="text-lg leading-relaxed">
            Le credenziali Supabase sono impostate, ma{' '}
            <strong>{verdetto.messaggio}</strong>. Le query di questa applicazione non
            filtrano per agenzia di proposito: a tenere separati i consulenti sono le
            policy RLS di Postgres. Senza quelle, ogni consulente vedrebbe i clienti di
            tutti.
          </p>

          <h2 className="mt-6 text-xl">Cosa manca</h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {verdetto.mancanze.map((m) => (
              <li key={m.tabella} className="flex flex-wrap gap-x-3 border-b border-notte/10 py-1.5">
                <code className="font-semibold">{m.tabella}</code>
                <span className="text-corallo">{m.motivo}</span>
                <span className="text-notte/55">— {m.dettaglio}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-xl">Come si rimette a posto</h2>
          <ol className="mt-2 flex flex-col gap-2 text-lg">
            <li>
              1. Apri il SQL Editor del progetto Supabase ed esegui{' '}
              <code className="rounded bg-notte/8 px-1.5 py-0.5 text-base">{file}</code>
            </li>
            <li>
              2. Esegui{' '}
              <code className="rounded bg-notte/8 px-1.5 py-0.5 text-base">
                supabase/tests/isolamento.sql
              </code>{' '}
              e controlla che i NOTICE dicano tutti PASSA
            </li>
            <li>3. Riavvia l’applicazione</li>
          </ol>

          <p className="mt-6 text-base text-notte/50">
            In alternativa, togli{' '}
            <code className="text-notte/70">NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
            <code className="text-notte/70">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> da{' '}
            <code className="text-notte/70">.env.local</code> per tornare al driver locale
            su file, che non usa Postgres.
          </p>
        </div>
      </div>
    </main>
  )
}
