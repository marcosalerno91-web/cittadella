/**
 * Il segno del prodotto: una cittadella vista di fronte, tre cinte e il mastio.
 * Contorni spessi e uniformi, angoli arrotondati, nessun gradiente.
 */
export function StemmaCittadella({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Cittadella"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="60" cy="60" r="54" fill="var(--sabbia-chiara)" stroke="var(--notte)" strokeWidth="5" />

      {/* mastio */}
      <path
        d="M48 46h24v40H48z"
        fill="var(--sole)"
        stroke="var(--notte)"
        strokeWidth="5"
      />
      <path
        d="M46 46v-8h6v5h6v-5h6v5h6v-5h6v8"
        fill="var(--sole)"
        stroke="var(--notte)"
        strokeWidth="5"
      />
      <path d="M56 86v-14a4 4 0 0 1 8 0v14" fill="var(--notte)" />

      {/* cinta laterale */}
      <path
        d="M26 66h22v20H26zM72 66h22v20H72z"
        fill="var(--salvia)"
        stroke="var(--notte)"
        strokeWidth="5"
      />
      <path
        d="M24 66v-6h6v4h6v-4h6v4h6v2M72 66v-2h6v-4h6v4h6v-4h6v6"
        fill="var(--salvia)"
        stroke="var(--notte)"
        strokeWidth="5"
      />

      {/* terreno */}
      <path d="M18 86h84" stroke="var(--notte)" strokeWidth="5" />
    </svg>
  )
}
