import { VanillaState, useVanillaState } from "./module"
import "./App.css"

class Counter extends VanillaState {
  count = 0
  get state() {
    return this.count
  }
  increment() {
    this.count += 1
    return this
  }
  decrement() {
    this.count -= 1
    return this
  }
}

export default function App() {
  const counter = useVanillaState(Counter)

  return (
    <div className="App">
      {counter.state}

      <button
        onClick={() => {
          // Sample state change chain
          // with rerender() after mutations are done:
          counter.increment().decrement().increment().rerender()
        }}
      >
        inc
      </button>
    </div>
  )
}
