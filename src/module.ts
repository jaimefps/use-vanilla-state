import { useState } from "react"

type RenderInducer = () => void

export abstract class VanillaState {
  __rerender

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
    descriptor.value = function (...args: any) {
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
