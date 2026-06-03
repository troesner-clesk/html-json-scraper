import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  actionLabel?: string
  onAction?: () => void | Promise<void>
  duration: number
}

export interface ToastOptions {
  message: string
  type?: ToastType
  actionLabel?: string
  onAction?: () => void | Promise<void>
  /** Auto-dismiss after N ms. 0 disables auto-dismiss. Default 6000. */
  duration?: number
}

// Module-level reactive queue — shared across the whole app, survives unmounts.
const toasts = reactive<Toast[]>([])
let counter = 0

function removeToast(id: number) {
  const i = toasts.findIndex((t) => t.id === id)
  if (i !== -1) toasts.splice(i, 1)
}

function addToast(opts: ToastOptions): number {
  const id = ++counter
  const toast: Toast = {
    id,
    message: opts.message,
    type: opts.type ?? 'info',
    actionLabel: opts.actionLabel,
    onAction: opts.onAction,
    duration: opts.duration ?? 6000,
  }
  toasts.push(toast)
  if (toast.duration > 0 && typeof window !== 'undefined') {
    window.setTimeout(() => removeToast(id), toast.duration)
  }
  return id
}

/** Reveal the OS file manager at the configured output directory. Best-effort. */
async function openOutputFolder() {
  try {
    const { outputDir } = await $fetch<{ outputDir: string }>(
      '/api/get-output-dir',
    )
    await $fetch('/api/open-folder', { query: { path: outputDir } })
  } catch {
    // Convenience action only — silently ignore if it fails.
  }
}

export function useToast() {
  return { toasts, addToast, removeToast, openOutputFolder }
}

/**
 * Standard confirmation shown whenever a tool writes results to the output
 * folder. Used across all saving tabs so the feedback is identical everywhere.
 * No-op when nothing was written.
 */
export function toastSavedToOutput(count: number): void {
  if (count <= 0) return
  addToast({
    type: 'success',
    message: `Im Output-Ordner gespeichert · ${count} ${
      count === 1 ? 'Datei' : 'Dateien'
    }`,
    actionLabel: 'Ordner öffnen',
    onAction: openOutputFolder,
  })
}
