export type StoreInternals = {
  version: number
  listeners: Set<() => void>
}

const registry = new WeakMap<object, StoreInternals>()

export function registerInstance(instance: object): StoreInternals {
  const internals: StoreInternals = {
    version: 0,
    listeners: new Set(),
  }
  registry.set(instance, internals)
  return internals
}

export function getInternals(instance: object): StoreInternals | undefined {
  return registry.get(instance)
}

export function notifySubscribers(instance: object): void {
  const internals = registry.get(instance)
  if (internals) {
    internals.version++
    internals.listeners.forEach((listener) => listener())
  }
}
