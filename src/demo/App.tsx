import {
  VanillaState,
  useVanillaState,
  rerender,
  notify,
  createVanillaStore,
} from "../lib"
import "./App.css"

class Counter extends VanillaState {
  private count = 0
  private secret = "secret"
  get state() {
    return {
      count: this.count,
      secret: this.secret,
    } as const
  }
  @rerender
  increase() {
    this.count += 1
    return this
  }
  @rerender
  decrease() {
    this.count -= 1
    return this
  }
  silent(s: string) {
    this.secret = s
    return this
  }
}

class SharedCounter extends VanillaState {
  count = 0
  @rerender
  increment() {
    this.count++
  }
}

const sharedStore = createVanillaStore(SharedCounter)

// Decorator-free counter — plain JS with notify(this)
class PlainCounter extends VanillaState {
  count = 0
  increment() {
    this.count++
    notify(this)
  }
}

function PlainSection() {
  const plain = useVanillaState(PlainCounter)
  return (
    <>
      <div id="plain-view">plain: {plain.count}</div>
      <button id="plain-action" onClick={() => plain.increment()}>
        plain +1
      </button>
    </>
  )
}

function SharedDisplay() {
  const shared = sharedStore.useStore()
  return <div id="shared-view">shared: {shared.count}</div>
}

function SharedButton() {
  const shared = sharedStore.useStore()
  return (
    <button id="shared-action" onClick={() => shared.increment()}>
      shared +1
    </button>
  )
}

export default function App() {
  const myCounter = useVanillaState(Counter)

  return (
    <div className="app">
      <div id="secret-view">{myCounter.state.secret}</div>
      <div id="count-view">{myCounter.state.count}</div>

      <button
        id="increase-action"
        onClick={() => {
          myCounter.increase()
        }}
      >
        increase
      </button>

      <button
        id="decrease-action"
        onClick={() => {
          myCounter.decrease()
        }}
      >
        decrease
      </button>

      <button
        id="silent-action"
        onClick={() => {
          myCounter.silent("change")
        }}
      >
        silent
      </button>

      <hr />
      <SharedDisplay />
      <SharedButton />

      <hr />
      <PlainSection />
    </div>
  )
}
