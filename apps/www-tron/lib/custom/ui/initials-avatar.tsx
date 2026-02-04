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
      viewBox="0 0 64 64"
      className={cn(className)}
    >
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="#0F172A"
        stroke="#38BDF8"
        strokeWidth="2"
      />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fill="#E2E8F0"
        fontSize="22"
        fontWeight="700"
        fontFamily="Space Grotesk, Inter, system-ui, -apple-system, sans-serif"
        letterSpacing="0.5"
      >
        {initials}
      </text>
    </svg>
  )
}
