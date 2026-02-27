import { describe, it, expect } from "vitest"
import { VanillaState } from "../lib/VanillaState"
import { rerender } from "../lib/rerender"
import { registerInstance, getInternals } from "../lib/internals"

describe("VanillaState", () => {
  it("throws when instantiated directly", () => {
    // @ts-expect-error - testing runtime guard for JS users
    expect(() => new VanillaState()).toThrow(
      "VanillaState is abstract and cannot be instantiated directly"
    )
  })

  it("allows subclass instantiation", () => {
    class Counter extends VanillaState {
      count = 0
    }
    expect(() => new Counter()).not.toThrow()
    expect(new Counter()).toBeInstanceOf(VanillaState)
  })
})

describe("@rerender decorator", () => {
  it("calls notifySubscribers after sync method execution", () => {
    class Counter extends VanillaState {
      count = 0
      @rerender
      increment() {
        this.count++
      }
    }
    const instance = new Counter()
    const internals = registerInstance(instance)
    let notified = 0
    internals.listeners.add(() => notified++)

    instance.increment()
    expect(instance.count).toBe(1)
    expect(notified).toBe(1)

    instance.increment()
    expect(instance.count).toBe(2)
    expect(notified).toBe(2)
  })

  it("returns the original method return value for sync methods", () => {
    class State extends VanillaState {
      @rerender
      getValue() {
        return 42
      }
    }
    const instance = new State()
    registerInstance(instance)
    expect(instance.getValue()).toBe(42)
  })

  it("handles async methods and notifies after resolution", async () => {
    class State extends VanillaState {
      value = ""
      @rerender
      async fetchData() {
        this.value = "loaded"
        return "done"
      }
    }
    const instance = new State()
    const internals = registerInstance(instance)
    let notified = 0
    internals.listeners.add(() => notified++)

    const result = await instance.fetchData()
    expect(result).toBe("done")
    expect(instance.value).toBe("loaded")
    expect(notified).toBe(1)
  })

  it("notifies subscribers then rethrows on async rejection", async () => {
    class State extends VanillaState {
      error = ""
      @rerender
      async failingMethod() {
        this.error = "failed"
        throw new Error("async error")
      }
    }
    const instance = new State()
    const internals = registerInstance(instance)
    let notified = 0
    internals.listeners.add(() => notified++)

    await expect(instance.failingMethod()).rejects.toThrow("async error")
    expect(instance.error).toBe("failed")
    expect(notified).toBe(1)
  })

  it("does not notify on sync throw", () => {
    class State extends VanillaState {
      @rerender
      throwingMethod() {
        throw new Error("sync error")
      }
    }
    const instance = new State()
    const internals = registerInstance(instance)
    let notified = 0
    internals.listeners.add(() => notified++)

    expect(() => instance.throwingMethod()).toThrow("sync error")
    expect(notified).toBe(0)
  })

  it("throws when used on non-VanillaState class", () => {
    class NotState {
      // @ts-ignore
      @rerender
      action() {}
    }
    const instance = new NotState()
    expect(() => instance.action()).toThrow(
      "Can only use @rerender on class methods that extend VanillaState"
    )
  })
})
