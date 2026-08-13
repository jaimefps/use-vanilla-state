import { describe, it, expect } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { createElement } from "react"
import { VanillaState } from "../lib/VanillaState"
import { notify, subscribe } from "../lib/vanilla"
import { useVanillaState } from "../lib/useVanillaState"

// The decorator-free pattern: mutate, then notify(this).
// This is what plain untranspiled JavaScript users write.
class Counter extends VanillaState {
  count = 0
  increment() {
    this.count++
    notify(this)
  }
}

describe("notify", () => {
  it("notifies subscribers imperatively", () => {
    const counter = new Counter()
    let notified = 0
    subscribe(counter, () => notified++)

    counter.increment()
    expect(counter.count).toBe(1)
    expect(notified).toBe(1)
  })

  it("drives React re-renders without any decorator", () => {
    function App() {
      const counter = useVanillaState(Counter)
      return createElement(
        "button",
        { onClick: () => counter.increment() },
        `count: ${counter.count}`
      )
    }
    render(createElement(App))
    const button = screen.getByRole("button")
    expect(button.textContent).toBe("count: 0")

    act(() => button.click())
    expect(button.textContent).toBe("count: 1")
  })

  it("throws on non-VanillaState values", () => {
    expect(() => notify({} as any)).toThrow(
      "notify() expects an instance of a VanillaState subclass"
    )
  })
})

describe("subscribe", () => {
  it("returns an unsubscribe function", () => {
    const counter = new Counter()
    let notified = 0
    const unsubscribe = subscribe(counter, () => notified++)

    counter.increment()
    expect(notified).toBe(1)

    unsubscribe()
    counter.increment()
    expect(notified).toBe(1)
  })

  it("supports multiple independent listeners", () => {
    const counter = new Counter()
    let a = 0
    let b = 0
    subscribe(counter, () => a++)
    const unsubscribeB = subscribe(counter, () => b++)

    counter.increment()
    expect(a).toBe(1)
    expect(b).toBe(1)

    unsubscribeB()
    counter.increment()
    expect(a).toBe(2)
    expect(b).toBe(1)
  })

  it("throws on non-VanillaState values", () => {
    expect(() => subscribe({} as any, () => {})).toThrow(
      "subscribe() expects an instance of a VanillaState subclass"
    )
  })
})
