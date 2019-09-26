declare module ReactContextRefs {
  export interface Refs {
    [""]: { current: any; meta: any };
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
