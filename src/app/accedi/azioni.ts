'use server'

import { redirect } from 'next/navigation'

import { auth } from '@/lib/db'
import * as copy from '@/content/copy'

export interface StatoAccesso {
  errore?: string
}

export async function accedi(_stato: StatoAccesso, dati: FormData): Promise<StatoAccesso> {
  const email = String(dati.get('email') ?? '')
  const password = String(dati.get('password') ?? '')
  if (!email || !password) return { errore: copy.accesso.errore_credenziali }

  try {
    const adapter = await auth()
    await adapter.signIn(email, password)
  } catch {
    return { errore: copy.accesso.errore_credenziali }
  }
  redirect('/clienti')
}

export async function registra(_stato: StatoAccesso, dati: FormData): Promise<StatoAccesso> {
  const email = String(dati.get('email') ?? '')
  const password = String(dati.get('password') ?? '')
  const nome = String(dati.get('nome') ?? '')
  const agenzia = String(dati.get('agenzia') ?? '')

  if (!email || password.length < 8 || !nome) {
    return { errore: 'Servono nome, email e una password di almeno 8 caratteri.' }
  }

  try {
    const adapter = await auth()
    await adapter.signUp({ email, password, nome, agenzia })
  } catch (errore) {
    return { errore: errore instanceof Error ? errore.message : copy.accesso.errore_generico }
  }
  redirect('/clienti')
}

export async function esci(): Promise<void> {
  const adapter = await auth()
  await adapter.signOut()
  redirect('/accedi')
}
