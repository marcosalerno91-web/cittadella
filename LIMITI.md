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

## 4. Le policy RLS non sono ancora state eseguite

`supabase/migrations/0001_init.sql` e `supabase/tests/isolamento.sql` sono
scritti ma **non sono mai girati su un Postgres**: su questa macchina non ci
sono Docker, CLI Supabase o psql, e non c'e' un progetto Supabase a cui
collegarsi.

L'isolamento e' invece stato eseguito e verificato sul driver locale, che
applica le stesse condizioni: dieci prove su dieci, visibili su `/dev/isolamento`.

**Prima di andare in produzione**: eseguire `0001_init.sql`, poi
`isolamento.sql`, e leggere i NOTICE. Devono essere tutti `PASSA`.

## 5. Deploy su Vercel non effettuato

Non ho credenziali Vercel ne' un repository GitHub remoto. Il progetto e' un
repository git locale con tre commit, la build di produzione passa
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
