import { englishBlockedTerms } from './en.js'

const blockedTermsByLocale = {
  en: englishBlockedTerms,
}

function normaliseName(value) {
  return String(value ?? '')
    .toLocaleLowerCase('en')
    .replaceAll('0', 'o')
    .replaceAll('1', 'i')
    .replaceAll('3', 'e')
    .replaceAll('4', 'a')
    .replaceAll('5', 's')
    .replaceAll('7', 't')
    .replace(/[^a-z]+/g, ' ')
    .trim()
}

export function validatePlayerName(value, locale = 'en') {
  const name = String(value ?? '').trim()
  if (!name) return { valid: false, error: 'Add a name so the room knows who joined.' }

  const blockedTerms = blockedTermsByLocale[locale] ?? blockedTermsByLocale.en
  const normalised = normaliseName(name)
  const words = normalised.split(/\s+/)
  const blocked = blockedTerms.some((term) => words.includes(term) || normalised.replaceAll(' ', '') === term)

  if (blocked) {
    return { valid: false, error: 'Choose a family-friendly name and try again.' }
  }

  return { valid: true, error: '' }
}
