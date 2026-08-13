import { describe, it, expect } from "vitest"
import {
  getInternals,
  notifySubscribers,
  subscribeInternal,
} from "../lib/internals"

describe("internals", () => {
  it("getInternals lazily creates internals for any object", () => {
    const obj = {}
    const internals = getInternals(obj)
    expect(internals.version).toBe(0)
    expect(internals.listeners.size).toBe(0)
  })

  it("getInternals returns the same internals for the same object", () => {
    const obj = {}
    expect(getInternals(obj)).toBe(getInternals(obj))
    expect(getInternals(obj)).not.toBe(getInternals({}))
  })

  it("subscribeInternal adds a listener and returns an unsubscribe", () => {
    const obj = {}
    let called = 0
    const unsubscribe = subscribeInternal(obj, () => called++)
    notifySubscribers(obj)
    expect(called).toBe(1)

    unsubscribe()
    notifySubscribers(obj)
    expect(called).toBe(1)
  })

  it("notifySubscribers increments version and calls listeners", () => {
    const obj = {}
    let called = 0
    subscribeInternal(obj, () => called++)
    notifySubscribers(obj)
    expect(getInternals(obj).version).toBe(1)
    expect(called).toBe(1)

    notifySubscribers(obj)
    expect(getInternals(obj).version).toBe(2)
    expect(called).toBe(2)
  })

  it("notifySubscribers is safe on objects nobody subscribed to", () => {
    expect(() => notifySubscribers({})).not.toThrow()
  })
})
