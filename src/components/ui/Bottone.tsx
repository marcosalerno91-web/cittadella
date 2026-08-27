import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

export type TonoBottone = 'sole' | 'notte' | 'quieto' | 'fantasma'

const tono: Record<TonoBottone, string> = {
  sole: 'bg-sole text-notte border-notte hover:brightness-105',
  notte: 'bg-notte text-sabbia border-notte hover:brightness-110',
  quieto: 'bg-sabbia-chiara text-notte border-notte/25 hover:border-notte/60',
  fantasma: 'bg-transparent text-notte border-transparent hover:bg-notte/5',
}

const base =
  'inline-flex items-center justify-center gap-3 rounded-2xl border-2 px-7 py-3 text-lg font-semibold ' +
  'transition-[transform,filter,background-color,border-color] duration-200 active:translate-y-[1px] ' +
  'disabled:opacity-40 disabled:pointer-events-none'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: TonoBottone
  children: ReactNode
}

export function Bottone({ variante = 'sole', className = '', children, ...resto }: Props) {
  return (
    <button className={`${base} ${tono[variante]} ${className}`} {...resto}>
      {children}
    </button>
  )
}

interface PropsLink {
  href: string
  variante?: TonoBottone
  className?: string
  children: ReactNode
}

export function BottoneLink({ href, variante = 'sole', className = '', children }: PropsLink) {
  return (
    <Link href={href} className={`${base} ${tono[variante]} ${className}`}>
      {children}
    </Link>
  )
}
