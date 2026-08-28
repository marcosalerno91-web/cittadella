# Cittadella

Strumento di consulenza per intermediari assicurativi, da usare **accanto al
cliente**, su un solo schermo condiviso.

Non e' un gestionale, non e' un preventivatore, non e' un questionario. E'
un'esperienza visiva guidata che porta una famiglia a vedersi rappresentata, a
capire dove si trova nella propria vita, a scoprire quanto la propria cittadella
e' gia' protetta e — soprattutto — a dire ad alta voce come vorrebbe sentirsi.

La consulenza finisce senza vendere nulla. Il consulente esce con due PDF e un
export JSON, e si prende 48-72 ore per preparare due o tre prospetti.

## Avvio rapido

```bash
npm install
npm run dev
```

Si apre su <http://localhost:3000>. Senza variabili d'ambiente l'applicazione
parte in **modalita' locale**: i dati finiscono in `.data/cittadella.json` e non
serve alcun servizio esterno. Crea un accesso dalla schermata di ingresso e
comincia.

Comandi:

| Comando | Cosa fa |
|---|---|
| `npm run dev` | server di sviluppo |
| `npm run build` | build di produzione |
| `npm run typecheck` | `tsc --noEmit`, TypeScript in strict mode |
| `npm run lint` | ESLint su `src/` |

## Variabili d'ambiente

Copia `.env.example` in `.env.local`. Sono tutte facoltative in sviluppo.

| Variabile | Serve a |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chiave pubblica del progetto |
| `SUPABASE_SERVICE_ROLE_KEY` | solo per script di amministrazione. **Mai** su Vercel se non serve |
| `CITTADELLA_LOCAL_DATA_DIR` | cartella del driver locale (default `.data`) |

Quando le prime due sono presenti, l'applicazione usa Supabase (Postgres + Auth +
RLS). Quando non lo sono, usa il driver su file. La scelta avviene in
`src/lib/db/index.ts` e il resto del codice non sa quale dei due sta usando.

## Preparare Supabase

1. Crea un progetto su Supabase.
2. Nel SQL editor, esegui `supabase/migrations/0001_init.sql`. E' idempotente:
   si puo' rieseguire.
3. Esegui `supabase/tests/isolamento.sql` e leggi i NOTICE: devono essere tutti
   `PASSA`. Gira dentro una transazione che si annulla da sola.

   Se salti il passo 2, l'applicazione **non parte**: al suo posto compare la
   pagina che dice quale tabella e' scoperta. Le query non filtrano per agenzia
   di proposito — a tenere separati i consulenti sono le policy — quindi girare
   senza e' l'unico modo per fare danni davvero.
4. In Authentication → Providers, tieni attivo solo Email.
5. Metti `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
   `.env.local` (e fra le variabili del progetto su Vercel).

**Non eseguire mai `supabase config push`.**

## Struttura

```
src/
  app/
    accedi/                    accesso e registrazione del consulente
    clienti/                   elenco famiglie, apertura sessione con consenso
    sessione/[id]/             la consulenza: macchina a stati delle otto fasi
    report/[sessionId]/
      consulente/              dossier completo, quattro fogli A4
      cliente/                 due pagine per la famiglia, senza cifre
    api/sessione/[id]/export/  export JSON versionato
    dev/avatar/                le sei combinazioni e le 22 figure
    dev/fortezza/              la cittadella in ogni stato possibile
    dev/isolamento/            prova di isolamento fra agenzie
  components/
    fasi/                      una fase, un componente
    scena/                     Avatar, RitrattoDiGruppo, Granaio
      pianta.ts                la planimetria della cittadella
      costruzioni.tsx          torri, muri, pozzo, granaio, portone, fossato
      Fortezza.tsx             la scena che li assembla
    ui/                        i componenti di base, scritti a mano
  config/engine.ts             TUTTI i parametri del motore
  content/copy.ts              TUTTI i testi che finiscono a schermo
  lib/
    avatar/                    motore avatar SVG a strati
    db/                        Repository, driver Supabase e driver locale
    engine/                    CRM, fortezza, ciclo di vita
supabase/
  migrations/0001_init.sql     schema + RLS
  tests/isolamento.sql         prova delle policy
seed/famiglia-demo.json        il nucleo con cui si collauda il flusso
docs/export-schema.md          contratto dell'export
```

## I due file da cui si tara tutto

- **`src/content/copy.ts`** — ogni parola che compare a schermo. Si riscrive da
  cima a fondo senza toccare una riga di logica.
- **`src/config/engine.ts`** — eta' di confine del ciclo di vita, soglie della
  scorta, ordine e peso delle cinte, elenco delle voci della fortezza, tempi
  delle animazioni.

Aggiungere una voce alle mura significa aggiungere una chiave in `engine.ts` e
il suo testo in `copy.ts`. Le sessioni gia' aperte la vedono comparire vuota
(`fortezzaAllineata` in `src/lib/db/defaults.ts`).

## I due PDF

Sono route HTML con CSS di stampa A4, esportate con la stampa del browser
(`Cmd/Ctrl+P` → "Salva come PDF"). Gli avatar e le scene sono gia' SVG, quindi
vengono perfetti a qualsiasi risoluzione.

- `/report/<sessionId>/consulente` — resta a lui: numeri, mappa delle mura voce
  per voce con le sue note, le due risposte citate parola per parola, spazio
  bianco per gli appunti.
- `/report/<sessionId>/cliente` — due pagine da inviare dopo l'incontro. Nessun
  dato economico, nessun importo, nessuna cifra.

Le route sono scritte in modo che passare a una generazione server-side sia solo
un cambio di trasporto: la pagina non cambia.

## Collaudo

`seed/famiglia-demo.json` contiene il nucleo con cui si percorre il flusso a
mano. Non e' un fixture automatico: e' il copione da seguire nel browser.

`/dev/avatar` mostra tutte le figure insieme (`?grande=1` le ingrandisce,
`?solo=medico,operaio` ne isola alcune).

`/dev/fortezza` genera la cittadella in dodici stati diversi — vuota, un blocco
alla volta, tutta piena, tutta "non lo so", con le priorita' toccate. Si
guardano tutti prima di toccare la geometria.

`/dev/isolamento` crea due agenzie e prova a farle sconfinare. Tutte e tre le
pagine esistono solo fuori produzione.

## Vincoli del prodotto

- L'applicazione **non consiglia**: niente calcoli di premio, niente confronti di
  prodotto, niente suggerimenti automatici. Mostra.
- Niente punteggi, voti o percentuali di sicurezza mostrati al cliente.
- Niente linguaggio della paura, del rischio, della perdita.
- Niente sigle nude: ogni sigla ha accanto la sua traduzione umana.
- Nessun dato sensibile, sanitario, documentale o finanziario analitico nel
  database: solo importi medi mensili aggregati.
- Una sola domanda per schermata.
