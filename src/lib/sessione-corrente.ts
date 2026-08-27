import { redirect } from 'next/navigation'

import { auth, repository } from '@/lib/db'
import type { Advisor } from '@/lib/domain'
import type { Caller, Repository } from '@/lib/db/types'

/** Advisor collegato, oppure null. */
export async function advisorCorrente(): Promise<Advisor | null> {
  const adapter = await auth()
  return adapter.currentAdvisor()
}

/** Advisor collegato. Se non c'e', porta alla pagina di accesso. */
export async function richiediAdvisor(): Promise<Advisor> {
  const advisor = await advisorCorrente()
  if (!advisor) redirect('/accedi')
  return advisor
}

/** Advisor + repository, il paio che serve a ogni azione sui dati. */
export async function contesto(): Promise<{ caller: Caller; repo: Repository }> {
  const advisor = await richiediAdvisor()
  return { caller: { advisor }, repo: await repository() }
}
