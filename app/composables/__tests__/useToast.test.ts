import { beforeEach, describe, expect, it } from 'vitest'
import { toastSavedToOutput, useToast } from '../useToast'

describe('useToast', () => {
  const { toasts, addToast, removeToast } = useToast()

  beforeEach(() => {
    // Clear the module-level queue between tests (shared singleton).
    toasts.splice(0)
  })

  it('adds a toast and returns an id, removeToast removes it', () => {
    const id = addToast({ message: 'hi', duration: 0 })
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toMatchObject({ id, message: 'hi', type: 'info' })

    removeToast(id)
    expect(toasts).toHaveLength(0)
  })

  it('defaults type to info and preserves action metadata', () => {
    const onAction = () => {}
    addToast({ message: 'x', actionLabel: 'Go', onAction, duration: 0 })
    expect(toasts[0].type).toBe('info')
    expect(toasts[0].actionLabel).toBe('Go')
    expect(toasts[0].onAction).toBe(onAction)
  })

  it('removeToast with an unknown id is a no-op', () => {
    addToast({ message: 'keep', duration: 0 })
    removeToast(99999)
    expect(toasts).toHaveLength(1)
  })

  describe('toastSavedToOutput', () => {
    it('is a no-op when nothing was saved', () => {
      toastSavedToOutput(0)
      toastSavedToOutput(-1)
      expect(toasts).toHaveLength(0)
    })

    it('shows a success toast with an open-folder action (singular)', () => {
      toastSavedToOutput(1)
      expect(toasts).toHaveLength(1)
      expect(toasts[0]).toMatchObject({
        type: 'success',
        actionLabel: 'Ordner öffnen',
      })
      expect(toasts[0].message).toBe('Im Output-Ordner gespeichert · 1 Datei')
      expect(typeof toasts[0].onAction).toBe('function')
    })

    it('pluralizes the file count (plural)', () => {
      toastSavedToOutput(3)
      expect(toasts[0].message).toBe('Im Output-Ordner gespeichert · 3 Dateien')
    })
  })
})
