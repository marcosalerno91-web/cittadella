# Decisioni prese in autonomia

Dove il brief lasciava spazio, ho deciso applicando il principio guida: *deve
funzionare in sala con un cliente vero, su un solo schermo, senza mai rompere
l'incantesimo*.

---

## D1 — Due driver dati dietro un solo Repository

**Contesto.** Il brief chiede Supabase. Su questa macchina non c'e' Docker, non
c'e' la CLI Supabase, non c'e' Postgres, e non ho credenziali di un progetto
Supabase. Senza persistenza non si puo' percorrere il flusso a mano, che e' la
condizione con cui il brief dichiara chiuso ogni step.

**Decisione.** Un'unica interfaccia `Repository` (`src/lib/db/types.ts`) con due
implementazioni: `supabase.ts`, completa e definitiva, e `local.ts`, su singolo
file JSON. La scelta avviene sulle variabili d'ambiente. Il resto del codice non
sa quale sta usando.

**Perche'.** Non e' un mock: e' un driver vero, con lo stesso contratto e lo
stesso isolamento, provato in `/dev/isolamento`. Rende l'applicazione
percorribile end-to-end oggi, e toglie una dipendenza pesante dalla macchina di
sviluppo da 8 GB. Il giorno in cui arrivano le credenziali si aggiungono due
righe in `.env.local` e non cambia nient'altro.

**Costo.** Due implementazioni da tenere allineate. Il contratto e' piccolo
(sedici metodi) e la firma le costringe a restare uguali.

## D2 — L'isolamento non e' filtrato nel codice, lato Supabase

Le query del driver Supabase **non** filtrano per `agency_id`: lo fa Postgres con
le policy RLS. Se una policy sparisse, il test di isolamento fallirebbe subito
invece di restare mascherato da un filtro applicativo. Nel driver locale, dove
Postgres non c'e', le stesse condizioni sono applicate a mano riga per riga.

## D3 — Registrazione via funzione SECURITY DEFINER

Per far registrare un consulente servivano policy di INSERT su `agencies` e
`advisors`. Aprirle avrebbe permesso a un utente autenticato di crearsi agenzie
a piacere e, peggio, di spostarsi nell'agenzia di un altro cambiando il proprio
`agency_id`.

Ho tolto ogni policy di scrittura su `advisors` e messo `public.registra_advisor()`,
SECURITY DEFINER, che crea agenzia e consulente solo per `auth.uid()` ed e'
idempotente. Nessuno puo' scegliersi un'agenzia altrui.

In v2 l'ingresso dovra' comunque diventare a invito (vedi `LIMITI.md`).

## D4 — Otto fasi, non cinque

Il brief descrive cinque fasi ma la quinta ha tre schermate distinte e la
chiusura e' una schermata a se'. La macchina a stati ne ha otto:
`nucleo, ciclo_vita, finanze, fortezza, situazione_oggi, cittadella_completa,
desiderato, chiusura`. Cosi' l'indicatore di avanzamento dice la verita' e la
ripresa di una sessione interrotta torna esattamente dov'era.

## D5 — L'inquadratura della cittadella si allarga da sola

Con quattro cinte in un riquadro fisso, all'inizio si vedeva un puntino in
mezzo al vuoto. La scena calcola il campo sulle costruzioni effettivamente
presenti: si parte stretti sulla famiglia e sul mastio e il campo si apre a
ogni blocco nuovo. I profili delle cinte escono dai bordi ed e' voluto: le
mura proseguono oltre la scena.

*Rivista nella v1.1 con il nuovo punto di vista (vedi C1), ma la regola e'
rimasta la stessa.*

## D6 — Le voci senza risposta sono tracciate a terra

Una costruzione non ancora affrontata si disegna come una traccia sul terreno,
la pianta di quello che occuperebbe. La citta' **cresce** mentre la famiglia
racconta cosa ha gia'. Era il modo piu' diretto per far leggere il progresso
senza mostrare un punteggio.

## D7 — Due coetanei stanno sullo stesso punto della curva

Nella fase 2, marito e moglie di 44 e 47 anni finiscono quasi sovrapposti. E'
giusto cosi': e' li' che si trovano. A non potersi sovrapporre sono i nomi, che
vengono impilati; e quando il punto e' troppo in basso il nome passa sopra la
testa invece di finire sotto l'asse.

## D8 — La professione si suggerisce, non si impone

Sotto i 6 anni la figura diventa `bambino`, sotto i 19 `studente`, dai 66
`tempo_libero`. Il suggerimento scatta **solo** se la professione attuale era a
sua volta un suggerimento: se il consulente ha scelto a mano, non si tocca piu'.

## D9 — L'aspetto viene dal nome, e quasi niente si puo' toccare

Digitando "Marta" l'avatar prende incarnato, colore dei capelli e figura in
modo deterministico dal nome. E' il momento "wow" della fase 1 e costa zero
clic.

*Ridotta nella v1.1 e corretta nella v1.2:* il nome decide **solo** la figura,
ed e' un tentativo che si corregge con un tocco. L'incarnato si sceglie. Il
colore dei capelli non ha comando ma non viene piu' dal nome: segue l'incarnato.

## D10 — Salvataggio continuo con copia locale

Ogni modifica finisce subito in `sessionStorage`, poi parte verso il server dopo
700 ms di pausa dalla digitazione. Se la rete cade si continua a riprovare ogni
4 secondi e la scena non si blocca: compare un cartiglio in basso che dice di
andare avanti. Provato staccando `fetch` in corsa: la risposta data offline e'
arrivata al database da sola al rientro della rete.

## D11 — Una risposta della fortezza blocca i clic per 260 ms

Dopo una risposta si passa alla voce successiva da soli. Senza un blocco, un
doppio tocco rispondeva due volte alla stessa voce e ne saltava una — l'ho
scoperto rispondendo in fretta durante il collaudo, con le risposte che
finivano tutte spostate di uno.

## D12 — I nomi degli hook restano in inglese

Tutto il codice e' in italiano, tranne il prefisso `use` degli hook React:
`useSalvataggio`, non `usaSalvataggio`. React riconosce gli hook dal prefisso,
e' una regola del linguaggio, non una scelta di stile.

## D13 — Coordinate SVG arrotondate a due decimali

Server e browser possono scrivere lo stesso numero in virgola mobile con
un'ultima cifra diversa, e React se ne lamenta in fase di idratazione. Tutte le
coordinate calcolate passano da `arrotonda()` prima di finire in un attributo.

## D14 — Nessuna libreria oltre lo stretto necessario

Niente `framer-motion`: le transizioni sono sei keyframe CSS in `globals.css` e
bastano. Niente libreria di charting: il ciclo di vita e' un'illustrazione SVG
scritta a mano. Niente design system: i componenti sono in `src/components/ui`.
Le dipendenze di runtime sono quattro: `next`, `react`, `react-dom`,
`@supabase/supabase-js` + `@supabase/ssr`.

## D15 — Tailwind 4, senza file di configurazione

La palette vive in `@theme` dentro `globals.css` e produce insieme le utility
(`bg-salvia`) e le custom properties (`var(--salvia)`) che gli SVG scritti a
mano leggono direttamente. Un solo posto da cambiare per ritoccare l'identita'.

## D16 — Next.js 15.5.24, non 16

Il brief chiede Next 15. La 15.5.4 aveva una vulnerabilita' nota, quindi sono
sulla 15.5.24, l'ultima patchata del ramo 15. Restano due advisory su `postcss`
annidato dentro `next`, chiudibili solo passando alla 16: sono in `LIMITI.md`.

## D17 — Fraunces + Inter

Display arrotondato e caldo per i titoli, sans molto leggibile per il resto,
caricati con `next/font`. Corpo a 18 px, titoli fino a 48 px: si legge da 80 cm,
in due.

## D18 — Il consenso e' una spunta all'apertura del cliente

Il brief la vuole prima di aprire una sessione. L'ho messa nel modulo di
creazione del cliente, che in v1 e' anche il momento in cui si apre la prima
sessione: una schermata in meno prima di cominciare.

## D19 — Il granaio non giudica mai

Con CRM negativa o nulla il grano e' color nebbia, non rosso, e il testo dice
che oggi le risorse sono tutte al lavoro e che e' esattamente da li' che si
parte. Nessuna icona di pericolo in tutta l'applicazione.

## D20 — La sessione conclusa si riapre con un clic esplicito

Diventa di sola lettura e ogni server action rifiuta le scritture controllando
lo stato prima di procedere. "Riapri la sessione" e' visibile ma separato dai
tre pulsanti del materiale, per non premerlo per sbaglio.


---

# v1.1 — decisioni prese durante le tre modifiche

## A1 — La guardia si legge da una funzione, non da pg_policies

PostgREST espone solo lo schema `public`: `pg_catalog` non e' raggiungibile,
quindi l'applicazione non puo' interrogare `pg_policies` direttamente. La
verifica passa da `public.stato_protezione()`, SECURITY DEFINER, che restituisce
per ogni tabella del modello se la RLS e' attiva e quali policy ci sono. Non
rivela dati: solo nomi.

Il vantaggio secondario e' che se la migration non e' mai stata eseguita, la
funzione non esiste e la chiamata fallisce: la guardia se ne accorge lo stesso e
lo dice con parole diverse ("lo schema non e' stato creato" invece di "manca la
policy X").

## A2 — La guardia sta nel layout, non nel repository

Metterla dentro `repository()` avrebbe fatto scattare un'eccezione a meta'
pagina, con un messaggio generico. Sta invece fra il layout e tutto il resto:
se l'isolamento non regge, al posto dell'applicazione compare la spiegazione di
cosa manca e di quale file eseguire. E' letteralmente "l'applicazione non parte".

Gira una volta per processo. In sviluppo Next.js puo' caricare il modulo in piu'
grafi e la verifica puo' ripetersi una volta per grafo: resta lontanissima
dall'essere per query, che era il punto.

## A3 — Provata solo la strada del fallimento totale

Con credenziali Supabase irraggiungibili l'applicazione si ferma e elenca tutte
e otto le tabelle: verificato. Il caso piu' sottile — database raggiungibile ma
una sola policy mancante — percorre lo stesso codice ma non e' stato eseguito su
un Postgres vero. E' in `LIMITI.md`.

## B1 — Due figure, non un cursore di genere

`femminile` e `maschile`, due silhouette per fascia d'eta'. La differenza sta
nel rapporto spalle-fianchi e in una vita appena segnata, ed e' quasi nulla da
bambini, come nella realta'.

I fianchi non superano mai le spalle di piu' di un'unita': oltre, le braccia
finivano dentro la sagoma invece di cadere lungo i fianchi. Se ne accorge solo
guardando, e infatti se n'e' accorto guardando.

## B2 — Quattro tonalita', nessun controllo

Incarnato e colore dei capelli vengono dal nome su quattro tonalita' naturali
ciascuno e **non hanno alcun controllo in interfaccia**.

*Rovesciata nella v1.2 (vedi B2-bis): l'incarnato torna un comando esplicito.
Ricavarlo dal nome era sbagliato.*

## B3 — La figura si deduce dal nome, e sbaglia

I nomi italiani in -a sono femminili tranne una lista corta e ricorrente
(Andrea, Luca, Nicola, Mattia…), quelli in -o e -i maschili, quelli in -e
maschili in maggioranza. Piu' una lista di femminili che non finiscono in -a.

Sbagliera'. Per questo il controllo sta sempre in vista accanto al nome e si
corregge con un tocco: e' un tentativo, non una regola.

## B4 — Le sessioni vecchie non si perdono

Le sessioni aperte prima della v1.1 hanno `avatar_seed` in una forma diversa
(`capelli` e `taglio` numerici, nessuna `figura`). `seedNormalizzato()`
ricostruisce quello che manca partendo dal nome, in entrambi i driver. Nessuna
migrazione di dati, nessuna sessione persa.

## C1 — Pianta assonometrica, non vista frontale

Quattro cinte concentriche disegnate come quattro muri sempre piu' grandi, uno
davanti all'altro, erano illeggibili: ogni cinta nuova nascondeva la
precedente. Il punto di vista e' passato a una pianta vista da sopra e appena di
lato, con il piano di terra schiacciato di un fattore 0.5.

Quel fattore e' una scelta di leggibilita', non di realismo: piu' e' alto piu'
la vista e' dall'alto e piu' la mappa diventa alta e stretta; a 0.5 ha
all'incirca le proporzioni della fascia in cui vive nella fase 4, e i nomi delle
costruzioni restano leggibili da 80 cm.

## C2 — Ogni pezzo di anello ha la sua profondita'

Un anello intero non puo' avere una sola profondita': la sua meta' dietro sta
dietro alla famiglia e quella davanti le sta davanti. Con una profondita' sola,
il fossato finiva disegnato sopra a tutta la scena, famiglia compresa.

Ogni arco si spezza ai fianchi della circonferenza (90 e 270 gradi) e ogni
tratto entra nell'ordinamento con la propria profondita'.

## C3 — La famiglia non si spegne mai

Quando si parla di una costruzione, tutto il resto della scena scende di
saturazione. Tutto il resto **delle costruzioni**: la famiglia resta a colori
pieni. Spegnere le persone per mettere in evidenza un muro sarebbe stato il
contrario di quello che fa questo prodotto.

## C4 — Gli indicatori misurano la conversazione, non la protezione

I quattro indicatori in alto si riempiono man mano che si **risponde**, non man
mano che si e' protetti. Un indicatore che misurasse le coperture presenti
sarebbe un punteggio mostrato al cliente, e i punteggi non si mostrano.

Ogni tacca e' anche il modo per tornare su una voce gia' data: un solo elemento
che fa avanzamento e navigazione, invece di due file di comandi.

## C5 — Le tracce sono linee, non fasce

Quattordici costruzioni tutte da fare, disegnate come bande a doppio contorno
corallo, producevano una mappa rossa: un allarme, cioe' esattamente quello che
il prodotto non deve fare. Le tracce degli anelli sono diventate una linea di
mezzeria tratteggiata. Resta il cantiere, sparisce l'allarme.

## C6 — Nomi brevi sulla mappa

"Una polizza che protegge chi resta" non sta accanto a una torre. Sulla mappa
compaiono nomi brevi (`vociFortezzaBreve` in `copy.ts`): *Chi resta*,
*Autosufficienza*, *Spese mediche*. I nomi per esteso restano quelli della
domanda e dei report.

## C7 — La regola globale sui bottoni e' finita in @layer base

`button { min-height: 48px }` scritta fuori da un layer batte anche le utility
di Tailwind: le tacche degli indicatori, alte 10 px per progetto, venivano
disegnate alte mezzo pollice. Spostata dentro `@layer base`, dove le utility
possono scavalcarla quando serve.


---

# v1.2 — decisioni prese durante i quattro interventi

## A1-bis — `desiderata` sta sulla voce, non in una lista a parte

Fino alla v1.1 la scelta del cliente era `emotions.priorita_dichiarate`, un
elenco di chiavi slegato dalle voci a cui si riferiva. Ora e' una colonna
booleana su `fortress_items`, accanto a `stato`.

Sono due informazioni diverse e non vanno mai confuse: `stato` e' cosa la
famiglia **ha**, `desiderata` e' cosa **vuole**. La cittadella desiderata e' la
somma delle due.

La migration travasa i dati una volta sola e **non elimina** la colonna di
partenza: cancellare dati e' definitivo e una migration non e' il posto per
farlo. Resta li', inutilizzata, con un commento che lo dice.

## A2-bis — Cio' che c'e' gia' non si tocca

Nella fase del desiderato una costruzione `presente` non e' selezionabile: e'
gia' nella cittadella. Toccabile e' tutto il resto, senza limite di numero. Se
il cliente le vuole tutte e' una sua risposta e va registrata cosi'.

## A3-bis — Il colore delle costruzioni passa da variabili CSS

Una costruzione scelta si disegna in sole invece che in salvia, con il contorno
piu' marcato. Invece di passare una proprieta' a otto componenti di
architettura, i colori e lo spessore del tratto arrivano da variabili CSS
ridefinite su una classe. Il contorno principale non porta uno spessore proprio:
lo eredita dal gruppo.

## A4 — La cittadella completa resta non interattiva

E' la schermata **prima** di quella in cui si sceglie, e serve solo a dare il
metro oggettivo. Renderla toccabile avrebbe confuso i due momenti: quella dice
"ecco il massimo possibile", questa dice "ecco cosa voglio io".

## B2-bis — L'incarnato si sceglie

Toglierlo era stato un errore. Ricavare il colore della pelle da un nome e'
sbagliato e basta, e quattro tonalita' esplicite costano un comando in piu' e
niente altro.

Quattro e non due: la maggior parte delle persone sta in mezzo, e due tonalita'
sarebbero un gradino che davanti a una famiglia vera si vede. Il comando in
interfaccia e' identico.

Il colore dei capelli resta senza comando ma cambia sorgente: segue l'incarnato
scelto invece del nome. La regola dei capelli grigi sopra l'eta' del tempo
libero resta.

## C1-bis — I capelli lunghi sono diventati raccolti

Due tentativi, come previsto dal brief. Il primo si fermava alle spalle e
leggeva come un caschetto; il secondo scendeva oltre e i due lati liberi
leggevano come codini. Nessuno dei due reggeva accanto a `cortissimi` e `corti`.

Vale quindi la regola di riserva: capelli raccolti con lo chignon. E' una forma
sola, piatta e chiusa, che si disegna bene in questo stile e in sala si legge
come "capelli lunghi" lo stesso.

Chi aveva scelto `lunghi` se lo ritrova come `raccolti`: la normalizzazione
traduce la vecchia chiave invece di riportare tutti a `corti`.

## D1 — Le carte non hanno colore per direzione

`direzione` e `ordine` sono metadato per il consulente e **non si vedono mai a
schermo**. Le carte sono tutte identiche: fondo sabbia, bordo notte, sole solo
quando sono selezionate.

Se il cliente vedesse che "paura" e' rossa e "sicurezza" verde risponderebbe a
un test invece di dire come sta. Il metadato riemerge solo nel dossier.

## D2 — Nessuna icona sulle carte

La parola e' l'unica cosa che conta. Una faccina accanto a "Rassegnazione"
suggerirebbe come ci si deve sentire, che e' esattamente il contrario del punto.

## D3 — Le chiavi delle emozioni non sono stabili

I due elenchi sono materiale di lavoro del consulente e cambieranno. Una
sessione salvata con parole che non esistono piu' non deve trovarsi la griglia
bloccata: le chiavi sconosciute vengono ignorate e non contano verso il limite
di tre. Chi legge l'export deve guardare `etichetta` e `direzione`, non la chiave.

## D4 — Il testo libero diventa facoltativo

Prima bloccava il passaggio alla fase successiva. Ora le carte bastano e il
testo e' un di piu': la frase esatta vale piu' di qualsiasi carta, ma non tutti
i clienti ne dicono una, e l'applicazione non deve fermare la conversazione per
aspettarla.

## D5 — La riga del movimento sta in evidenza

Nel dossier, sotto le due risposte, dentro un riquadro con il fondo sole. E' il
punto di partenza dei prospetti: seppellirla in fondo alla pagina l'avrebbe resa
inutile.

## D6 — La mappa delle emozioni non entra nell'applicazione

Le parole vengono dal lavoro del consulente sul metodo Emotional Power di
Antonio Meleleo, che e' materiale registrato. Nell'applicazione ci sono solo
singoli termini in due array: **la mappa, il suo schema grafico, la struttura a
bolle e le sue diciture non compaiono**, ne' a schermo ne' nei PDF. Il commento
in `copy.ts` lo dice, cosi' resta scritto anche per chi tocchera' quel file dopo.
