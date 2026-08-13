export type StoreInternals = {
  version: number
  listeners: Set<() => void>
}

const registry = new WeakMap<object, StoreInternals>()

export function getInternals(instance: object): StoreInternals {
  let internals = registry.get(instance)
  if (!internals) {
    internals = {
      version: 0,
      listeners: new Set(),
    }
    registry.set(instance, internals)
  }
  return internals
}

export function subscribeInternal(
  instance: object,
  listener: () => void
): () => void {
  const internals = getInternals(instance)
  internals.listeners.add(listener)
  return () => {
    internals.listeners.delete(listener)
  }
}

export function notifySubscribers(instance: object): void {
  const internals = getInternals(instance)
  internals.version++
  internals.listeners.forEach((listener) => listener())
}
