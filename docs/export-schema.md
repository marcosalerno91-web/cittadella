# Schema dell'export JSON

Versione corrente: **1.0.0**

L'export si scarica da `GET /api/sessione/<id>/export` e dalla schermata di
chiusura della sessione. Serve al consulente per alimentare i propri strumenti
di produzione dei prospetti: e' l'unico contratto stabile verso l'esterno.

## Regole di versionamento

Il campo `schema_version` segue il versionamento semantico.

- **patch** (1.0.x): correzioni che non cambiano la forma dei dati
- **minor** (1.x.0): campi nuovi, opzionali. Chi legge la versione precedente
  continua a funzionare
- **major** (x.0.0): campi rimossi o rinominati, tipi cambiati, significati
  diversi. Chi legge deve adeguarsi

Chi consuma l'export dovrebbe controllare la major e rifiutare quello che non
riconosce, invece di indovinare.

## Forma

```jsonc
{
  "schema_version": "1.0.0",
  "generato_il": "2026-08-27T15:04:05.000Z",   // ISO 8601 UTC

  "sessione": {
    "id": "uuid",
    "stato": "bozza" | "in_corso" | "conclusa",
    "creata_il": "ISO 8601",
    "aggiornata_il": "ISO 8601",
    "conclusa_il": "ISO 8601" | null
  },

  "cliente": {
    "etichetta": "Famiglia Ferrero",   // nome scelto dal consulente
    "note": "testo libero" | null
  },

  "nucleo": [
    {
      "id": "uuid",
      "nome": "Marta",
      "eta": 44,
      "professione_key": "insegnante",      // una delle 21 chiavi, o "casual"
      "professione_libera": null,           // testo digitato se fuori elenco
      "ruolo_famiglia": "intestatario" | "partner" | "figlio" | "genitore" | "altro",
      "fase_vita": "studio" | "lavoro" | "tempo_libero",
      "ordine": 0                           // ordine in scena, da 0
    }
  ],

  "finanze": {
    "valuta": "EUR",
    "periodo": "mensile",                   // tutti gli importi sono mensili medi
    "redditi_da_lavoro": [
      { "member_id": "uuid", "nome": "Marta", "importo": 1850 }
    ],
    "rendite": {
      "affitti": 450,
      "cedole_dividendi": 60,
      "altre_rendite": 0
    },
    "uscite": {
      "casa": 980,          // mutuo oppure affitto
      "auto": 520,
      "finanziamenti": 210,
      "vita": 3400          // spesa, bollette, scuola, tempo libero
    },
    "entrate_totali": 5810,
    "uscite_totali": 5110,
    "crm_mensile": 700,
    "crm_annuale": 8400,
    "crm_percentuale": 0.1205,              // frazione, non percentuale
    "livello_scorta": "impegnata" | "esile" | "solida" | "abbondante"
  },

  "fortezza": {
    "completamento_pesato": 0.325,          // 0..1, pesato per importanza di cinta
    "cinte": [
      {
        "blocco": "mastio" | "salute" | "risparmio" | "perimetro",
        "titolo": "Tutela della famiglia",
        "voci_totali": 4,
        "presenti": 0,
        "assenti": 3,
        "non_so": 1,
        "senza_risposta": 0,
        "completamento": 0                  // presenti / voci_totali
      }
    ],
    "voci": [
      {
        "voce_key": "tcm",
        "blocco": "mastio",
        "nome": "Una polizza che protegge chi resta",
        "sigla": "TCM — Temporanea Caso Morte" | null,
        "stato": "presente" | "assente" | "non_so" | null,
        "nota": "appunto del consulente" | null,
        "prioritaria": true
      }
    ]
  },

  "emozioni": {
    "sentire_attuale": "testo libero, parole del cliente",
    "emozioni_scelte": [
      { "key": "in_dubbio", "label": "In dubbio", "famiglia": "serena" | "tesa" }
    ],
    "sentire_desiderato": "testo libero, parole del cliente",
    "emozioni_desiderate": [ /* stessa forma */ ],
    "priorita_dichiarate": [
      { "voce_key": "tcm", "nome": "Una polizza che protegge chi resta", "blocco": "mastio" }
    ]
  }
}
```

## Cosa NON contiene, per scelta

- nessun codice fiscale, documento o dato sanitario
- nessun dato finanziario analitico: solo importi medi mensili aggregati
- nessun premio, nessun prodotto, nessuna proposta: l'applicazione non consiglia
- nessun dato dell'agenzia o del consulente oltre a quelli della sessione

## Chiavi stabili

`voce_key`, `professione_key`, `ruolo_famiglia`, `blocco`, `stato`,
`livello_scorta`, `fase_vita` e le chiavi di `rendite` e `uscite` sono
identificatori stabili: si puo' scriverci sopra della logica.

I campi `nome`, `sigla`, `titolo` e `label` sono invece testi presi da
`src/content/copy.ts` e possono cambiare a ogni riscrittura dei testi: servono
a rendere leggibile l'export, non a essere confrontati.

## Ordinamento

`nucleo` segue `ordine`. `fortezza.voci` e `fortezza.cinte` seguono l'ordine di
costruzione definito in `src/config/engine.ts`, dal mastio verso l'esterno.
`priorita_dichiarate` segue l'ordine in cui il cliente ha toccato le sagome.
