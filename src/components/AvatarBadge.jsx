import { Bird, Bug, Butterfly, Cat, Dog, Fish, Horse, Rabbit } from '@phosphor-icons/react'

export const AVATAR_OPTIONS = Object.freeze([
  { id: 'cat', label: 'Cat', Icon: Cat, colour: 'bg-coral' },
  { id: 'dog', label: 'Dog', Icon: Dog, colour: 'bg-ocean' },
  { id: 'rabbit', label: 'Rabbit', Icon: Rabbit, colour: 'bg-lime' },
  { id: 'bird', label: 'Bird', Icon: Bird, colour: 'bg-sunshine' },
  { id: 'fish', label: 'Fish', Icon: Fish, colour: 'bg-ocean' },
  { id: 'butterfly', label: 'Butterfly', Icon: Butterfly, colour: 'bg-coral' },
  { id: 'horse', label: 'Horse', Icon: Horse, colour: 'bg-sunshine' },
  { id: 'bug', label: 'Bug', Icon: Bug, colour: 'bg-lime' },
])

export function AvatarBadge({ avatar, size = 36, className = '' }) {
  const option = AVATAR_OPTIONS.find((entry) => entry.id === avatar) ?? AVATAR_OPTIONS[0]
  const Icon = option.Icon

  return (
    <span
      className={`${option.colour} inline-grid shrink-0 place-items-center rounded-[14px] border-chunky border-ink p-2 ${className}`}
      aria-label={option.label}
    >
      <Icon size={size} weight="fill" aria-hidden="true" />
    </span>
  )
}
