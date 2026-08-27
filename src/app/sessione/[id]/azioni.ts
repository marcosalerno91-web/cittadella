'use server'

import { revalidatePath } from 'next/cache'

import { contesto } from '@/lib/sessione-corrente'
import type {
  EmotionsInput,
  FinancesInput,
  FortressInput,
  MemberInput,
} from '@/lib/db/types'
import type { FaseKey } from '@/lib/domain'

/** Una sessione conclusa e' in sola lettura: nessuna azione la modifica. */
async function apertaOppureFerma(sessionId: string) {
  const { caller, repo } = await contesto()
  const bundle = await repo.getBundle(caller, sessionId)
  if (!bundle) throw new Error('Sessione non accessibile')
  if (bundle.session.stato === 'conclusa') throw new Error('La sessione e’ conclusa')
  return { caller, repo }
}

export async function salvaMembri(sessionId: string, membri: MemberInput[]): Promise<void> {
  const { caller, repo } = await apertaOppureFerma(sessionId)
  await repo.saveMembers(caller, sessionId, membri)
}

export async function salvaFinanze(sessionId: string, finanze: FinancesInput): Promise<void> {
  const { caller, repo } = await apertaOppureFerma(sessionId)
  await repo.saveFinances(caller, sessionId, finanze)
}

export async function salvaFortezza(sessionId: string, voci: FortressInput[]): Promise<void> {
  const { caller, repo } = await apertaOppureFerma(sessionId)
  await repo.saveFortress(caller, sessionId, voci)
}

export async function salvaEmozioni(sessionId: string, emozioni: EmotionsInput): Promise<void> {
  const { caller, repo } = await apertaOppureFerma(sessionId)
  await repo.saveEmotions(caller, sessionId, emozioni)
}

export async function cambiaFase(sessionId: string, fase: FaseKey): Promise<void> {
  const { caller, repo } = await apertaOppureFerma(sessionId)
  await repo.patchSession(caller, sessionId, { fase_corrente: fase })
}

export async function concludiSessione(sessionId: string): Promise<void> {
  const { caller, repo } = await contesto()
  await repo.patchSession(caller, sessionId, { stato: 'conclusa', fase_corrente: 'chiusura' })
  revalidatePath(`/sessione/${sessionId}`)
  revalidatePath('/clienti')
}

export async function riapriSessione(sessionId: string): Promise<void> {
  const { caller, repo } = await contesto()
  await repo.patchSession(caller, sessionId, { stato: 'in_corso' })
  revalidatePath(`/sessione/${sessionId}`)
  revalidatePath('/clienti')
}
