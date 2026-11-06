// Encode only at the HTML output boundary; never accept executable URL schemes.
export function escapeHtml(value: string): string {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!))
}
export function safeUrl(value: string): string {
  try {
    const url = new URL(value)
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? escapeHtml(url.href) : '#'
  } catch { return '#' }
}
export function safeColor(value: string, fallback: string): string {
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ? value : fallback
}
