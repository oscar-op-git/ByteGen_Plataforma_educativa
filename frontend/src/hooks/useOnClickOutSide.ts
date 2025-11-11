import { useEffect } from 'react'

/**
 * Cierra un panel/dropdown cuando se hace click fuera del contenedor.
 * Acepta refs nullables y tanto RefObject como MutableRefObject.
 */
export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null> | React.MutableRefObject<T | null>,
  onOutside: () => void
) {
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return
      if (!el.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handle, true)
    return () => document.removeEventListener('mousedown', handle, true)
  }, [ref, onOutside])
}
