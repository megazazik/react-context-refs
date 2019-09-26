declare module ReactContextRefs {
  export interface Refs {
    myTest: { current: Element; meta: { hasError: boolean } };
    test2: { current: number; meta: { p: number } };
    [""]: { current: any; type: ""; meta: any };
  }

  export type RefType = keyof Refs;

  export type ValuesOf<T> = T[keyof T];

  export type RefsValues<T> = {
    [K in keyof T]: T[K] extends { current: infer V; meta: infer M }
      ? { type: K; current: V; meta: M }
      : never;
  };

  export type RefsValuesMap = RefsValues<Refs>;

  export type RefsData = ValuesOf<RefsValuesMap>;
}
