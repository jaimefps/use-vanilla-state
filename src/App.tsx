import { VanillaState, useVanillaState, rerender } from "./module"
import "./App.css"

class Counter extends VanillaState {
  private count = 0
  private secret = "secret"

  get state() {
    return {
      count: this.count,
      secret: this.secret
    } as const
  }

  // decorator induces a rerender
  // when this method is called:
  @rerender
  increase() {
    this.count += 1
    return this
  }

  // if no decorator, then you can make independent
  // changes from the react rerender cycle:
  silent(s: string) {
    this.secret = s
    return this
  }
}

export default function App() {
  const myCounter = useVanillaState(Counter)

  return (
    <div className="app">
      <div>{myCounter.state.secret}</div>
      <div>{myCounter.state.count}</div>

      <button
        onClick={() => {
          myCounter.increase()
        }}
      >
        increase
      </button>

      <button
        onClick={() => {
          myCounter.increase().silent("new secret")
        }}
      >
        chain
      </button>
    </div>
  )
}
