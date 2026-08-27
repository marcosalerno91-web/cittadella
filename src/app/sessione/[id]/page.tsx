import { notFound } from 'next/navigation'

import { Consulenza } from '@/app/sessione/[id]/Consulenza'
import { contesto } from '@/lib/sessione-corrente'

export const dynamic = 'force-dynamic'

export default async function PaginaSessione({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { caller, repo } = await contesto()
  const bundle = await repo.getBundle(caller, id)
  if (!bundle) notFound()
  return <Consulenza bundle={bundle} />
}
