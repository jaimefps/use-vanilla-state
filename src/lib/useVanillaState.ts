import { useRef, useSyncExternalStore, useCallback } from "react"
import { VanillaState, VanillaStateClass } from "./VanillaState"
import { registerInstance, getInternals } from "./internals"

export function useVanillaState<T extends VanillaState>(
  StateClass: VanillaStateClass<T>
): T {
  const instanceRef = useRef<T | null>(null)
  if (instanceRef.current === null) {
    instanceRef.current = new StateClass()
    registerInstance(instanceRef.current)
  }
  const instance = instanceRef.current

  const subscribe = useCallback(
    (listener: () => void) => {
      const internals = getInternals(instance)!
      internals.listeners.add(listener)
      return () => {
        internals.listeners.delete(listener)
      }
    },
    [instance]
  )

  const getSnapshot = useCallback(() => {
    return getInternals(instance)!.version
  }, [instance])

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return instance
}
