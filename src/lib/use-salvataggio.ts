'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { TEMPI } from '@/config/engine'

export type StatoSalvataggio = 'fermo' | 'salvo' | 'salvato' | 'errore'

interface Opzioni<T> {
  /** valore corrente da mantenere salvato */
  valore: T
  /** invia il valore al server. Deve rilanciare in caso di errore. */
  salva: (valore: T) => Promise<void>
  /** chiave per la copia di sicurezza nel browser */
  chiave: string
  /** attivo solo quando la sessione e' modificabile */
  attivo?: boolean
}

interface Risultato {
  stato: StatoSalvataggio
  /** forza l'invio immediato e attende l'esito */
  salvaOra: () => Promise<void>
  /** ultimo errore, per mostrare l'avviso di rete */
  errore: string | null
}

/**
 * Salvataggio continuo.
 *
 * Regola: quello che il consulente ha digitato non si perde mai. Il valore
 * finisce subito in sessionStorage, poi parte verso il server dopo una pausa
 * dalla digitazione. Se la rete cade, si continua a riprovare e la scena non si
 * blocca: l'incantesimo non si rompe per un timeout.
 */
export function useSalvataggio<T>({ valore, salva, chiave, attivo = true }: Opzioni<T>): Risultato {
  const [stato, setStato] = useState<StatoSalvataggio>('fermo')
  const [errore, setErrore] = useState<string | null>(null)

  const valoreRef = useRef(valore)
  // si parte allineati: il valore appena letto dal server non va rispedito
  const inviatoRef = useRef<string | null>(JSON.stringify(valore))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inCorsoRef = useRef(false)
  const salvaRef = useRef(salva)

  valoreRef.current = valore
  salvaRef.current = salva

  const invia = useCallback(async () => {
    if (inCorsoRef.current) return
    const istantanea = JSON.stringify(valoreRef.current)
    if (istantanea === inviatoRef.current) return

    inCorsoRef.current = true
    setStato('salvo')
    try {
      await salvaRef.current(valoreRef.current)
      inviatoRef.current = istantanea
      setStato('salvato')
      setErrore(null)
    } catch (e) {
      setStato('errore')
      setErrore(e instanceof Error ? e.message : 'Errore di rete')
    } finally {
      inCorsoRef.current = false
    }
  }, [])

  // copia di sicurezza immediata nel browser, prima ancora della rete
  useEffect(() => {
    if (!attivo) return
    try {
      window.sessionStorage.setItem(chiave, JSON.stringify(valore))
    } catch {
      // spazio esaurito o storage negato: il salvataggio di rete resta la via principale
    }
  }, [valore, chiave, attivo])

  // invio ritardato: si aspetta che il consulente smetta di digitare
  useEffect(() => {
    if (!attivo) return
    if (JSON.stringify(valore) === inviatoRef.current) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => void invia(), TEMPI.autosave_debounce_ms)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [valore, attivo, invia])

  // finche' resta qualcosa da mandare, si riprova
  useEffect(() => {
    if (!attivo || stato !== 'errore') return
    const timer = setTimeout(() => void invia(), 4000)
    return () => clearTimeout(timer)
  }, [stato, attivo, invia])

  // ultimo tentativo quando la pagina sta per chiudersi
  useEffect(() => {
    if (!attivo) return
    const alRitorno = () => {
      if (document.visibilityState === 'hidden') void invia()
    }
    document.addEventListener('visibilitychange', alRitorno)
    return () => document.removeEventListener('visibilitychange', alRitorno)
  }, [attivo, invia])

  const salvaOra = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    await invia()
  }, [invia])

  return { stato, salvaOra, errore }
}
