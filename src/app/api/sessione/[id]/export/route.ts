import { NextResponse } from 'next/server'

import { contesto } from '@/lib/sessione-corrente'
import { costruisciExport, nomeFileExport } from '@/lib/export'

export const dynamic = 'force-dynamic'

export async function GET(_richiesta: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { caller, repo } = await contesto()
  const bundle = await repo.getBundle(caller, id)
  if (!bundle) {
    return NextResponse.json({ errore: 'Sessione non accessibile' }, { status: 404 })
  }

  const generatoIl = new Date().toISOString()
  const dati = costruisciExport(bundle, generatoIl)

  return new NextResponse(JSON.stringify(dati, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${nomeFileExport(bundle.client.etichetta, generatoIl)}"`,
      'cache-control': 'no-store',
    },
  })
}
