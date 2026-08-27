'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { contesto } from '@/lib/sessione-corrente'

export interface StatoCliente {
  errore?: string
}

export async function creaCliente(_stato: StatoCliente, dati: FormData): Promise<StatoCliente> {
  const etichetta = String(dati.get('etichetta') ?? '').trim()
  const note = String(dati.get('note') ?? '').trim()
  const consenso = dati.get('consenso') === 'on'

  if (!etichetta) return { errore: 'Dai un nome a questo nucleo.' }
  if (!consenso) return { errore: 'Serve la conferma del consenso prima di aprire una sessione.' }

  const { caller, repo } = await contesto()
  const cliente = await repo.createClient(caller, { etichetta, note })
  const sessione = await repo.createSession(caller, cliente.id)

  revalidatePath('/clienti')
  redirect(`/sessione/${sessione.id}`)
}

export async function apriNuovaSessione(clientId: string): Promise<void> {
  const { caller, repo } = await contesto()
  const sessione = await repo.createSession(caller, clientId)
  revalidatePath('/clienti')
  redirect(`/sessione/${sessione.id}`)
}
