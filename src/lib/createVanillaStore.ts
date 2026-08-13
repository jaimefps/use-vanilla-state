import { useSyncExternalStore } from "react"
import { VanillaState, VanillaStateClass } from "./VanillaState"
import { getInternals, subscribeInternal } from "./internals"

export function createVanillaStore<T extends VanillaState>(
  StateClass: VanillaStateClass<T>
): { useStore: () => T; getInstance: () => T } {
  const instance = new StateClass()

  function subscribe(listener: () => void): () => void {
    return subscribeInternal(instance, listener)
  }

  function getSnapshot(): number {
    return getInternals(instance).version
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
