import { VanillaState } from "./VanillaState"
import { notifySubscribers } from "./internals"

function wrap<A extends unknown[], R>(
  original: (this: VanillaState, ...args: A) => R
): (this: VanillaState, ...args: A) => R {
  return function (this: VanillaState, ...args: A): R {
    if (!(this instanceof VanillaState)) {
      throw Error(
        "@rerender method called without its VanillaState instance. " +
          "Either the class does not extend VanillaState, or the method was " +
          "detached from its instance (e.g. passed as an unbound callback — " +
          "use an arrow wrapper like `() => state.method()` instead)"
      )
    }
    const result = original.apply(this, args) as any
    if (result != null && typeof result.then === "function") {
      // Notify now so state set before the first await (loading flags,
      // optimistic values) renders immediately, then again once settled.
      notifySubscribers(this)
      return result.then(
        (resolved: unknown) => {
          notifySubscribers(this)
          return resolved
        },
        (err: unknown) => {
          notifySubscribers(this)
          throw err
        }
      )
    }
    notifySubscribers(this)
    return result
  }
}

// Standard (TC39 / TypeScript 5+ default) decorator signature
export function rerender<T extends VanillaState, A extends unknown[], R>(
  value: (this: T, ...args: A) => R,
  context: ClassMethodDecoratorContext<T>
): (this: T, ...args: A) => R
// Legacy (experimentalDecorators) signature
export function rerender(
  target: object,
  name: string | symbol,
  descriptor: PropertyDescriptor
): PropertyDescriptor
export function rerender(...args: any[]): any {
  const [first, second, third] = args
  const isStandard =
    typeof second === "object" &&
    second !== null &&
    typeof second.kind === "string"

  if (isStandard) {
    if (second.kind !== "method" || typeof first !== "function") {
      throw Error("@rerender can only decorate class methods")
    }
    return wrap(first)
  }

  const descriptor: PropertyDescriptor = third
  if (typeof descriptor?.value === "function") {
    descriptor.value = wrap(descriptor.value)
  }
  return descriptor
}
