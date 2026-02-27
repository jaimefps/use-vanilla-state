import {
  createState,
  useVanillaLocalState,
  useVanillaState,
  useVanillaStore,
  useVanillaValue,
  VanillaState,
  rerender,
} from "./module"
import { act, renderHook } from "@testing-library/react"

describe("useVanillaState", () => {
  it("returns instance of VanillaState subclass", () => {
    class Counter extends VanillaState {}
    const { result } = renderHook(() => useVanillaState(Counter))
    expect(result.current instanceof VanillaState).toBe(true)
  })
})

describe("createState", () => {
  it("get/set works and notifies subscribers", () => {
    const store = createState(0)
    const calls: number[] = []
    const unsubscribe = store.subscribe(() => {
      calls.push(store.get())
    })

    store.set(1)
    store.set((prev) => prev + 1)
    unsubscribe()
    store.set(10)

    expect(calls).toEqual([1, 2])
    expect(store.get()).toBe(10)
  })

  it("mutate notifies subscribers", () => {
    const store = createState({ count: 0 })
    let hits = 0
    store.subscribe(() => {
      hits += 1
    })
    store.mutate((draft) => {
      draft.count += 1
    })
    expect(store.get().count).toBe(1)
    expect(hits).toBe(1)
  })
})

describe("useVanillaValue", () => {
  it("rerenders on store updates", () => {
    const store = createState(0)
    const { result } = renderHook(() => useVanillaValue(store))
    expect(result.current).toBe(0)
    act(() => {
      store.set(1)
    })
    expect(result.current).toBe(1)
  })
})

describe("useVanillaStore", () => {
  it("returns tuple with value and setters", () => {
    const store = createState(5)
    const { result } = renderHook(() => useVanillaStore(store))
    expect(result.current[0]).toBe(5)
    act(() => {
      result.current[1](6)
    })
    expect(result.current[0]).toBe(6)
  })
})

describe("useVanillaLocalState", () => {
  it("creates and owns a store instance", () => {
    const { result } = renderHook(() => useVanillaLocalState(1))
    const store = result.current[3]
    expect(store.get()).toBe(1)
    act(() => {
      store.set(2)
    })
    expect(result.current[0]).toBe(2)
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
