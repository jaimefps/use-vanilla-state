export abstract class VanillaState {
  constructor() {
    if (new.target === VanillaState) {
      throw new Error("VanillaState is abstract and cannot be instantiated directly")
    }
  }
}

export type VanillaStateClass<T extends VanillaState> = {
  new (): T
}
