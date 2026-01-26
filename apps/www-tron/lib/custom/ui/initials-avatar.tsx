import { cn } from '@/lib/utils'

interface InitialsAvatarProps {
  name: string
  size?: number
  className?: string
}

export function InitialsAvatar({ name, size = 32, className }: InitialsAvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn('text-primary', className)}
    >
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <text
        x="16"
        y="16"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontSize="10"
        fontWeight="600"
        fontFamily="var(--font-sans)"
      >
        {initials}
      </text>
    </svg>
  )
}
