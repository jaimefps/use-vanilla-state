import { VanillaState } from "./VanillaState"
import { notifySubscribers, subscribeInternal } from "./internals"

function assertVanillaState(
  instance: unknown,
  caller: string
): asserts instance is VanillaState {
  if (!(instance instanceof VanillaState)) {
    throw Error(`${caller} expects an instance of a VanillaState subclass`)
  }
}

/**
 * Imperatively notify subscribers that `instance` changed. The
 * decorator-free alternative to `@rerender` — call `notify(this)` at the
 * end of a mutating method. Works in plain JavaScript with no build step.
 */
export function notify(instance: VanillaState): void {
  assertVanillaState(instance, "notify()")
  notifySubscribers(instance)
}

/**
 * Subscribe to changes on a VanillaState instance outside of React.
 * Returns an unsubscribe function.
 */
export function subscribe(
  instance: VanillaState,
  listener: () => void
): () => void {
  assertVanillaState(instance, "subscribe()")
  return subscribeInternal(instance, listener)
}
