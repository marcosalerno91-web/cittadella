'use client'

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { useId } from 'react'

const stileInput =
  'w-full rounded-2xl border-2 border-notte/25 bg-sabbia-chiara px-5 py-3 text-lg text-notte ' +
  'placeholder:text-notte/35 focus:border-notte focus:outline-none transition-colors duration-200'

interface PropsCampo extends InputHTMLAttributes<HTMLInputElement> {
  etichetta: string
  aiuto?: ReactNode
}

export function Campo({ etichetta, aiuto, className = '', ...resto }: PropsCampo) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold text-notte/70">
        {etichetta}
      </label>
      <input id={id} className={`${stileInput} ${className}`} {...resto} />
      {aiuto ? <p className="text-base text-notte/55">{aiuto}</p> : null}
    </div>
  )
}

interface PropsArea extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  etichetta?: string
  aiuto?: ReactNode
}

export function AreaTesto({ etichetta, aiuto, className = '', ...resto }: PropsArea) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      {etichetta ? (
        <label htmlFor={id} className="text-base font-semibold text-notte/70">
          {etichetta}
        </label>
      ) : null}
      <textarea id={id} className={`${stileInput} min-h-[7rem] leading-relaxed ${className}`} {...resto} />
      {aiuto ? <p className="text-base text-notte/55">{aiuto}</p> : null}
    </div>
  )
}
