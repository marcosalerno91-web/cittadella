import { redirect } from 'next/navigation'

import { advisorCorrente } from '@/lib/sessione-corrente'

export default async function Home() {
  const advisor = await advisorCorrente()
  redirect(advisor ? '/clienti' : '/accedi')
}
