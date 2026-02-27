import { describe, it, expect } from "vitest"
import {
  registerInstance,
  getInternals,
  notifySubscribers,
} from "../lib/internals"

describe("internals", () => {
  it("registerInstance creates internals for an object", () => {
    const obj = {}
    const internals = registerInstance(obj)
    expect(internals.version).toBe(0)
    expect(internals.listeners.size).toBe(0)
  })

  it("getInternals returns undefined for unregistered objects", () => {
    expect(getInternals({})).toBeUndefined()
  })

  it("getInternals returns internals for registered objects", () => {
    const obj = {}
    const internals = registerInstance(obj)
    expect(getInternals(obj)).toBe(internals)
  })

  it("notifySubscribers increments version and calls listeners", () => {
    const obj = {}
    registerInstance(obj)
    let called = 0
    getInternals(obj)!.listeners.add(() => {
      called++
    })
    notifySubscribers(obj)
    expect(getInternals(obj)!.version).toBe(1)
    expect(called).toBe(1)

    notifySubscribers(obj)
    expect(getInternals(obj)!.version).toBe(2)
    expect(called).toBe(2)
  })

  it("notifySubscribers is a no-op for unregistered objects", () => {
    expect(() => notifySubscribers({})).not.toThrow()
  })
})
