import { Bird, Cat, Dog, Rabbit } from '@phosphor-icons/react'

export const AVATAR_OPTIONS = Object.freeze([
  { id: 'cat', label: 'Cat', Icon: Cat, colour: 'bg-coral' },
  { id: 'dog', label: 'Dog', Icon: Dog, colour: 'bg-ocean' },
  { id: 'rabbit', label: 'Rabbit', Icon: Rabbit, colour: 'bg-lime' },
  { id: 'bird', label: 'Bird', Icon: Bird, colour: 'bg-sunshine' },
])

export function AvatarBadge({ avatar, size = 36, className = '' }) {
  const option = AVATAR_OPTIONS.find((entry) => entry.id === avatar) ?? AVATAR_OPTIONS[0]
  const Icon = option.Icon

  return (
    <span
      className={`${option.colour} inline-grid shrink-0 place-items-center rounded-full border-chunky border-ink p-2 ${className}`}
      aria-label={option.label}
    >
      <Icon size={size} weight="fill" aria-hidden="true" />
    </span>
  )
}
