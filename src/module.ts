import { useCallback, useState } from "react"

// Extends the child class to include a rerender() method that
// only needs to be referenced in the scope of React components,
// outside of the implementation of state management.
export class VanillaState {
  protected rerender

  constructor(rerender: () => void) {
    this.rerender = rerender
  }
}

// TODO: type for "ClassDef"
export function useVanillaState(ClassDef: any) {
  // allows us to force a rerender in React.
  const [, setNum] = useState(0)

  // fed to `new ClassDef()` to allow us to extend the
  // class instance to power the rerender() method.
  const rerender = useCallback(() => {
    setNum((num) => num + 1)
  }, [setNum])

  // create instance within React:
  const [entity] = useState(() => {
    return new ClassDef(rerender)
  })

  return entity
}
