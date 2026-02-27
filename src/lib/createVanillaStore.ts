import { useSyncExternalStore } from "react"
import { VanillaState, VanillaStateClass } from "./VanillaState"
import { registerInstance } from "./internals"

export function createVanillaStore<T extends VanillaState>(
  StateClass: VanillaStateClass<T>
): { useStore: () => T; getInstance: () => T } {
  const instance = new StateClass()
  const internals = registerInstance(instance)

  function subscribe(listener: () => void): () => void {
    internals.listeners.add(listener)
    return () => {
      internals.listeners.delete(listener)
    }
  }

  function getSnapshot(): number {
    return internals.version
  }

  function useStore(): T {
    useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
    return instance
  }

  function getInstance(): T {
    return instance
  }

  return { useStore, getInstance }
}
