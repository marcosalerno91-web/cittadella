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

## D5 — L'inquadratura della fortezza si allarga da sola

Con quattro cinte concentriche in un riquadro fisso, all'inizio si vedeva un
puntino in mezzo al vuoto. La scena calcola il campo sui mattoni effettivamente
presenti: si parte stretti sulla famiglia e sul mastio e il campo si apre a ogni
cinta nuova. I profili delle cinte escono dai bordi ed e' voluto: le mura
proseguono oltre la scena.

## D6 — Le voci senza risposta sono fondazioni, non mattoni vuoti

Una voce non ancora affrontata si disegna alta un terzo, come una fondazione. Il
muro **cresce** mentre la famiglia racconta cosa ha gia'. Era il modo piu'
diretto per far leggere il progresso senza mostrare un punteggio.

## D7 — Due coetanei stanno sullo stesso punto della curva

Nella fase 2, marito e moglie di 44 e 47 anni finiscono quasi sovrapposti. E'
giusto cosi': e' li' che si trovano. A non potersi sovrapporre sono i nomi, che
vengono impilati; e quando il punto e' troppo in basso il nome passa sopra la
testa invece di finire sotto l'asse.

## D8 — La professione si suggerisce, non si impone

Sotto i 6 anni la figura diventa `bambino`, sotto i 19 `studente`, dai 66
`tempo_libero`. Il suggerimento scatta **solo** se la professione attuale era a
sua volta un suggerimento: se il consulente ha scelto a mano, non si tocca piu'.

## D9 — L'aspetto segue il nome finche' non lo si tocca

Digitando "Marta" l'avatar cambia incarnato, capelli e taglio in modo
deterministico dal nome. E' il momento "wow" della fase 1 e costa zero clic.
Appena il consulente usa il selettore di aspetto, il legame si rompe.

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
