import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { VanillaState } from "../lib/VanillaState"
import { rerender } from "../lib/rerender"
import { createVanillaStore } from "../lib/createVanillaStore"

class SharedCounter extends VanillaState {
  count = 0
  @rerender
  increment() {
    this.count++
  }
  @rerender
  decrement() {
    this.count--
  }
}

describe("createVanillaStore", () => {
  it("returns useStore and getInstance", () => {
    const store = createVanillaStore(SharedCounter)
    expect(typeof store.useStore).toBe("function")
    expect(typeof store.getInstance).toBe("function")
  })

  it("getInstance returns the singleton instance", () => {
    const store = createVanillaStore(SharedCounter)
    const a = store.getInstance()
    const b = store.getInstance()
    expect(a).toBe(b)
    expect(a).toBeInstanceOf(SharedCounter)
  })

  it("useStore returns the same instance as getInstance", () => {
    const store = createVanillaStore(SharedCounter)
    const { result } = renderHook(() => store.useStore())
    expect(result.current).toBe(store.getInstance())
  })

  it("useStore triggers re-render when @rerender method is called", () => {
    const store = createVanillaStore(SharedCounter)
    const { result } = renderHook(() => store.useStore())

    act(() => {
      result.current.increment()
    })
    expect(result.current.count).toBe(1)
  })

  it("shares state across multiple useStore hooks", () => {
    const store = createVanillaStore(SharedCounter)
    const { result: result1 } = renderHook(() => store.useStore())
    const { result: result2 } = renderHook(() => store.useStore())

    expect(result1.current).toBe(result2.current)

    act(() => {
      result1.current.increment()
    })
    expect(result2.current.count).toBe(1)
  })

  it("getInstance allows imperative mutation that reflects in hooks", () => {
    const store = createVanillaStore(SharedCounter)
    const { result } = renderHook(() => store.useStore())

    act(() => {
      store.getInstance().increment()
    })
    expect(result.current.count).toBe(1)
  })
})
