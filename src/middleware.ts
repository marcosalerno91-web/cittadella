import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Rinnovo del token Supabase.
 *
 * I Server Component non possono scrivere cookie: senza questo passaggio la
 * sessione dell'advisor scadrebbe nel mezzo di una consulenza. Con il driver
 * locale non serve e viene saltato.
 */
export async function middleware(richiesta: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chiave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !chiave) return NextResponse.next()

  let risposta = NextResponse.next({ request: richiesta })

  const supabase = createServerClient(url, chiave, {
    cookies: {
      getAll() {
        return richiesta.cookies.getAll()
      },
      setAll(daScrivere) {
        for (const { name, value } of daScrivere) {
          richiesta.cookies.set(name, value)
        }
        risposta = NextResponse.next({ request: richiesta })
        for (const { name, value, options } of daScrivere) {
          risposta.cookies.set(name, value, options)
        }
      },
    },
  })

  // la sola chiamata che rinnova il token, se serve
  await supabase.auth.getUser()

  return risposta
}

export const config = {
  matcher: [
    /*
     * Tutto tranne file statici e immagini: il rinnovo serve solo alle
     * richieste che poi leggeranno dati.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
