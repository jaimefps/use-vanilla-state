## React VanillaState

Enable use of regular javascript classes to track state in React components. Avoid React specific logic within the state management layer. MobX would be the correct approach to using something like this idea. This is just a very simple implementation of the concept of classes for state management.

### Install

```
$ npm install use-vanilla-state
```

### Example

The intent is to decouple state logic from React, such that you can write something that is easy to reason about, with little reference to specifics of the React framework:

```typescript
import { VanillaState, useVanillaState, rerender } from "use-vanilla-state"

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
      {myCounter.state.count}

      <button
        onClick={() => {
          myCounter.increase()
        }}
      >
        increase
      </button>

      <button
        onClick={() => {
          myCounter.silent("new secret").increase()
        }}
      >
        chain
      </button>
    </div>
  )
}
```
