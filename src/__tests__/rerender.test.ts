import { describe, it, expect } from "vitest"
import { VanillaState } from "../lib/VanillaState"
import { rerender } from "../lib/rerender"
import { subscribe } from "../lib/vanilla"

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
  it("notifies subscribers after sync method execution", () => {
    class Counter extends VanillaState {
      count = 0
      @rerender
      increment() {
        this.count++
      }
    }
    const instance = new Counter()
    let notified = 0
    subscribe(instance, () => notified++)

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
    expect(instance.getValue()).toBe(42)
  })

  it("notifies before the first await and again after resolution", async () => {
    let resolveFetch: (value: string) => void
    class State extends VanillaState {
      loading = false
      value = ""
      @rerender
      async fetchData() {
        this.loading = true
        this.value = await new Promise<string>((resolve) => {
          resolveFetch = resolve
        })
        this.loading = false
        return "done"
      }
    }
    const instance = new State()
    let notified = 0
    subscribe(instance, () => notified++)

    const pending = instance.fetchData()
    // first notification fires synchronously, so loading flags render
    expect(instance.loading).toBe(true)
    expect(notified).toBe(1)

    resolveFetch!("loaded")
    const result = await pending
    expect(result).toBe("done")
    expect(instance.value).toBe("loaded")
    expect(instance.loading).toBe(false)
    expect(notified).toBe(2)
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
    let notified = 0
    subscribe(instance, () => notified++)

    await expect(instance.failingMethod()).rejects.toThrow("async error")
    expect(instance.error).toBe("failed")
    expect(notified).toBe(2)
  })

  it("does not notify on sync throw", () => {
    class State extends VanillaState {
      @rerender
      throwingMethod() {
        throw new Error("sync error")
      }
    }
    const instance = new State()
    let notified = 0
    subscribe(instance, () => notified++)

    expect(() => instance.throwingMethod()).toThrow("sync error")
    expect(notified).toBe(0)
  })

  it("throws when the method runs without a VanillaState instance", () => {
    class NotState {
      // @ts-ignore
      @rerender
      action() {}
    }
    const instance = new NotState()
    expect(() => instance.action()).toThrow(
      "@rerender method called without its VanillaState instance"
    )
  })

  it("throws when the detached method is called as a bare function", () => {
    class Counter extends VanillaState {
      count = 0
      @rerender
      increment() {
        this.count++
      }
    }
    const { increment } = new Counter()
    expect(() => increment()).toThrow(
      "@rerender method called without its VanillaState instance"
    )
  })

  it("supports the legacy experimentalDecorators signature", () => {
    class Counter extends VanillaState {
      count = 0
      increment() {
        this.count++
      }
    }
    // simulate what a legacy-decorators compiler emits
    const descriptor = Object.getOwnPropertyDescriptor(
      Counter.prototype,
      "increment"
    )!
    const patched = rerender(Counter.prototype, "increment", descriptor)
    Object.defineProperty(Counter.prototype, "increment", patched)

    const instance = new Counter()
    let notified = 0
    subscribe(instance, () => notified++)

    instance.increment()
    expect(instance.count).toBe(1)
    expect(notified).toBe(1)
  })

  it("rejects standard-decorator usage on non-method targets", () => {
    expect(() =>
      // simulate e.g. @rerender on a getter under standard decorators
      (rerender as any)(function () {}, { kind: "getter", name: "value" })
    ).toThrow("@rerender can only decorate class methods")
  })
})
