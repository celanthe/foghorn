import { useEffect, useRef } from 'react'

/**
 * Focus trap + Escape key handler for dialog panels.
 * Returns a ref to attach to the dialog panel element.
 *
 * @param {function} onClose - Called when Escape is pressed
 */
export default function useDialogFocus(onClose) {
  const panelRef = useRef(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    // Focus the panel itself on mount
    panel.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const focusable = panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    panel.addEventListener('keydown', handleKeyDown)
    return () => panel.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return panelRef
}
