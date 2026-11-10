interface ClipboardLike {
  writeText(text: string): Promise<void>
}

// Resolves true only when the text really reached the clipboard. A missing
// Clipboard API (insecure origin) or a rejected write resolves false so the UI
// never shows "Copied" for a copy that did not happen.
export async function copyText(text: string, clipboard?: ClipboardLike | null): Promise<boolean> {
  const target = clipboard === undefined
    ? (typeof navigator !== 'undefined' ? navigator.clipboard : null)
    : clipboard
  if (!target) return false
  try {
    await target.writeText(text)
    return true
  } catch {
    return false
  }
}
