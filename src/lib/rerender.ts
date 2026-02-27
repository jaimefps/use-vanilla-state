import { VanillaState } from "./VanillaState"
import { notifySubscribers } from "./internals"

export function rerender(
  target: VanillaState,
  name: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const original = descriptor.value
  if (typeof original === "function") {
    descriptor.value = function (this: VanillaState, ...args: any[]) {
      if (!(this instanceof VanillaState)) {
        throw Error(
          "Can only use @rerender on class methods that extend VanillaState"
        )
      }
      const result = original.apply(this, args)
      if (result != null && typeof result.then === "function") {
        return result.then(
          (resolved: any) => {
            notifySubscribers(this)
            return resolved
          },
          (err: any) => {
            notifySubscribers(this)
            throw err
          }
        )
      }
      notifySubscribers(this)
      return result
    }
  }
  return descriptor
}
