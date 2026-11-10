// Keep the legacy fallback for browsers without the Clipboard API.
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch { /* Try the browser's legacy copy command. */ }
  let field: HTMLTextAreaElement | null = null
  try {
    field = document.createElement('textarea')
    field.value = text
    document.body.appendChild(field)
    field.select()
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    field?.remove()
  }
}
