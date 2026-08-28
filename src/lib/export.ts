/**
 * Export strutturato della sessione.
 *
 * Lo schema e' versionato e documentato in docs/export-schema.md: serve al
 * consulente per alimentare i propri strumenti di produzione dei prospetti,
 * quindi cambia solo alzando SCHEMA_VERSION e aggiornando il documento.
 */

import { VOCI_FORTEZZA, faseVita, livelloScorta } from '@/config/engine'
import { calcolaCrm } from '@/lib/engine/crm'
import { completamentoPesato, statoTutteLeCinte } from '@/lib/engine/fortezza'
import { leggiSpostamento } from '@/lib/engine/emozioni'
import * as copy from '@/content/copy'
import type { SessionBundle, StatoVoce } from '@/lib/domain'

export const SCHEMA_VERSION = '1.1.0'

export interface ExportSessione {
  schema_version: string
  generato_il: string
  sessione: {
    id: string
    stato: string
    creata_il: string
    aggiornata_il: string
    conclusa_il: string | null
  }
  cliente: {
    etichetta: string
    note: string | null
  }
  nucleo: {
    id: string
    nome: string
    eta: number
    professione_key: string
    professione_libera: string | null
    ruolo_famiglia: string
    fase_vita: string
    ordine: number
  }[]
  finanze: {
    valuta: 'EUR'
    periodo: 'mensile'
    redditi_da_lavoro: { member_id: string; nome: string; importo: number }[]
    rendite: Record<string, number>
    uscite: Record<string, number>
    entrate_totali: number
    uscite_totali: number
    crm_mensile: number
    crm_annuale: number
    crm_percentuale: number
    livello_scorta: string
  }
  fortezza: {
    completamento_pesato: number
    cinte: {
      blocco: string
      titolo: string
      voci_totali: number
      presenti: number
      assenti: number
      non_so: number
      senza_risposta: number
      completamento: number
    }[]
    voci: {
      voce_key: string
      blocco: string
      nome: string
      sigla: string | null
      stato: StatoVoce | null
      nota: string | null
      /** il cliente vuole questa costruzione nella propria cittadella */
      desiderata: boolean
    }[]
  }
  emozioni: {
    sentire_attuale: string
    emozioni_scelte: DescrizioneEmozione[]
    sentire_desiderato: string
    emozioni_desiderate: DescrizioneEmozione[]
    /** lo spostamento fra come si sente e come vorrebbe sentirsi */
    movimento: {
      quante_allontanano: number
      quante_avvicinano: number
      frase: string
    }
  }
  /** la somma di cio' che c'e' gia' e di cio' che il cliente ha scelto */
  cittadella_desiderata: {
    gia_presenti: RiferimentoVoce[]
    scelte: RiferimentoVoce[]
  }
}

export interface DescrizioneEmozione {
  chiave: string
  etichetta: string
  direzione: string
  ordine: string
}

export interface RiferimentoVoce {
  voce_key: string
  nome: string
  blocco: string
}

export function costruisciExport(bundle: SessionBundle, generatoIl: string): ExportSessione {
  const crm = calcolaCrm({
    redditi: bundle.finances.redditi,
    rendite: bundle.finances.rendite,
    uscite: bundle.finances.uscite,
  })
  const nomiMembri = new Map(bundle.members.map((m) => [m.id, m.nome]))
  const spostamento = leggiSpostamento(
    bundle.emotions.emozioni_scelte,
    bundle.emotions.emozioni_desiderate,
  )
  const riferimento = (voceKey: string): RiferimentoVoce => ({
    voce_key: voceKey,
    nome: copy.vociFortezza[voceKey]?.nome ?? voceKey,
    blocco: VOCI_FORTEZZA.find((v) => v.key === voceKey)?.blocco ?? '',
  })

  return {
    schema_version: SCHEMA_VERSION,
    generato_il: generatoIl,
    sessione: {
      id: bundle.session.id,
      stato: bundle.session.stato,
      creata_il: bundle.session.created_at,
      aggiornata_il: bundle.session.updated_at,
      conclusa_il: bundle.session.conclusa_at,
    },
    cliente: {
      etichetta: bundle.client.etichetta,
      note: bundle.client.note,
    },
    nucleo: bundle.members.map((m) => ({
      id: m.id,
      nome: m.nome,
      eta: m.eta,
      professione_key: m.professione_key,
      professione_libera: m.professione_libera,
      ruolo_famiglia: m.ruolo_famiglia,
      fase_vita: faseVita(m.eta),
      ordine: m.ordine,
    })),
    finanze: {
      valuta: 'EUR',
      periodo: 'mensile',
      redditi_da_lavoro: bundle.finances.redditi.map((r) => ({
        member_id: r.member_id,
        nome: nomiMembri.get(r.member_id) ?? '',
        importo: r.importo,
      })),
      rendite: { ...bundle.finances.rendite },
      uscite: { ...bundle.finances.uscite },
      entrate_totali: crm.entrate_totali,
      uscite_totali: crm.uscite_totali,
      crm_mensile: crm.crm_mensile,
      crm_annuale: crm.crm_annuale,
      crm_percentuale: Number(crm.crm_percentuale.toFixed(4)),
      livello_scorta: livelloScorta(crm.crm_percentuale, crm.crm_mensile),
    },
    fortezza: {
      completamento_pesato: Number(completamentoPesato(bundle.fortress).toFixed(4)),
      cinte: statoTutteLeCinte(bundle.fortress).map((s) => ({
        blocco: s.blocco,
        titolo: copy.blocchi[s.blocco].titolo,
        voci_totali: s.totale,
        presenti: s.presenti,
        assenti: s.assenti,
        non_so: s.non_so,
        senza_risposta: s.senza_risposta,
        completamento: Number(s.completamento.toFixed(4)),
      })),
      voci: VOCI_FORTEZZA.map((v) => {
        const riga = bundle.fortress.find((f) => f.voce_key === v.key)
        const testi = copy.vociFortezza[v.key]
        return {
          voce_key: v.key,
          blocco: v.blocco,
          nome: testi?.nome ?? v.key,
          sigla: testi?.sigla ?? null,
          stato: riga?.stato ?? null,
          nota: riga?.nota ?? null,
          desiderata: riga?.desiderata ?? false,
        }
      }),
    },
    emozioni: {
      sentire_attuale: bundle.emotions.sentire_attuale,
      emozioni_scelte: bundle.emotions.emozioni_scelte.map((k) => descrivi('oggi', k)),
      sentire_desiderato: bundle.emotions.sentire_desiderato,
      emozioni_desiderate: bundle.emotions.emozioni_desiderate.map((k) => descrivi('desiderato', k)),
      movimento: {
        quante_allontanano: spostamento.quanteVia,
        quante_avvicinano: spostamento.quanteVerso,
        frase: spostamento.frase,
      },
    },
    cittadella_desiderata: {
      gia_presenti: bundle.fortress
        .filter((f) => f.stato === 'presente')
        .map((f) => riferimento(f.voce_key)),
      scelte: bundle.fortress
        .filter((f) => f.desiderata && f.stato !== 'presente')
        .map((f) => riferimento(f.voce_key)),
    },
  }
}

function descrivi(insieme: copy.InsiemeEmozioni, chiave: string): DescrizioneEmozione {
  const trovata = copy.emozioneDi(insieme, chiave)
  return {
    chiave,
    etichetta: trovata?.etichetta ?? chiave,
    direzione: trovata?.direzione ?? '',
    ordine: trovata?.ordine ?? '',
  }
}

/** Nome file suggerito: leggibile e ordinabile. */
export function nomeFileExport(etichetta: string, data: string): string {
  const pulita = etichetta
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `cittadella-${pulita || 'sessione'}-${data.slice(0, 10)}.json`
}
