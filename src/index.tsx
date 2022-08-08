///<reference path="../declarations/index.d.ts" />
import * as React from "react";

type RefsData = ReactContextRefs.RefsData;

const Context = React.createContext<RefsContext>({
  refs: [],
  register: () => {},
  setMeta: () => {}
});

interface RefsContext {
  refs: RefsData[];
  register: (key: any, ref?: RefsData) => void;
  setMeta: (key: any, meta: any) => void;
}

type FCProps = {
  children?: React.ReactNode
};

export const RefProvider: React.FC<FCProps> = ({ children }) => {
  const { current: refsMap } = React.useRef<Map<any, RefsData>>(new Map());

  const [refs, setRefs] = React.useState<RefsData[]>([]);

  const register = React.useCallback<RefsContext["register"]>(
    (key, refData) => {
      if (refData == null) {
        if (refsMap.has(key)) {
          refsMap.delete(key);
          setRefs(Array.from(refsMap.values()));
        }
      } else {
        const oldRefData = refsMap.get(key) || ({} as RefsData);
        if (
          oldRefData.current !== refData.current ||
          oldRefData.meta !== refData.meta ||
          oldRefData.type !== refData.type
        ) {
          refsMap.set(key, refData);
          setRefs(Array.from(refsMap.values()));
        }
      }
    },
    [setRefs]
  );

  const setMeta = React.useCallback<RefsContext["setMeta"]>(
    (key, meta) => {
      if (!refsMap.has(key)) {
        return;
      }
      const refData = refsMap.get(key);
      if (!refData) {
        return;
      }
      refData.meta = meta;
    },
    [setRefs]
  );

  const context = React.useMemo(
    () => ({
      refs,
      register,
      setMeta
    }),
    [refs, register]
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
};

export function useRefs(): RefsData[];
export function useRefs<T extends ReactContextRefs.RefType>(
  type: T
): Array<ReactContextRefs.RefsValuesMap[T]>;
export function useRefs<T extends ReactContextRefs.RefType>(type?: T) {
  const { refs } = React.useContext(Context);

  if (typeof type === "undefined") {
    return refs;
  }

  return refs.filter(ref => ref.type === type);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined"
    ? React.useLayoutEffect
    : React.useEffect;

export function useContextRef(meta?: any): (value: any) => void;
export function useContextRef<T extends ReactContextRefs.RefType>(
  type: T,
  meta: ReactContextRefs.RefsValuesMap[T]["meta"]
): (value: ReactContextRefs.RefsValuesMap[T]["current"]) => void;
export function useContextRef(typeParam: any, metaParam?: any) {
  const type = typeof metaParam === "undefined" ? "" : typeParam;
  const meta = typeof metaParam === "undefined" ? typeParam : metaParam;

  const { current: key } = React.useRef({});

  const { register, setMeta } = React.useContext(Context);

  const callback = React.useCallback(
    current => {
      register(key, current ? { current, meta, type } : null);
    },
    [register]
  );

  useIsomorphicLayoutEffect(() => {
    setMeta(key, meta);
  }, [meta]);

  return callback;
}

export function ContextRef<T extends ReactContextRefs.RefType = "">(props: {
  children: (
    ref: (current: ReactContextRefs.RefsValuesMap[T]["current"]) => void
  ) => React.ReactNode;
  type?: T;
  meta?: ReactContextRefs.RefsValuesMap[T]["meta"];
}) {
  const setRef = useContextRef(props.type || "", props.meta);
  return props.children(setRef);
}
