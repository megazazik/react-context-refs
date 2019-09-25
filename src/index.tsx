import * as React from "react";

const Context = React.createContext<RefsContext>({
  nodes: [],
  register: () => {},
  setMeta: () => {}
});

interface RefsContext {
  nodes: RefData[];
  register: (key: any, ref?: RefData) => void;
  setMeta: (key: any, meta: any) => void;
}

export interface RefData {
  value: any;
  meta: any;
}

export const RefProvider: React.FC = ({ children }) => {
  const { current: refs } = React.useRef<Map<any, RefData>>(new Map());

  const [nodes, setNodes] = React.useState<RefData[]>([]);

  const register = React.useCallback<RefsContext["register"]>(
    (key, refData) => {
      if (refData == null) {
        if (refs.has(key)) {
          refs.delete(key);
          setNodes(Array.from(refs.values()));
        }
      } else {
        const oldRefData = refs.get(key) || ({} as RefData);
        if (
          oldRefData.value !== refData.value ||
          oldRefData.meta !== refData.meta
        ) {
          refs.set(key, refData);
          setNodes(Array.from(refs.values()));
        }
      }
    },
    [setNodes]
  );

  const setMeta = React.useCallback<RefsContext["setMeta"]>(
    (key, meta) => {
      if (!refs.has(key)) {
        return;
      }
      const refData = refs.get(key);
      if (!refData) {
        return;
      }
      refData.meta = meta;
    },
    [setNodes]
  );

  const context = React.useMemo(
    () => ({
      nodes,
      register,
      setMeta
    }),
    [nodes, register]
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
};

export function useNodes() {
  return React.useContext(Context).nodes;
}

/** @todo переделать на getNodesByType ? */
// export function useRefs(tag?: string) {
//   const { nodes } = React.useContext(Context);

//   return React.useMemo(
//     () =>
//       tag
//         ? nodes.filter(node => node.tag === tag).map(node => node.value)
//         : nodes.map(node => node.value),
//     [nodes, tag]
//   );
// }

export function useSetRef(meta?: any) {
  const { current: key } = React.useRef({});

  const { register, setMeta } = React.useContext(Context);

  const callback = React.useCallback(
    node => {
      register(key, node ? { value: node, meta } : null);
    },
    [register]
  );

  React.useEffect(() => {
    setMeta(key, meta);
  }, [meta]);

  return callback;
}

export function ContextRef(props: {
  children: (ref: (value: any) => void) => React.ReactNode;
  meta?: any;
}) {
  const setRef = useSetRef(props.meta);
  return props.children(setRef);
}
