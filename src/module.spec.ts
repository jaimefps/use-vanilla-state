import { useVanillaState, VanillaState, rerender } from "./module"
import { renderHook } from "@testing-library/react"

describe("useVanillaState", () => {
  it("returns instance of VanillaState subclass", () => {
    class Counter extends VanillaState {}
    const { result } = renderHook(() => useVanillaState(Counter))
    expect(result.current instanceof VanillaState).toBe(true)
  })
})

describe("VanillaState", () => {
  it("invokes rerenderInducer when __rerender is called", () => {
    let state = 0
    const rerenderInducer = () => (state += 1)
    class Counter extends VanillaState {}
    const instance = new Counter(rerenderInducer)
    instance.__rerender()
    instance.__rerender()
    expect(state).toBe(2)
  })
})

describe("@rerender", () => {
  it("invokes rerenderInducer when decorated method is called", () => {
    let state = 0
    const rerenderInducer = () => (state += 1)
    class Counter extends VanillaState {
      @rerender
      action() {}
    }
    const instance = new Counter(rerenderInducer)
    instance.action()
    instance.action()
    instance.action()
    expect(state).toBe(3)
  })

  it("throws error when decorating method in class that doesn't extend VanillaState", () => {
    let e: any
    try {
      class Counter {
        // @ts-ignore
        @rerender
        action() {}
      }
      const instance = new Counter()
      instance.action()
    } catch (error) {
      e = error
    }
    expect(e.message).toEqual(
      "Can only use @rerender on class methods that extend VanillaState"
    )
  })
})
