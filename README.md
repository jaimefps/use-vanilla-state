## React VanillaState

Enable use of regular javascript classes and standalone stores to track state in React components. The goal is to keep the state layer React-free and use a thin adapter for rendering.

### Philosophy

- State and domain logic live outside React.
- React is only responsible for subscribing and rendering.
- You can choose mutable class state or immutable store updates.

### Install

```
$ npm install use-vanilla-state
```

### Example: Class-Based State (original API)

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

### Example: Standalone Store (React-free core)

```typescript
import { createState, useVanillaStore } from "use-vanilla-state"

const counter = createState(0)

export default function App() {
  const [count, setCount] = useVanillaStore(counter)
  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount((c) => c + 1)}>increase</button>
    </div>
  )
}
```

### Example: Local Store Per Component

```typescript
import { useVanillaLocalState } from "use-vanilla-state"

export default function App() {
  const [count, setCount] = useVanillaLocalState(0)
  return (
    <div>
      <div>{count}</div>
      <button onClick={() => setCount((c) => c + 1)}>increase</button>
    </div>
  )
}
```

### Example: Read-Only Subscription

```typescript
import { createState, useVanillaValue } from "use-vanilla-state"

const settings = createState({ theme: "light" })

export default function App() {
  const value = useVanillaValue(settings)
  return <div>Theme: {value.theme}</div>
}
```

### Example: Mutable Updates

```typescript
import { createState, useVanillaStore } from "use-vanilla-state"

const counter = createState({ count: 0 })

export default function App() {
  const [value, , mutate] = useVanillaStore(counter)
  return (
    <button
      onClick={() =>
        mutate((draft) => {
          draft.count += 1
        })
      }
    >
      {value.count}
    </button>
  )
}
```

### Example: External Subscription (React-free)

```typescript
import { createState } from "use-vanilla-state"

const store = createState(0)
const unsubscribe = store.subscribe(() => {
  console.log("value:", store.get())
})

store.set(1)
store.set((prev) => prev + 1)
unsubscribe()
```

### API

#### `createState<T>(initial: T | (() => T))`
Creates a standalone store with `get`, `set`, `mutate`, and `subscribe`.
Use `set` for immutable updates and `mutate` for in-place updates.

#### `useVanillaValue<T>(store: VanillaStore<T>)`
React hook that subscribes to a store and returns its current value.

#### `useVanillaStore<T>(store: VanillaStore<T>)`
React hook that returns `[value, set, mutate]`.

#### `useVanillaLocalState<T>(initial: T | (() => T))`
React hook that creates and owns a local store, returning `[value, set, mutate, store]`.

#### `VanillaState`
Base class for class-style state objects that can trigger React renders.

#### `useVanillaState(CustomState)`
Hook that instantiates a `VanillaState` subclass and wires it to React renders.

#### `@rerender`
Method decorator that triggers a React re-render after method execution.

### Store Contract

A `VanillaStore<T>` has the following shape:

```typescript
type VanillaStore<T> = {
  get(): T
  set(next: T | ((prev: T) => T)): void
  mutate(mutator: (draft: T) => void): void
  subscribe(listener: () => void): () => void
}
```

### When To Use Which API

- Use `VanillaState` + `@rerender` when you want class-style encapsulation and method chaining.
- Use `createState` when you want a standalone store that can be shared across components.
- Use `useVanillaLocalState` when you want a store scoped to a component instance.

### Notes And Caveats

- Subscriptions are synchronous and fire in the same tick as `set`/`mutate`.
- `useVanillaValue` relies on React effects to subscribe; updates before mount will not be observed.
- This library does not require React 18 or `useSyncExternalStore`.
- CRA dev server is most stable on Node 18 or 20. On newer Node versions, prefer running E2E tests against the production build.

### Testing

- Unit tests: `yarn test --watchAll=false`
- Cypress E2E: `yarn test:e2e:cypress`
- Playwright E2E: `yarn test:e2e:playwright`

`createState<T>(initial: T | (() => T))`
Creates a standalone store with `get`, `set`, `mutate`, and `subscribe`.
Use `set` for immutable updates and `mutate` for in-place updates.

`useVanillaValue<T>(store: VanillaStore<T>)`
React hook that subscribes to a store and returns its current value.

`useVanillaStore<T>(store: VanillaStore<T>)`
React hook that returns `[value, set, mutate]`.

`useVanillaLocalState<T>(initial: T | (() => T))`
React hook that creates and owns a local store, returning `[value, set, mutate, store]`.

`VanillaState`
Base class for class-style state objects that can trigger React renders.

`useVanillaState(CustomState)`
Hook that instantiates a `VanillaState` subclass and wires it to React renders.

`@rerender`
Method decorator that triggers a React re-render after method execution.
