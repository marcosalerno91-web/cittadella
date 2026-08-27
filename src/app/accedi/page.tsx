import { redirect } from 'next/navigation'

import { advisorCorrente } from '@/lib/sessione-corrente'
import { ModuloAccesso } from '@/app/accedi/ModuloAccesso'

export default async function PaginaAccesso() {
  if (await advisorCorrente()) redirect('/clienti')
  return <ModuloAccesso />
}
