import * as React from "react";
import { sortNodes } from "sort-nodes";

const Context = React.createContext<RefsContext>({
  nodes: [],
  register: () => {}
});

interface RefsContext {
  nodes: RefData[];
  register: (key: any, ref?: RefData) => void;
}

export interface RefData {
  value: any;
  tag?: string;
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
          oldRefData.tag !== refData.tag
        ) {
          refs.set(key, refData);
          setNodes(Array.from(refs.values()));
        }
      }
    },
    [setNodes]
  );

  const context = React.useMemo(
    () => ({
      nodes,
      register
    }),
    [nodes, register]
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
};

// // returns function to get nodes in DOM order
// export function useGetOrderedNodes(sorter = sortNodes) {
//   const { nodes } = React.useContext(Context);

//   // const refs = React.useMemo(() => )

//   return () => sorter(Object.keys(nodes).map(k => nodes[k]));
// }

export function useRefs(tag?: string) {
  const { nodes } = React.useContext(Context);

  return React.useMemo(
    () =>
      tag
        ? nodes.filter(node => node.tag === tag).map(node => node.value)
        : nodes.map(node => node.value),
    [nodes, tag]
  );
}

export interface RegisterRefParams {
  tag?: string;
  add?: boolean;
}

export function useSetRef({ add = true, tag }: RegisterRefParams = {}) {
  const { current: key } = React.useRef({});

  const { register } = React.useContext(Context);

  const callback = React.useCallback(
    node => {
      register(key, node && add ? { value: node, tag: tag } : null);
    },
    [add, tag, register]
  );

  return callback;
}

export function ContextRef(
  props: RegisterRefParams & {
    children: (ref: (value: any) => void) => React.ReactNode;
  }
) {
  const setRef = useSetRef({ add: props.add, tag: props.tag });
  return props.children(setRef);
}
