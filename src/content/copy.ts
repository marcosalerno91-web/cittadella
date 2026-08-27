/**
 * Tutti i testi dell'applicazione.
 *
 * Regola di scrittura: si comunica al positivo. Si dice cosa una cosa E' e cosa
 * PROTEGGE, non cosa manca e non cosa fa paura. Niente sigle nude: ogni sigla ha
 * accanto la sua traduzione umana. Niente gergo assicurativo non spiegato.
 *
 * Questo file si puo' riscrivere da cima a fondo senza toccare una riga di logica.
 */

import type {
  BloccoKey,
  ProfessioneKey,
  RenditaKey,
  RuoloFamiglia,
  StatoVoce,
  UscitaKey,
} from '@/lib/domain'
import type { FaseVita, LivelloScorta } from '@/config/engine'

export const app = {
  nome: 'Cittadella',
  tagline: 'Guarda la tua famiglia. Guarda cosa la protegge gia’.',
} as const

// ---------------------------------------------------------------- accesso

export const accesso = {
  titolo: 'Entra nella Cittadella',
  sottotitolo: 'Lo strumento con cui accompagni una famiglia a vedersi.',
  email: 'La tua email',
  password: 'La tua password',
  entra: 'Entra',
  esci: 'Esci',
  registrati: 'Crea il tuo accesso',
  gia_registrato: 'Ho gia’ un accesso',
  nome_consulente: 'Il tuo nome',
  nome_agenzia: 'Nome della tua agenzia',
  in_corso: 'Un attimo…',
  errore_credenziali: 'Email o password non corrispondono. Riprova.',
  errore_generico: 'Non siamo riusciti a completare l’operazione. Riprova fra un istante.',
} as const

// ---------------------------------------------------------------- clienti

export const clienti = {
  titolo: 'Le tue famiglie',
  sottotitolo: 'Ogni riga e’ un nucleo che hai accompagnato o che stai per accompagnare.',
  nuovo: 'Nuova famiglia',
  etichetta: 'Come chiami questo nucleo',
  etichetta_aiuto: 'Un nome che riconosci a colpo d’occhio. Per esempio: Famiglia Rossi.',
  note: 'Appunti tuoi (facoltativi)',
  crea: 'Crea',
  annulla: 'Annulla',
  vuoto_titolo: 'Non c’e’ ancora nessuna famiglia',
  vuoto_testo: 'Comincia da qui: crea il primo nucleo e apri la sua prima sessione.',
  apri_sessione: 'Apri una sessione',
  riprendi_sessione: 'Riprendi da dove eravate',
  rivedi_sessione: 'Rivedi la sessione',
  sessione_conclusa: 'Conclusa',
  sessione_in_corso: 'In corso',
  sessione_bozza: 'Da iniziare',
  creata_il: 'Creata il',
} as const

export const consenso = {
  titolo: 'Prima di cominciare',
  testo:
    'La Cittadella registra solo quello che serve a raccontare la protezione di questo nucleo: nomi, eta’, professioni, importi medi mensili e le risposte che il cliente ti dara’. Nessun documento, nessun dato sanitario, nessun codice fiscale.',
  spunta: 'Ho raccolto il consenso al trattamento dati di questo nucleo.',
  conferma: 'Cominciamo',
} as const

// ---------------------------------------------------------------- fasi

export const fasi: Record<string, { titolo: string; sottotitolo: string }> = {
  nucleo: {
    titolo: 'Chi siete',
    sottotitolo: 'Mettiamo in scena la famiglia, uno alla volta.',
  },
  ciclo_vita: {
    titolo: 'Dove siete adesso',
    sottotitolo: 'Ogni eta’ ha il suo compito. Guardate dove si trova ciascuno.',
  },
  finanze: {
    titolo: 'Cosa entra, cosa esce',
    sottotitolo: 'Importi medi al mese. Servono ordini di grandezza, non la contabilita’.',
  },
  fortezza: {
    titolo: 'Cosa vi protegge gia’',
    sottotitolo: 'Costruiamo le mura, una cinta alla volta, partendo da chi ci vive.',
  },
  situazione_oggi: {
    titolo: 'La vostra cittadella oggi',
    sottotitolo: '',
  },
  cittadella_completa: {
    titolo: 'La cittadella intera',
    sottotitolo: '',
  },
  desiderato: {
    titolo: 'Come vorreste sentirvi',
    sottotitolo: '',
  },
  chiusura: {
    titolo: 'Ci sentiamo presto',
    sottotitolo: '',
  },
}

export const navigazione = {
  avanti: 'Avanti',
  indietro: 'Indietro',
  continua: 'Continua',
  salvato: 'Salvato',
  salvataggio: 'Salvo…',
  offline:
    'La connessione se n’e’ andata un momento. Continuate pure: tengo tutto e salvo appena torna.',
  riprova: 'Riprovo a salvare…',
} as const

// ---------------------------------------------------------------- fase 1

export const nucleo = {
  aggiungi: 'Aggiungi una persona',
  nome: 'Nome',
  nome_placeholder: 'Come lo chiamate in casa',
  eta: 'Eta’',
  professione: 'Cosa fa',
  professione_cerca: 'Scrivi e scegli…',
  professione_libera_aiuto:
    'Non e’ in elenco? Scrivilo pure: lo teniamo scritto e usiamo una figura neutra.',
  ruolo: 'In famiglia e’',
  aspetto: 'Aspetto',
  aspetto_cambia: 'Cambia',
  rimuovi: 'Togli dalla scena',
  sposta_su: 'Sposta prima',
  sposta_giu: 'Sposta dopo',
  vuoto: 'Comincia dalla persona che hai davanti.',
  ritratto_titolo: 'Eccoli',
  ritratto_sottotitolo: 'Questa e’ la famiglia di cui parleremo per tutto il resto dell’incontro.',
  conferma_rimozione: 'Tolgo {nome} dalla scena?',
} as const

export const ruoliFamiglia: Record<RuoloFamiglia, string> = {
  intestatario: 'La persona con cui parlo',
  partner: 'Partner',
  figlio: 'Figlio o figlia',
  genitore: 'Genitore',
  altro: 'Altro',
}

export const professioni: Record<ProfessioneKey, string> = {
  bambino: 'Bambino',
  studente: 'Studente',
  medico: 'Medico',
  infermiere: 'Infermiere',
  insegnante: 'Insegnante',
  impiegato: 'Impiegato',
  operaio: 'Operaio',
  artigiano: 'Artigiano',
  agricoltore: 'Agricoltore',
  commerciante: 'Commerciante',
  ristoratore: 'Ristoratore',
  avvocato: 'Avvocato',
  commercialista: 'Commercialista',
  tecnico_progettista: 'Tecnico o progettista',
  forze_ordine: 'Forze dell’ordine',
  autotrasportatore: 'Autotrasportatore',
  benessere: 'Benessere e cura della persona',
  informatico: 'Informatico',
  sport: 'Sport',
  cura_casa: 'Si prende cura della casa',
  tempo_libero: 'In pensione',
  casual: 'Altro',
}

/** Sinonimi per la ricerca nella select. Non compaiono a schermo. */
export const professioniSinonimi: Record<ProfessioneKey, string[]> = {
  bambino: ['bimbo', 'bimba', 'piccolo', 'asilo', 'materna'],
  studente: ['studentessa', 'scuola', 'universita', 'liceo', 'studio'],
  medico: ['dottore', 'dottoressa', 'chirurgo', 'pediatra', 'dentista'],
  infermiere: ['infermiera', 'oss', 'ostetrica', 'soccorritore'],
  insegnante: ['maestra', 'maestro', 'professore', 'professoressa', 'docente', 'educatrice'],
  impiegato: ['impiegata', 'ufficio', 'segretaria', 'amministrativo', 'bancario', 'assicuratore'],
  operaio: ['operaia', 'fabbrica', 'metalmeccanico', 'magazziniere', 'muratore'],
  artigiano: ['idraulico', 'elettricista', 'falegname', 'fabbro', 'meccanico', 'imbianchino'],
  agricoltore: ['contadino', 'coltivatore', 'allevatore', 'agricola', 'vignaiolo'],
  commerciante: ['negoziante', 'commessa', 'commesso', 'venditore', 'bottega', 'fruttivendolo'],
  ristoratore: ['cuoco', 'chef', 'cameriere', 'barista', 'pizzaiolo', 'ristorante', 'bar'],
  avvocato: ['avvocata', 'legale', 'notaio', 'giurista'],
  commercialista: ['ragioniere', 'contabile', 'consulente fiscale', 'revisore'],
  tecnico_progettista: ['ingegnere', 'architetto', 'geometra', 'perito', 'progettista', 'cantiere'],
  forze_ordine: ['carabiniere', 'poliziotto', 'militare', 'vigile', 'finanziere', 'pompiere'],
  autotrasportatore: ['camionista', 'autista', 'corriere', 'trasporti', 'tassista', 'furgone'],
  benessere: ['parrucchiere', 'parrucchiera', 'estetista', 'barbiere', 'massaggiatore'],
  informatico: ['programmatore', 'sviluppatore', 'sistemista', 'it', 'digitale'],
  sport: ['allenatore', 'atleta', 'istruttore', 'personal trainer', 'palestra', 'calciatore'],
  cura_casa: ['casalinga', 'casalingo', 'famiglia', 'caregiver', 'badante'],
  tempo_libero: ['pensionato', 'pensionata', 'pensione', 'riposo'],
  casual: ['altro', 'non in elenco'],
}

// ---------------------------------------------------------------- fase 2

export const cicloVita = {
  asse_x: 'Eta’',
  asse_y: 'Quanto si riesce a produrre',
  campiture: {
    studio: 'Studio',
    lavoro: 'Lavoro',
    tempo_libero: 'Tempo libero',
  } as Record<FaseVita, string>,
  anni: 'anni',
} as const

/** Riga sotto la scena, una per membro. {nome} viene sostituito. */
export const frasiCicloVita: Record<FaseVita, string> = {
  studio: '{nome} sta costruendo quello che sapra’ fare.',
  lavoro: '{nome} e’ nel pieno degli anni in cui il suo lavoro sostiene la famiglia.',
  tempo_libero: '{nome} e’ nel tempo che si e’ guadagnato.',
}

// ---------------------------------------------------------------- fase 3

export const finanze = {
  entrate_titolo: 'Cosa entra ogni mese',
  entrate_sottotitolo: 'Quanto porta a casa ciascuno, in media, al mese.',
  lavoro_titolo: 'Dal lavoro',
  rendite_titolo: 'Senza lavorarci',
  rendite_sottotitolo: 'Quello che arriva anche stando fermi.',
  uscite_titolo: 'Cosa esce ogni mese',
  uscite_sottotitolo: 'Le uscite fisse e quelle di tutti i giorni, in media.',
  nessun_reddito: 'Non ha un reddito da lavoro',
  totale_entrate: 'Entrate',
  totale_uscite: 'Uscite',
  al_mese: 'al mese',
  all_anno: 'all’anno',
} as const

export const rendite: Record<RenditaKey, { label: string; aiuto: string }> = {
  affitti: { label: 'Affitti', aiuto: 'Quello che incassate da immobili dati in affitto.' },
  cedole_dividendi: {
    label: 'Cedole e dividendi',
    aiuto: 'Quello che rendono i risparmi gia’ investiti.',
  },
  altre_rendite: { label: 'Altre entrate ricorrenti', aiuto: 'Tutto il resto che arriva ogni mese.' },
}

export const uscite: Record<UscitaKey, { label: string; aiuto: string }> = {
  casa: { label: 'Casa', aiuto: 'Rata del mutuo oppure affitto.' },
  auto: { label: 'Auto', aiuto: 'Rate, bollo, assicurazione, carburante, manutenzione.' },
  finanziamenti: { label: 'Finanziamenti', aiuto: 'Rate di prestiti e acquisti a rate.' },
  vita: { label: 'Vita di tutti i giorni', aiuto: 'Spesa, bollette, scuola, sport, tempo libero.' },
}

export const scorta = {
  titolo: 'La vostra scorta',
  sottotitolo: 'Quello che ogni mese resta e puo’ diventare qualcosa.',
  mensile: 'al mese',
  annuale: 'in un anno',
  percentuale: 'di quello che entra',
} as const

export const scortaTesti: Record<LivelloScorta, { titolo: string; testo: string }> = {
  impegnata: {
    titolo: 'Oggi le risorse sono tutte al lavoro',
    testo:
      'Tutto quello che entra ha gia’ un compito. E’ una fotografia, non un giudizio: e’ esattamente da qui che si parte per capire cosa vale la pena proteggere per primo.',
  },
  esile: {
    titolo: 'Una scorta sottile, ma c’e’',
    testo: 'Ogni mese resta qualcosa. Poco, e proprio per questo prezioso: e’ il margine da cui si comincia.',
  },
  solida: {
    titolo: 'Una scorta solida',
    testo: 'Ogni mese il granaio si riempie di una quota costante. E’ lo spazio con cui si costruisce.',
  },
  abbondante: {
    titolo: 'Una scorta abbondante',
    testo: 'Resta molto piu’ dello stretto necessario. C’e’ ampio margine di scelta.',
  },
}

// ---------------------------------------------------------------- fase 4

export const fortezza = {
  domanda_prefisso: 'Ce l’avete?',
  nota: 'Appunto (resta a te)',
  nota_placeholder: 'Compagnia, massimale, cosa verificare…',
  nota_aggiungi: 'Prendi un appunto',
  cinta_completata: 'Cinta completata',
  prossima_cinta: 'Passiamo alla cinta successiva',
  torna_voce: 'Torna a questa voce',
  rivedi_cinta: 'Rivedi questa cinta',
  avanzamento: 'Voce {n} di {tot}',
} as const

export const statiVoce: Record<StatoVoce, string> = {
  presente: 'Ce l’ho',
  assente: 'Non ce l’ho',
  non_so: 'Non lo so',
}

export const blocchi: Record<BloccoKey, { nome: string; titolo: string; intro: string }> = {
  mastio: {
    nome: 'Il mastio',
    titolo: 'Tutela della famiglia',
    intro:
      'La torre piu’ alta, quella al centro. Protegge le persone: che la vita di chi resta continui come prima, qualunque cosa succeda a chi la sostiene.',
  },
  salute: {
    nome: 'La seconda cinta',
    titolo: 'Tutela della salute',
    intro:
      'Il muro che sta subito fuori dal mastio. Protegge il corpo e la possibilita’ di curarlo scegliendo, senza dover fare i conti.',
  },
  risparmio: {
    nome: 'La terza cinta',
    titolo: 'Tutela del risparmio e del futuro finanziario',
    intro:
      'Il muro che guarda avanti. Protegge quello che mettete da parte e il tenore di vita degli anni che verranno.',
  },
  perimetro: {
    nome: 'La cinta perimetrale',
    titolo: 'Tutela dei beni',
    intro:
      'Il muro piu’ esterno. Protegge le cose: la casa, quello che c’e’ dentro, e voi da quello che potreste combinare senza volerlo.',
  },
}

/**
 * Per ogni voce: il nome umano (mai la sigla nuda), la domanda che il consulente
 * legge, e una riga che dice da cosa protegge.
 */
export const vociFortezza: Record<string, { nome: string; sigla?: string; domanda: string; protegge: string }> = {
  tcm: {
    nome: 'Una polizza che protegge chi resta',
    sigla: 'TCM — Temporanea Caso Morte',
    domanda: 'Avete una polizza che lascia un capitale alla famiglia se venisse a mancare chi porta il reddito?',
    protegge:
      'Tiene in piedi il tenore di vita di casa — mutuo, scuola, spesa — anche senza lo stipendio di chi oggi lo sostiene.',
  },
  ltc: {
    nome: 'Una copertura per l’autosufficienza',
    sigla: 'LTC — Long Term Care, assistenza a lungo termine',
    domanda: 'Avete qualcosa che paga l’assistenza se un giorno non foste piu’ autosufficienti?',
    protegge:
      'Paga chi vi aiuta nei gesti di ogni giorno, per tutta la vita, senza che il peso ricada sui figli.',
  },
  critical_illness: {
    nome: 'Un capitale alla diagnosi',
    sigla: 'Critical Illness — malattie gravi',
    domanda: 'Avete una copertura che vi versa un capitale subito, alla diagnosi di una malattia importante?',
    protegge:
      'Vi mette in mano dei soldi liberi nel momento in cui servono: per curarvi dove volete e per fermarvi il tempo che serve.',
  },
  invalidita_permanente_grave: {
    nome: 'Una copertura se non si potesse piu’ lavorare',
    sigla: 'Invalidita’ permanente grave',
    domanda: 'Avete qualcosa che sostituisce il reddito se non poteste piu’ svolgere il vostro lavoro?',
    protegge: 'Prende il posto dello stipendio, cosi’ la vita di casa va avanti con gli stessi numeri.',
  },
  rimborso_spese_mediche: {
    nome: 'Il rimborso delle spese mediche',
    domanda: 'Avete una copertura che vi rimborsa visite, esami e cure?',
    protegge: 'Vi lascia scegliere dove e quando curarvi, senza guardare il preventivo.',
  },
  grandi_interventi: {
    nome: 'La copertura per i grandi interventi',
    domanda: 'Avete una copertura per ricoveri e interventi importanti?',
    protegge: 'Copre le spese grosse: sala operatoria, degenza, il periodo prima e dopo.',
  },
  ipi_infortunio: {
    nome: 'La copertura infortuni',
    sigla: 'IPI — Invalidita’ Permanente da Infortunio',
    domanda: 'Avete una polizza infortuni, dentro e fuori dal lavoro?',
    protegge:
      'Vi versa un capitale se un incidente lascia un segno permanente, proporzionato a quanto pesa nella vostra vita.',
  },
  assistenza: {
    nome: 'L’assistenza',
    domanda: 'Avete un servizio che vi organizza aiuto pratico nei momenti difficili?',
    protegge:
      'Manda qualcuno: un medico al telefono, un infermiere a casa, un passaggio in ospedale. Toglie la parte faticosa dell’organizzare.',
  },
  pip: {
    nome: 'La pensione che vi costruite voi',
    sigla: 'PIP — Piano Individuale Pensionistico',
    domanda: 'State mettendo da parte qualcosa per la pensione, oltre a quella pubblica?',
    protegge: 'Costruisce il tenore di vita del tempo libero, quello che arrivera’ dopo il lavoro.',
  },
  pac: {
    nome: 'Un versamento costante ogni mese',
    sigla: 'PAC — Piano di Accumulo del Capitale',
    domanda: 'Avete un piano che mette via una cifra fissa ogni mese?',
    protegge: 'Trasforma la scorta mensile in un capitale, senza doverci pensare ogni volta.',
  },
  premi_unici: {
    nome: 'Il capitale gia’ messo a frutto',
    domanda: 'Avete somme gia’ investite in un’unica soluzione?',
    protegge: 'Fa lavorare quello che avete gia’ da parte, invece di lasciarlo fermo.',
  },
  rc_capofamiglia: {
    nome: 'La responsabilita’ civile della famiglia',
    sigla: 'RC capofamiglia',
    domanda: 'Avete una copertura per i danni che voi o i vostri familiari potreste causare ad altri?',
    protegge:
      'Paga al posto vostro quando succede un guaio involontario: il pallone nella vetrina, il cane che scappa, l’acqua che passa al piano di sotto.',
  },
  casa: {
    nome: 'La casa',
    domanda: 'Avete una polizza sulla casa e su quello che c’e’ dentro?',
    protegge: 'Rimette a posto le mura e le cose dopo un incendio, un allagamento, un furto.',
  },
  tutela_legale: {
    nome: 'La tutela legale',
    domanda: 'Avete una copertura che paga avvocato e spese legali?',
    protegge: 'Vi lascia far valere le vostre ragioni senza dover pesare quanto costa farlo.',
  },
}

// ---------------------------------------------------------------- fase 5

export const situazioneOggi = {
  domanda: 'Come ti fa sentire questa situazione?',
  aiuto: 'Non c’e’ una risposta giusta. Qui parla lui.',
  risposta_placeholder: 'Scrivi con le sue parole…',
  emozioni_titolo: 'Scegliete fino a tre parole',
  emozioni_aiuto: 'Quelle che gli somigliano di piu’ in questo momento.',
  richiesta_risposta: 'Prima di andare avanti, scrivi cosa ti ha detto.',
} as const

export const cittadellaCompleta = {
  titolo: 'Questa e’ la cittadella intera',
  testo:
    'Tutte le mura al loro posto. Non e’ un obiettivo e quasi nessuno la vuole tutta: serve solo per avere un metro, per capire dove siete rispetto al massimo possibile.',
  nota: 'Guardatela un momento. Poi torniamo alla vostra.',
} as const

export const desiderato = {
  domanda: 'Ma tu, come vorresti sentirti?',
  aiuto: 'E’ la domanda che conta. Prenditi il tempo di ascoltare tutta la risposta.',
  risposta_placeholder: 'Scrivi con le sue parole…',
  emozioni_titolo: 'Scegliete fino a tre parole',
  emozioni_aiuto: 'Come vorrebbe sentirsi.',
  priorita_titolo: 'Da dove vorrebbe cominciare',
  priorita_aiuto:
    'Toccate insieme le parti ancora da costruire che sente piu’ sue. Anche nessuna va benissimo.',
  priorita_scelte: '{n} scelte',
  richiesta_risposta: 'Prima di chiudere, scrivi cosa ti ha detto.',
} as const

export interface Emozione {
  key: string
  label: string
  famiglia: 'serena' | 'tesa'
}

export const emozioni: readonly Emozione[] = [
  { key: 'sereno', label: 'Sereno', famiglia: 'serena' },
  { key: 'protetto', label: 'Protetto', famiglia: 'serena' },
  { key: 'tranquillo', label: 'Tranquillo', famiglia: 'serena' },
  { key: 'fiducioso', label: 'Fiducioso', famiglia: 'serena' },
  { key: 'leggero', label: 'Leggero', famiglia: 'serena' },
  { key: 'in_pace', label: 'In pace', famiglia: 'serena' },
  { key: 'in_dubbio', label: 'In dubbio', famiglia: 'tesa' },
  { key: 'esposto', label: 'Esposto', famiglia: 'tesa' },
  { key: 'in_attesa', label: 'In attesa', famiglia: 'tesa' },
  { key: 'preoccupato', label: 'Preoccupato', famiglia: 'tesa' },
  { key: 'sospeso', label: 'Sospeso', famiglia: 'tesa' },
  { key: 'di_corsa', label: 'Sempre di corsa', famiglia: 'tesa' },
] as const

export const chiusura = {
  titolo: 'Ci sentiamo entro pochi giorni',
  testo:
    'Da qui in avanti tocca a me. Entro 48-72 ore vi porto due o tre strade possibili, costruite su quello che mi avete appena detto di voler sentire.',
  nota: 'Oggi non c’e’ niente da decidere e niente da firmare.',
  concludi: 'Chiudi la sessione',
  conclusa_titolo: 'Sessione conclusa',
  conclusa_testo: 'Da adesso la sessione e’ in sola lettura. Trovi qui sotto tutto il materiale.',
  riapri: 'Riapri la sessione',
  riapri_conferma: 'Riaprire la sessione? Torna modificabile.',
} as const

// ---------------------------------------------------------------- output

export const output = {
  titolo: 'Il materiale di questo incontro',
  pdf_consulente: 'Il tuo dossier completo',
  pdf_consulente_nota: 'Tutto: numeri, mappa delle mura, appunti e le due risposte parola per parola.',
  pdf_cliente: 'Le due pagine per la famiglia',
  pdf_cliente_nota: 'Da inviare dopo l’incontro. Nessun importo, nessuna cifra.',
  json: 'Export dei dati',
  json_nota: 'Il file strutturato da dare ai tuoi strumenti di lavoro.',
  stampa: 'Stampa o salva in PDF',
  torna: 'Torna alla sessione',
} as const

export const report = {
  consulente_titolo: 'Dossier di consulenza',
  cliente_titolo: 'La vostra cittadella',
  composizione: 'La famiglia',
  posizione: 'Dove siete nel ciclo della vita',
  quadro: 'Entrate, uscite e capacita’ di risparmio',
  mappa: 'La mappa delle mura',
  mappa_scena: 'La cittadella com’e’ oggi',
  parole: 'Le loro parole',
  parole_oggi: 'Come si sente oggi',
  parole_domani: 'Come vorrebbe sentirsi',
  priorita: 'Da dove vorrebbe cominciare',
  appunti: 'Appunti',
  cliente_chiusura: 'Fra 48-72 ore arrivano due o tre strade possibili, costruite su queste parole.',
  nessuna_nota: '—',
  generato_il: 'Incontro del',
} as const
