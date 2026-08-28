# Cittadella — stato del progetto

Aggiornato al **28 agosto 2026**.

Questo file dice a che punto siamo e cosa manca. Le decisioni prese e il perche'
stanno in `DECISIONI.md`; i limiti noti in `LIMITI.md`; come si avvia e come e'
fatto in `README.md`.

---

## In una riga

L'applicazione e' completa e collaudata, e' su GitHub e gira in produzione su
Vercel. **Manca un solo passaggio perche' sia usabile con un cliente vero: le
migration SQL sul database.** Finche' non vengono eseguite, l'applicazione in
produzione si rifiuta di partire e lo dice.

---

## Indirizzi

| Cosa | Dove |
|---|---|
| Repository | https://github.com/marcosalerno91-web/cittadella (privato) |
| Produzione | https://cittadella-ruby.vercel.app |
| Progetto Supabase | `https://fdrlgqyorrwwxdjnpstu.supabase.co` |
| Sviluppo | `cd ~/Progetti/cittadella && npm run dev` → http://localhost:3000 |

---

## IL PROSSIMO PASSO — una scelta sulla conferma email

**Le migration sono state eseguite** (28 agosto 2026) e le otto tabelle sono
protette. La produzione supera le due guardie e mostra la schermata di accesso.

Resta una scelta da fare sul progetto Supabase: **Authentication → Providers →
Email → "Confirm email"** e' attivo.

- **Se lo lasci attivo**: chi si registra riceve una email, la conferma, poi
  torna e accede. Funziona (l'applicazione crea la riga advisor al primo
  accesso riuscito), ma serve una casella vera e per ora la registrazione
  end-to-end non e' mai stata completata fino in fondo.
- **Se lo spegni**: la registrazione entra dritta, come in sviluppo. Ha senso
  finche' gli intermediari sono conosciuti uno per uno. Da riaccendere prima di
  aprire a terzi, insieme alla registrazione a invito (punto 4).

## Le migration — fatto

**Chi lo fa: Marco.** Serve accesso al dashboard Supabase, che l'assistente non ha.

Dashboard Supabase → **SQL Editor** → incolla ed esegui **in quest'ordine**:

1. `supabase/migrations/0001_init.sql` — schema, policy RLS, funzioni
2. `supabase/migrations/0002_cittadella_desiderata.sql` — la colonna `desiderata`
3. `supabase/tests/isolamento.sql` — la prova

Del terzo vanno letti i **NOTICE**: devono essere tutti `PASSA`. Gira dentro una
transazione che si annulla da sola e non lascia nulla nel database.

Sono tutti e tre idempotenti: si possono rieseguire senza danni.

**Esito:** eseguite. La prova di isolamento ha segnalato un fallimento che era
un difetto del test, non delle policy — corretto e ricommittato. Le otto tabelle
risultano protette con le policy attese.

**Resta da percorrere una consulenza intera in produzione**: registrarsi,
creare una famiglia, arrivare in fondo, scaricare i due PDF e l'export. Non e'
stato possibile farlo perche' la conferma via email richiede una casella vera.

---

## Fatto

### Il prodotto
- **Otto fasi** di consulenza: nucleo, ciclo di vita, entrate e uscite, le quattro
  cinte della fortezza, la situazione di oggi, la cittadella completa, il
  desiderato, la chiusura
- **Motore avatar** SVG proprietario: 21 professioni + fallback, due figure per
  quattro fasce d'eta', tre lunghezze di capelli, quattro incarnati
- **La cittadella in pianta assonometrica**: quattro generi di architettura —
  mastio e torri, mura interne ad anello, cortile con pozzo/granaio/deposito,
  cinta esterna con portone e fossato
- **La cittadella desiderata**: il cliente tocca le costruzioni che vuole e si
  alzano in colore sole. E' la funzione centrale del prodotto
- **Le emozioni a carte**: due insiemi distinti, massimo tre scelte, il metadato
  di direzione riemerge solo nel dossier come riga del movimento
- **Tre artefatti** dalla sessione conclusa: dossier del consulente (4 fogli A4),
  due pagine per la famiglia senza alcuna cifra, export JSON versionato 1.1.0

### L'infrastruttura
- Next.js 15.5.24, TypeScript strict, Tailwind 4. Zero librerie oltre a Supabase
- Doppio driver dati dietro un solo `Repository`: Supabase in produzione, file
  locale in sviluppo. Il resto del codice non sa quale sta usando
- **Due guardie che impediscono all'applicazione di partire e fare danni**:
  senza credenziali in produzione (girerebbe su disco effimero perdendo i dati),
  e senza policy RLS (girerebbe senza isolamento fra agenzie)
- Salvataggio continuo con copia locale: provato staccando la rete in corsa, la
  risposta data offline arriva al database da sola al rientro
- Pagine `/dev/*` bloccate nel middleware in produzione

### Verificato a mano nel browser
- Flusso completo con la famiglia demo, dalla registrazione ai due PDF
- I 14 stati della fortezza combaciano con `seed/famiglia-demo.json`
- CRM: 700 €/mese, 12%, "scorta solida" — calcolo confrontato a mano
- Le sei combinazioni di avatar su tutte e quattro le fasce d'eta'
- Dodici stati della cittadella su `/dev/fortezza`
- Isolamento fra agenzie: dieci prove su dieci sul driver locale
- Scelte del desiderato: toccate, salvate, ricaricata la pagina, ancora li'
- Due pagine per il cliente: nessuna cifra a parte l'anno nella data

---

## Da fare

### Bloccante prima di usarlo con un cliente
1. **Decidere sulla conferma email** (sopra)
2. **Percorrere una consulenza intera in produzione** — mai fatto end-to-end

### Bloccante prima di aprirlo ad altri intermediari
3. **Privacy policy e consenso dentro l'applicazione.** Oggi c'e' solo una
   spunta con cui il consulente dichiara di aver raccolto il consenso, e quella
   spunta non viene registrata come prova. Serve informativa versionata, registro
   dei consensi, cancellazione a cascata, scadenza dichiarata. Dettagli in
   `LIMITI.md`, punto 1
4. **Registrazione a invito.** Oggi chiunque puo' registrarsi e crearsi
   un'agenzia. Va bene finche' gli utenti sono conosciuti uno per uno

### Comodo, non urgente
5. **Collegare GitHub a Vercel** per il deploy automatico a ogni push. Il
   tentativo dalla CLI e' fallito: la GitHub App di Vercel non e' autorizzata
   sull'account `marcosalerno91-web`. Si fa dal dashboard Vercel → progetto
   `cittadella` → Settings → Git → Connect Git Repository. Nel frattempo si
   pubblica con `vercel --prod`
6. **Il ramo non provato della guardia RLS.** Il caso "database raggiungibile ma
   una sola policy mancante" percorre lo stesso codice del fallimento totale, ma
   non e' mai stato eseguito. Si prova in un minuto:
   `drop policy clients_rw on public.clients;` → l'applicazione deve rifiutarsi
   di partire → poi rieseguire `0001_init.sql`
7. **Gli elenchi definitivi delle emozioni.** Quelli attuali sono le due griglie
   indicate; quando cambieranno, le chiavi delle sessioni gia' salvate non
   corrisponderanno piu' e quelle scelte saranno perse
8. **Il titolare di agenzia non vede i nuclei dei suoi consulenti.** Voluto in
   v1, ma in un'agenzia vera servira' una condivisione esplicita
9. **PDF generati dal browser.** Funzionano, ma margini e interruzioni possono
   cambiare fra Chrome e Safari. Le route sono pronte per una generazione
   server-side: cambia il trasporto, non la pagina
10. **Nessun test automatico.** Il motore CRM e quello della fortezza sono
    funzioni pure e sarebbero i primi candidati

---

## Dove si mette le mani

| Cosa vuoi cambiare | File |
|---|---|
| Qualsiasi parola a schermo, elenchi delle emozioni compresi | `src/content/copy.ts` |
| Soglie CRM, eta' di confine, voci delle mura, tempi | `src/config/engine.ts` |
| La planimetria della cittadella | `src/components/scena/pianta.ts` |
| I disegni delle costruzioni | `src/components/scena/costruzioni.tsx` |
| I mestieri e i loro accessori | `src/lib/avatar/professioni.tsx` |
| Lo schema dell'export | `src/lib/export.ts` + `docs/export-schema.md` |

Aggiungere una voce alle mura: una chiave in `engine.ts`, il suo testo in
`copy.ts`, la sua posizione in `pianta.ts`. Le sessioni gia' aperte la vedono
comparire vuota.

---

## Pagine di servizio

Esistono solo fuori produzione:

- `/dev/avatar` — le sei combinazioni e i 22 mestieri (`?grande=1`, `?solo=medico,operaio`)
- `/dev/fortezza` — la cittadella in dodici stati (`?solo=piena`, `?senzaEtichette=1`)
- `/dev/isolamento` — due agenzie che provano a sconfinare
