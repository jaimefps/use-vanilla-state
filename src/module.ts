import { useEffect, useState } from "react"

type RenderInducer = () => void
type Listener = () => void

export type VanillaStore<T> = {
  get(): T
  set(next: T | ((prev: T) => T)): void
  mutate(mutator: (draft: T) => void): void
  subscribe(listener: Listener): () => void
}

export function createState<T>(initial: T | (() => T)): VanillaStore<T> {
  let value = typeof initial === "function" ? (initial as () => T)() : initial
  const listeners = new Set<Listener>()

  const notify = () => {
    for (const listener of Array.from(listeners)) {
      listener()
    }
  }

  return {
    get: () => value,
    set: (next) => {
      const nextValue =
        typeof next === "function" ? (next as (prev: T) => T)(value) : next
      if (Object.is(value, nextValue)) {
        return
      }
      value = nextValue
      notify()
    },
    mutate: (mutator) => {
      mutator(value)
      notify()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

export function useVanillaValue<T>(store: VanillaStore<T>) {
  const [, forceRender] = useState(0)

  useEffect(() => {
    return store.subscribe(() => {
      forceRender((tick) => tick + 1)
    })
  }, [store])

  return store.get()
}

export function useVanillaStore<T>(store: VanillaStore<T>) {
  const value = useVanillaValue(store)
  return [value, store.set, store.mutate] as const
}

export function useVanillaLocalState<T>(initial: T | (() => T)) {
  const [store] = useState(() => createState(initial))
  const value = useVanillaValue(store)
  return [value, store.set, store.mutate, store] as const
}

export abstract class VanillaState {
  __rerender: RenderInducer

  constructor(rerender: RenderInducer) {
    this.__rerender = rerender
  }
}

type VanillaSubClass<T extends VanillaState> = {
  new (rerender: RenderInducer): T
}

export function useVanillaState<T extends VanillaState>(
  CustomState: VanillaSubClass<T>
) {
  // state that induces rerenders:
  const [, setNum] = useState(0)

  // stable ref for state instance:
  const [instance] = useState(() => {
    const rerenderInducer: RenderInducer = () => {
      setNum((num) => num + 1)
    }
    return new CustomState(rerenderInducer)
  })

  return instance
}

export function rerender(
  target: VanillaState,
  name: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value
  if (typeof original === "function") {
    descriptor.value = function (...args: any[]) {
      if (this instanceof VanillaState) {
        try {
          const result = original.apply(this, args)
          this.__rerender()
          return result
        } catch (e) {
          throw e
        }
      } else {
        throw Error(
          "Can only use @rerender on class methods that extend VanillaState"
        )
      }
    }
  }
  return descriptor
}
