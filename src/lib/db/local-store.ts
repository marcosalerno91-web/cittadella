/**
 * Driver di sviluppo locale: persistenza su un singolo file JSON.
 *
 * Serve a far girare l'intera consulenza su una macchina senza Postgres, senza
 * Docker e senza credenziali. In produzione non viene mai caricato: la scelta
 * avviene in src/lib/db/index.ts sulla base delle variabili d'ambiente.
 *
 * Le scritture sono serializzate su una singola catena di promise: il file
 * viene riscritto per intero e in modo atomico (write su temporaneo + rename).
 */

import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join } from 'node:path'

import type {
  Advisor,
  Agency,
  Client,
  Emotions,
  FamilyMember,
  Finances,
  FortressItem,
  Session,
} from '@/lib/domain'

export interface AdvisorRecord extends Advisor {
  password_hash: string
  password_salt: string
}

export interface Database {
  version: 1
  agencies: Agency[]
  advisors: AdvisorRecord[]
  clients: Client[]
  sessions: Session[]
  members: FamilyMember[]
  finances: Finances[]
  fortress: FortressItem[]
  emotions: Emotions[]
  /** token di sessione advisor -> advisor id */
  tokens: Record<string, string>
}

function vuoto(): Database {
  return {
    version: 1,
    agencies: [],
    advisors: [],
    clients: [],
    sessions: [],
    members: [],
    finances: [],
    fortress: [],
    emotions: [],
    tokens: {},
  }
}

function percorso(): string {
  const dir = process.env.CITTADELLA_LOCAL_DATA_DIR ?? '.data'
  const base = isAbsolute(dir) ? dir : join(process.cwd(), dir)
  return join(base, 'cittadella.json')
}

let catena: Promise<unknown> = Promise.resolve()

/**
 * Legge sempre dal file, senza copie in memoria.
 *
 * Una cache a livello di modulo sembrava un'ottimizzazione ovvia ed era un
 * errore: Next.js carica lo stesso modulo in piu' grafi (pagina e server
 * action), ognuno con la propria copia. Chi scriveva aggiornava la sua, chi
 * leggeva restava indietro. Il file e' piccolo: si rilegge e basta.
 */
async function carica(): Promise<Database> {
  try {
    const testo = await readFile(percorso(), 'utf8')
    const letto = JSON.parse(testo) as Partial<Database>
    return { ...vuoto(), ...letto, version: 1 }
  } catch {
    return vuoto()
  }
}

async function scrivi(db: Database): Promise<void> {
  const file = percorso()
  await mkdir(dirname(file), { recursive: true })
  const temporaneo = `${file}.${process.pid}.tmp`
  await writeFile(temporaneo, JSON.stringify(db, null, 2), 'utf8')
  await rename(temporaneo, file)
}

/** Stato corrente. E' una copia: modificarla non cambia nulla su disco. */
export async function leggi(): Promise<Database> {
  return carica()
}

/**
 * Esegue una modifica in mutua esclusione e la persiste.
 * Ogni chiamata attende la precedente: niente scritture concorrenti sul file.
 */
export async function muta<T>(operazione: (db: Database) => T | Promise<T>): Promise<T> {
  const prossima = catena.then(async () => {
    const db = await carica()
    const risultato = await operazione(db)
    await scrivi(db)
    return risultato
  })
  // la catena prosegue anche se questa operazione fallisce
  catena = prossima.catch(() => undefined)
  return prossima
}

export function nuovoId(): string {
  return randomUUID()
}

export function adesso(): string {
  return new Date().toISOString()
}

// ---------------------------------------------------------------- password

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString('hex')
  return { hash: scryptSync(password, salt, 64).toString('hex'), salt }
}

export function verificaPassword(password: string, hash: string, salt: string): boolean {
  const atteso = Buffer.from(hash, 'hex')
  const calcolato = scryptSync(password, salt, atteso.length)
  return atteso.length === calcolato.length && timingSafeEqual(atteso, calcolato)
}

export function nuovoToken(): string {
  return randomBytes(32).toString('hex')
}
