import type { Profile } from './export'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// JSON parsing alone does not validate a saved profile's shape.
export function parseProfile(raw: string | null): Profile | null {
  if (!raw) return null
  let value: unknown
  try { value = JSON.parse(raw) } catch { return null }
  if (!isRecord(value)) return null
  if (!['name', 'bio', 'avatarUrl', 'footerText'].every(key => typeof value[key] === 'string')) return null
  if (!isRecord(value.theme)) return null
  const theme = value.theme
  if (!['bg', 'text', 'btn', 'btnText'].every(key => typeof theme[key] === 'string')) return null
  if (!['rounded', 'square', 'pill'].includes(value.btnRadius as string)) return null
  if (!Array.isArray(value.links)) return null
  const ids = new Set<string>()
  for (const link of value.links) {
    if (!isRecord(link) || !['id', 'title', 'url', 'icon'].every(key => typeof link[key] === 'string')) return null
    const id = link.id as string
    if (!id || ids.has(id)) return null
    ids.add(id)
  }
  return value as unknown as Profile
}
