/**
 * Banco di prova della scena della cittadella.
 *
 * Serve a generarla in ogni stato — vuota, un blocco alla volta, tutta piena,
 * tutta "non lo so", mista — e guardarle una accanto all'altra. Se una scena e'
 * confusa o sbilanciata, si corregge la geometria prima di andare avanti: qui
 * il criterio non e' che funzioni, e' che sia bella.
 */

import { notFound } from 'next/navigation'

import { Fortezza } from '@/components/scena/Fortezza'
import { BLOCCHI_FORTEZZA, VOCI_FORTEZZA } from '@/config/engine'
import * as copy from '@/content/copy'
import type { BloccoKey, FamilyMember, FortressItem, StatoVoce } from '@/lib/domain'

export const metadata = { title: 'Banco di prova della cittadella' }

const FAMIGLIA: FamilyMember[] = [
  membro('Marta', 44, 'insegnante', 'femminile', 'raccolti', 'chiaro'),
  membro('Davide', 47, 'artigiano', 'maschile', 'corti', 'ambrato'),
  membro('Luca', 16, 'studente', 'maschile', 'cortissimi', 'olivastro'),
  membro('Sofia', 5, 'bambino', 'femminile', 'raccolti', 'chiaro'),
  membro('Giovanni', 74, 'tempo_libero', 'maschile', 'corti', 'chiaro'),
]

function membro(
  nome: string,
  eta: number,
  professione_key: FamilyMember['professione_key'],
  figura: 'femminile' | 'maschile',
  capelli: 'cortissimi' | 'corti' | 'raccolti',
  incarnato: 'chiaro' | 'olivastro' | 'ambrato' | 'scuro',
): FamilyMember {
  return {
    id: nome,
    session_id: 'prova',
    nome,
    eta,
    professione_key,
    professione_libera: null,
    ruolo_famiglia: 'altro',
    avatar_seed: { figura, capelli, incarnato },
    ordine: 0,
  }
}

function voci(
  assegna: (voceKey: string, blocco: BloccoKey) => StatoVoce | null,
  desiderate: string[] = [],
): FortressItem[] {
  return VOCI_FORTEZZA.map((v) => ({
    id: v.key,
    session_id: 'prova',
    blocco: v.blocco,
    voce_key: v.key,
    stato: assegna(v.key, v.blocco),
    nota: null,
    desiderata: desiderate.includes(v.key),
  }))
}

const VUOTE = voci(() => null)
const TUTTE_PRESENTI = voci(() => 'presente')
const TUTTE_ASSENTI = voci(() => 'assente')
const TUTTE_NON_SO = voci(() => 'non_so')

/** La famiglia demo: e' lo stato con cui si fa la prova sul campo. */
const DEMO: Record<string, StatoVoce> = {
  tcm: 'assente',
  ltc: 'non_so',
  critical_illness: 'assente',
  invalidita_permanente_grave: 'assente',
  rimborso_spese_mediche: 'presente',
  grandi_interventi: 'presente',
  ipi_infortunio: 'presente',
  assistenza: 'non_so',
  pip: 'presente',
  pac: 'assente',
  premi_unici: 'assente',
  rc_capofamiglia: 'non_so',
  casa: 'presente',
  tutela_legale: 'assente',
}

const ordineBlocchi = BLOCCHI_FORTEZZA.map((b) => b.key)

interface Scena {
  titolo: string
  nota: string
  voci: FortressItem[]
  cinteVisibili?: BloccoKey[]
  voceInCorso?: string
  desiderate?: string[]
  tuttoPieno?: boolean
}

const SCENE: Scena[] = [
  {
    titolo: 'Vuota',
    nota: 'Nessuna risposta: solo le fondazioni tracciate a terra.',
    voci: VUOTE,
  },
  ...ordineBlocchi.map((blocco, i) => ({
    titolo: `Costruito fino a ${copy.blocchi[blocco].nome.toLowerCase()}`,
    nota: `${copy.blocchi[blocco].titolo}. Il campo si allarga a ogni blocco nuovo.`,
    voci: voci((k, b) => (ordineBlocchi.indexOf(b) < i ? (DEMO[k] ?? null) : null)),
    cinteVisibili: ordineBlocchi.slice(0, i + 1),
    voceInCorso: BLOCCHI_FORTEZZA[i]?.voci[0],
  })),
  {
    titolo: 'La famiglia demo',
    nota: 'Lo stato reale con cui si prova il flusso: presenti, assenti e non so mescolati.',
    voci: voci((k) => DEMO[k] ?? null),
  },
  {
    titolo: 'Tutta piena',
    nota: 'La cittadella intera, quella della fase 5b.',
    voci: TUTTE_PRESENTI,
    tuttoPieno: true,
  },
  {
    titolo: 'Tutta da costruire',
    nota: 'Nessuna copertura. Deve restare un cantiere, non un allarme.',
    voci: TUTTE_ASSENTI,
  },
  {
    titolo: 'Tutta “non lo so”',
    nota: 'Il caso di chi non ha mai guardato le proprie polizze.',
    voci: TUTTE_NON_SO,
  },
  {
    titolo: 'La cittadella desiderata',
    nota:
      'Fase 5c: in salvia cio’ che c’e’ gia’, in sole le costruzioni che il cliente ha scelto.',
    voci: voci((k) => DEMO[k] ?? null, ['tcm', 'invalidita_permanente_grave', 'rc_capofamiglia', 'pac']),
    desiderate: ['tcm', 'invalidita_permanente_grave', 'rc_capofamiglia', 'pac'],
  },
  {
    titolo: 'Desiderata tutta',
    nota: 'Il cliente le vuole tutte. E’ una risposta come un’altra e va registrata.',
    voci: voci((k) => DEMO[k] ?? null, VOCI_FORTEZZA.map((v) => v.key)),
  },
  {
    titolo: 'Una voce accesa',
    nota: 'Mentre si fa la domanda il resto della scena scende di saturazione.',
    voci: voci((k) => DEMO[k] ?? null),
    voceInCorso: 'pac',
  },
]

export default async function BancoDiProva({
  searchParams,
}: {
  searchParams: Promise<{ solo?: string; senzaEtichette?: string }>
}) {
  if (process.env.NODE_ENV === 'production') notFound()

  const parametri = await searchParams
  const solo = parametri.solo?.trim().toLowerCase()
  const conEtichette = parametri.senzaEtichette !== '1'
  const elenco = solo
    ? SCENE.filter((s) => s.titolo.toLowerCase().includes(solo))
    : SCENE

  return (
    <main className="mx-auto w-full max-w-[1500px] px-8 py-10">
      <h1 className="text-4xl">Banco di prova della cittadella</h1>
      <p className="mt-2 max-w-3xl text-lg text-notte/60">
        La scena in ogni stato in cui puo’ trovarsi. Si guardano tutte prima di
        dichiarare chiuso il lavoro: il criterio non e’ che funzioni, e’ che sia bella.
      </p>
      <p className="mt-3 text-base text-notte/50">
        <code>?solo=piena</code> filtra per titolo · <code>?senzaEtichette=1</code> toglie i nomi
      </p>

      <div className="mt-10 flex flex-col gap-12">
        {elenco.map((scena) => (
          <section key={scena.titolo}>
            <h2 className="text-2xl">{scena.titolo}</h2>
            <p className="mb-3 text-base text-notte/55">{scena.nota}</p>
            <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-3xl border-2 border-notte/12 bg-sabbia-chiara p-4">
              <Fortezza
                membri={FAMIGLIA}
                voci={scena.voci}
                tuttoPieno={scena.tuttoPieno}
                voceInCorso={scena.voceInCorso ?? null}
                cinteVisibili={scena.cinteVisibili}
                conEtichette={conEtichette}
                className="h-full w-full"
              />
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
