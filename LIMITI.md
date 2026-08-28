# Cosa e' rimasto fuori dalla v1

In cima le cose da affrontare **prima** di aprire l'applicazione a intermediari
esterni. Sotto, quello che puo' aspettare.

---

## 1. Privacy policy e consenso raccolti dentro l'applicazione — bloccante

**Stato oggi.** In v1 il trattamento e' coperto dalla privacy che il consulente
gia' raccoglie in studio. Nell'applicazione c'e' solo una spunta con cui il
consulente dichiara di averlo fatto, e quella spunta **non viene registrata come
prova**: non ha data, non ha versione del testo, non ha l'identita' di chi
l'ha messa.

**Cosa serve in v2, prima di aprire a terzi.**

- Testo di informativa versionato, mostrato per esteso e archiviato con la
  versione al momento della conferma.
- Registro dei consensi: chi, quando, quale versione, per quale nucleo.
- Ruolo dell'agenzia come titolare e del fornitore come responsabile del
  trattamento, con nomina scritta.
- Diritto di cancellazione: oggi non c'e' modo di eliminare un nucleo e tutta la
  sua sessione. Serve una cancellazione reale, a cascata, tracciata.
- Conservazione: oggi i dati restano per sempre. Serve una scadenza dichiarata.
- Registro dei trattamenti e informativa ai clienti finali dell'agenzia.

Finche' questo non c'e', l'applicazione va usata solo da chi la privacy la
raccoglie gia' per conto proprio, ed e' quello che il consulente dichiara con la
spunta.

## 2. Ingresso libero — bloccante per il multi-tenant

Chiunque puo' registrarsi e crearsi un'agenzia. Va bene finche' gli utenti sono
conosciuti uno per uno; non va bene appena si apre.

Serve: registrazione a invito, con l'agenzia gia' decisa da chi invita; un ruolo
di titolare che invita i propri consulenti; conferma dell'email obbligatoria.
La funzione `public.registra_advisor()` e' gia' il punto unico da cui passa la
creazione, quindi il cambio e' circoscritto.

## 3. Un consulente vede solo i propri clienti, e basta

Le policy attuali dicono `agency_id = agenzia corrente AND advisor_id = auth.uid()`.
Il titolare di agenzia **non** vede i nuclei dei suoi consulenti. Il brief
chiedeva questo come comportamento predefinito, ma in un'agenzia vera servira'
una condivisione esplicita: un flag sul cliente, o un ruolo che allarga la
visibilita' a tutta l'agenzia.

## 4. Le policy RLS: ora c'e' una guardia, ma va comunque eseguita la migration

`supabase/migrations/0001_init.sql`, `supabase/migrations/0002_cittadella_desiderata.sql`
e `supabase/tests/isolamento.sql` sono scritti. Se sono gia' stati eseguiti sul
progetto Supabase, questo punto e' chiuso; altrimenti resta aperto.

**La 0002 va eseguita anche su un database gia' migrato con la 0001**: aggiunge
`fortress_items.desiderata`, senza la quale la fase del desiderato non salva
nulla. E' idempotente.

Dalla v1.1 il caso pericoloso non e' piu' silenzioso: se le credenziali
Supabase sono impostate ma le policy non ci sono, **l'applicazione non parte** e
mostra quale tabella e' scoperta e quale file eseguire (`src/lib/db/guardia-rls.ts`).

**La prova e' stata eseguita su Postgres il 28 agosto 2026** e ha trovato un
difetto — nel test, non nelle policy. La prova "Beta non si sposta di agenzia"
si aspettava un'eccezione, ma su `advisors` non c'e' alcuna policy di UPDATE
(e' voluto) e in quel caso Postgres non solleva: l'update non trova righe
aggiornabili e ne cambia zero. Corretto contando `row_count` come nelle altre
prove di scrittura. L'errore finale ora elenca i nomi delle prove fallite,
perche' nel SQL editor i NOTICE si perdono facilmente.

Resta da verificare su un Postgres vero il ramo piu' sottile della guardia:
database raggiungibile, funzione presente, **una sola** policy mancante. Il caso
del fallimento totale e' stato provato; questo percorre lo stesso codice ma non
e' mai stato eseguito. Si prova in un minuto:

```sql
drop policy clients_rw on public.clients;   -- l'applicazione deve rifiutarsi di partire
-- poi rieseguire 0001_init.sql per rimetterla
```

L'isolamento e' comunque stato eseguito e verificato sul driver locale, che
applica le stesse condizioni: dieci prove su dieci, su `/dev/isolamento`.

## 5. Deploy su Vercel non effettuato

Non ho credenziali Vercel ne' un repository GitHub remoto. Il progetto e' un
repository git locale, la build di produzione passa
(`npm run build`) e non c'e' nulla di specifico della macchina.

Per completare: creare il repository `cittadella` su GitHub, collegarlo a
Vercel, impostare `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
fra le variabili del progetto, e ripercorrere il flusso completo in produzione.
Le pagine `/dev/*` si spengono da sole quando `NODE_ENV=production`.

---

## Cose piu' piccole, in ordine di fastidio

### PDF generati dal browser

I due report si esportano con `Cmd/Ctrl+P`. Funziona e le scene SVG vengono
perfette, ma dipende dal browser del consulente: margini e interruzioni di
pagina possono cambiare fra Chrome e Safari. Ho controllato l'impaginazione a
video, non su carta stampata da entrambi.

Il passo successivo e' una generazione server-side, che le route sono gia'
pronte a ricevere: cambia il trasporto, non la pagina. Fuori dalla v1 perche' un
browser headless costa RAM in sviluppo e complessita' in deploy.

### Due advisory npm che restano aperte

`postcss` annidato dentro `next` (moderata) e una dipendenza transitiva
collegata. Si chiudono solo passando a Next 16, che il brief esclude. Sono
vulnerabilita' di build, non di runtime dell'applicazione servita.

### Un solo set di espressioni

Gli avatar sorridono e basta. L'API e' gia' predisposta (`Espressione` in
`src/lib/avatar/tipi.ts`), ma il set alternativo non c'e'.

### La riga del movimento e' una frase composta a mano

`leggiSpostamento()` costruisce la frase concatenando conteggi e verbi. Regge i
casi che si presentano davvero (una, due o tre emozioni per lato), ma non e'
una vera generazione di linguaggio: con elenchi molto diversi da quelli attuali
puo' produrre frasi legnose. Sta tutta in `src/lib/engine/emozioni.ts`, in
venti righe, ed e' facile da riscrivere.

### Gli elenchi delle emozioni sono provvisori

Le due griglie in `copy.ts` sono quelle indicate dal consulente. Quando
cambieranno, le chiavi delle sessioni gia' salvate non corrisponderanno piu':
l'applicazione le ignora e la griglia resta usabile, ma quelle scelte sono
perse. Non c'e' nessuna migrazione delle chiavi, e non ha senso costruirla
finche' gli elenchi non si stabilizzano.

### La figura dedotta dal nome sbaglia sui nomi stranieri

L'euristica conosce le desinenze italiane e due liste corte di eccezioni. Su
"Kevin", "Deborah" o "Andrea" scritto da un tedesco indovina per caso. Si
corregge con un tocco e il controllo sta sempre in vista, ma su una clientela
non italiana andra' rifatta — o tolta, lasciando una figura predefinita.

### Le etichette della mappa sono posizionate a mano

Ogni costruzione ha un suo scostamento fisso per il nome, scelto guardando le
dodici scene di `/dev/fortezza`. Non c'e' nessun algoritmo che eviti le
sovrapposizioni: cambiando un raggio o aggiungendo una voce alle mura, le
etichette vanno ricontrollate a occhio. Con quattordici voci e' sostenibile;
a venti non lo sarebbe piu'.

### La larghezza delle etichette e' stimata dai caratteri

Per non farle uscire dall'inquadratura, il campo tiene conto della larghezza
del testo stimata a 11 unita' per carattere. E' un'approssimazione: con un nome
molto largo o molto stretto il margine sara' sbagliato di poco.

### Il granaio della fase 3 e quello della cittadella sono due disegni

Hanno lo stesso corpo di legno, lo stesso tetto corallo e la stessa porta ad
arco, e il cliente li riconosce come lo stesso edificio — ma sono due
componenti separati, uno di fronte e uno in assonometria. Cambiando l'aspetto
del granaio vanno toccati entrambi.

### La cittadella desiderata non distingue "voglio" da "mi serve"

`desiderata` e' un booleano. Non c'e' modo di registrare che il cliente vuole
una cosa **molto** e un'altra **se avanza**, ne' di ordinare le scelte per
importanza. In sala il consulente lo scrive nelle note della voce. Se servira'
una graduazione, andra' aggiunta come colonna separata: il booleano resta
com'e', perche' e' quello che il cliente tocca.

### Le costruzioni sono lo stesso disegno per tutte le fasce d'eta'

Le torri, i muri e gli edifici non cambiano con niente: sono fissi nella
pianta. E' voluto — la cittadella e' una sola — ma significa che non c'e' modo
di dare a un nucleo una citta' diversa da un altro se non attraverso le
risposte.

### Nessun test automatico

Il collaudo e' stato fatto a mano nel browser con la famiglia demo, come chiede
il brief, e le due pagine `/dev/*` sono verifiche eseguibili. Non ci sono unit
test sul motore CRM ne' sul motore fortezza: sono funzioni pure e sarebbero i
primi candidati.

### Il driver locale non regge la concorrenza vera

Riscrive un singolo file JSON serializzando le scritture su una catena di
promise. Va bene per un consulente su una macchina; non e' pensato per altro. In
produzione si usa Supabase.

### Riordino del nucleo solo con i pulsanti

"Sposta prima" e "Sposta dopo". Niente trascinamento: su uno schermo condiviso a
due mani il drag and drop e' piu' facile da sbagliare che da usare.

### Nessuna gestione delle sessioni multiple per cliente

Il modello le prevede (`sessions.client_id`) e la lista mostra sempre l'ultima,
ma non c'e' schermata per vedere lo storico di un nucleo o confrontare due
incontri a distanza di un anno. E' la cosa piu' ovvia da aggiungere dopo.

### Accessibilita' provata solo in parte

Contrasti, dimensioni dei tocchi (48 px), focus visibile e `prefers-reduced-motion`
ci sono. Non ho provato l'applicazione con uno screen reader ne' completato un
percorso interamente da tastiera.
