import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { VanillaState } from "../lib/VanillaState"
import { rerender } from "../lib/rerender"
import { useVanillaState } from "../lib/useVanillaState"

describe("useVanillaState", () => {
  it("returns an instance of the provided VanillaState subclass", () => {
    class Counter extends VanillaState {
      count = 0
    }
    const { result } = renderHook(() => useVanillaState(Counter))
    expect(result.current).toBeInstanceOf(Counter)
    expect(result.current).toBeInstanceOf(VanillaState)
  })

  it("returns a stable instance across re-renders", () => {
    class Counter extends VanillaState {
      count = 0
    }
    const { result, rerender: rerenderHook } = renderHook(() =>
      useVanillaState(Counter)
    )
    const first = result.current
    rerenderHook()
    expect(result.current).toBe(first)
  })

  it("triggers re-render when @rerender method is called", () => {
    class Counter extends VanillaState {
      count = 0
      @rerender
      increment() {
        this.count++
      }
    }
    const { result } = renderHook(() => useVanillaState(Counter))

    act(() => {
      result.current.increment()
    })
    expect(result.current.count).toBe(1)

    act(() => {
      result.current.increment()
    })
    expect(result.current.count).toBe(2)
  })

  it("does not re-render for non-decorated methods", () => {
    let renderCount = 0
    class State extends VanillaState {
      value = "initial"
      silentUpdate(v: string) {
        this.value = v
      }
    }
    const { result } = renderHook(() => {
      renderCount++
      return useVanillaState(State)
    })
    const initialRenderCount = renderCount

    act(() => {
      result.current.silentUpdate("changed")
    })
    expect(renderCount).toBe(initialRenderCount)
  })
})
