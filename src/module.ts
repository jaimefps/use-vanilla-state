import { useCallback, useState } from "react"

type Rerender = () => void

// Provides a rerender() method to the subclasses that only
// needs to be referenced in the scope of React components,
// outside of the implementation of state management.
export abstract class VanillaState {
  rerender

  constructor(rerender: Rerender) {
    this.rerender = rerender
  }
}

export function useVanillaState<T extends VanillaState>(CustomState: {
  new (rerender: Rerender): T
}) {
  // allows us to force rerender
  const [, setNum] = useState(0)

  const rerender = useCallback(() => {
    setNum((num) => num + 1)
  }, [setNum])

  // create stable ref for the state instance
  const [entity] = useState(() => {
    return new CustomState(rerender)
  })

  return entity
}
