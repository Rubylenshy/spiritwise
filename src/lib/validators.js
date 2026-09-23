// Client-side field rules for the auth forms. The backend still validates;
// these catch mistakes before a round trip.

// Usernames are case-insensitive: always send them lowercased, with no whitespace.
export function normalizeUsername(value) {
  return value.replace(/\s+/g, '').toLowerCase()
}

// Mirrors Django's default username validator (letters, digits, @ . + - _).
export const USERNAME_PATTERN = /^[a-z0-9@.+_-]+$/

export function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

// Practical subset of RFC 5322: a dot-atom local part, dot-separated domain
// labels (no leading/trailing hyphens) and an alphabetic TLD of 2+ letters.
const EMAIL_PATTERN =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i

export function isValidEmail(value) {
  const email = normalizeEmail(value)
  return email.length <= 254 && email.split('@')[0].length <= 64 && EMAIL_PATTERN.test(email)
}
