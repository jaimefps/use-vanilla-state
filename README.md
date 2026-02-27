# use-vanilla-state

Manage React component state using plain JavaScript classes. Write state logic with zero React-specific APIs, then connect it to your components with a single hook.

## Install

```
npm install use-vanilla-state
```

Requires React 18 or later.

## Quick Start

```typescript
import { VanillaState, useVanillaState, rerender } from "use-vanilla-state"

class Counter extends VanillaState {
  count = 0

  @rerender
  increment() {
    this.count++
  }

  @rerender
  decrement() {
    this.count--
  }
}

function App() {
  const counter = useVanillaState(Counter)

  return (
    <div>
      <span>{counter.count}</span>
      <button onClick={() => counter.increment()}>+</button>
      <button onClick={() => counter.decrement()}>-</button>
    </div>
  )
}
```

## API

### `VanillaState`

Abstract base class that all state classes must extend. It serves as a marker — your class will not have any inherited fields or methods. Just extend it and write plain class logic.

```typescript
import { VanillaState } from "use-vanilla-state"

class TodoState extends VanillaState {
  items: string[] = []
  filter: "all" | "done" | "pending" = "all"

  get filtered() {
    // pure logic, no React involved
    return this.items.filter(/* ... */)
  }
}
```

No constructor boilerplate is required. Your class can use private fields, getters, inheritance, or any other standard class features.

### `@rerender`

Method decorator that triggers a React re-render after the decorated method executes. Apply it to any method on a `VanillaState` subclass that mutates state you want reflected in the UI.

```typescript
import { VanillaState, rerender } from "use-vanilla-state"

class FormState extends VanillaState {
  name = ""
  email = ""
  submitting = false
  error: string | null = null

  // Sync method — re-renders immediately after execution
  @rerender
  setName(name: string) {
    this.name = name
  }

  // Async method — re-renders after the promise settles
  @rerender
  async submit() {
    this.submitting = true
    try {
      await fetch("/api/submit", {
        method: "POST",
        body: JSON.stringify({ name: this.name, email: this.email }),
      })
    } catch (e) {
      this.error = (e as Error).message
    } finally {
      this.submitting = false
    }
  }

  // No decorator — mutates state silently without triggering re-render
  setEmail(email: string) {
    this.email = email
  }
}
```

**Behavior details:**

- **Sync methods**: Re-render fires immediately after the method returns. If the method throws, no re-render occurs (the state mutation is likely incomplete).
- **Async methods**: Re-render fires after the returned promise resolves or rejects. This means your component reflects the final state of the async operation, not intermediate states.
- **Non-VanillaState classes**: Throws an error at call time if `@rerender` is used on a class that does not extend `VanillaState`.

> **Note:** TypeScript requires `"experimentalDecorators": true` in your `tsconfig.json` to use decorator syntax.

### `useVanillaState(StateClass)`

React hook that creates a component-local instance of a `VanillaState` subclass. The instance is created once and remains stable across re-renders — same identity, same reference.

```typescript
import { VanillaState, useVanillaState, rerender } from "use-vanilla-state"

class Counter extends VanillaState {
  count = 0

  @rerender
  increment() {
    this.count++
  }
}

function MyComponent() {
  const counter = useVanillaState(Counter)
  return <button onClick={() => counter.increment()}>{counter.count}</button>
}
```

Each component that calls `useVanillaState(Counter)` gets its own independent instance. The hook integrates with React 18's `useSyncExternalStore`, which means it works correctly with concurrent features like `startTransition` and `Suspense`.

**Type signature:**

```typescript
function useVanillaState<T extends VanillaState>(StateClass: new () => T): T
```

- `StateClass` must be a class that extends `VanillaState` and has a no-argument constructor.
- Returns the class instance typed as `T`, so all your fields and methods are fully typed.

### `createVanillaStore(StateClass)`

Factory function that creates a shared singleton store. Unlike `useVanillaState`, the state is shared across all components that subscribe to it. Call this at module scope to define your store, then use the returned `useStore` hook inside components.

```typescript
import { VanillaState, rerender, createVanillaStore } from "use-vanilla-state"

class AuthState extends VanillaState {
  user: { name: string } | null = null
  loading = false

  @rerender
  async login(credentials: { email: string; password: string }) {
    this.loading = true
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      })
      this.user = await res.json()
    } finally {
      this.loading = false
    }
  }

  @rerender
  logout() {
    this.user = null
  }
}

// Create the store at module scope — this runs once
const authStore = createVanillaStore(AuthState)

// Export the hook for components
export const useAuth = authStore.useStore

// Export getInstance for use outside React (tests, scripts, etc.)
export const getAuth = authStore.getInstance
```

```typescript
// In any component — all see the same state
function NavBar() {
  const auth = useAuth()
  return auth.user ? <span>{auth.user.name}</span> : <LoginButton />
}

function ProfilePage() {
  const auth = useAuth()
  if (auth.loading) return <Spinner />
  return <div>{auth.user?.name}</div>
}
```

**Type signature:**

```typescript
function createVanillaStore<T extends VanillaState>(
  StateClass: new () => T
): {
  useStore: () => T
  getInstance: () => T
}
```

**Returns:**

- `useStore()` — React hook. Subscribes the calling component to state changes. Returns the singleton instance.
- `getInstance()` — Returns the raw singleton instance. Useful for imperative logic outside of React (tests, event handlers in non-React code, server-side scripts, etc.).

## Patterns

### Private fields with a getter

Keep your state encapsulated and expose a read-only view:

```typescript
class Counter extends VanillaState {
  private count = 0

  get state() {
    return { count: this.count } as const
  }

  @rerender
  increment() {
    this.count++
  }
}
```

### Method chaining

Methods can return `this` for chaining. The `@rerender` decorator preserves return values:

```typescript
class FormState extends VanillaState {
  name = ""
  email = ""

  @rerender
  setName(name: string) {
    this.name = name
    return this
  }

  @rerender
  setEmail(email: string) {
    this.email = email
    return this
  }
}

// In a component:
state.setName("Alice").setEmail("alice@example.com")
```

### Silent mutations

Methods without `@rerender` mutate state without triggering a re-render. This is useful for batching multiple changes before a single re-render:

```typescript
class BatchState extends VanillaState {
  a = 0
  b = 0

  // Silent — no re-render
  setA(val: number) {
    this.a = val
  }

  // This triggers the re-render after both fields are set
  @rerender
  setB(val: number) {
    this.b = val
  }
}

// In a handler:
state.setA(1)  // no re-render yet
state.setB(2)  // re-renders with a=1, b=2
```

### Testing state classes

Since your state is a plain class, you can unit test it without React:

```typescript
import { describe, it, expect } from "vitest"

describe("Counter", () => {
  it("increments count", () => {
    const counter = new Counter()
    counter.increment()
    expect(counter.count).toBe(1)
  })
})
```

For shared stores, use `getInstance()`:

```typescript
const store = createVanillaStore(Counter)
store.getInstance().increment()
expect(store.getInstance().count).toBe(1)
```

## Migration from v0.x

v1.0 has breaking changes from v0.x:

1. **Remove `super(rerender)` from constructors.** `VanillaState` no longer takes a constructor parameter. If your subclass had `constructor(rerender) { super(rerender) }`, delete it entirely.

2. **Remove `__rerender` usage.** The `__rerender` field no longer exists. Use the `@rerender` decorator on methods instead.

3. **Update peer dependency.** React 18+ is now required (was 16.8+).

**Before (v0.x):**

```typescript
class Counter extends VanillaState {
  count = 0
  increment() {
    this.count++
    this.__rerender()
  }
}
```

**After (v1.0):**

```typescript
class Counter extends VanillaState {
  count = 0
  @rerender
  increment() {
    this.count++
  }
}
```

## TypeScript Setup

Add `experimentalDecorators` to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## License

MIT
