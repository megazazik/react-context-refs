# react-context-refs

[![npm version](https://badge.fury.io/js/react-context-refs.svg)](https://badge.fury.io/js/react-context-refs)

Library to get react refs via context. For example it can be useful when you need to scroll or set focus to some field after form validation and you have a deep nested components hierarchy.

## Fields focus example

First, you should add `RefProvider`.

main.js

```jsx
import * as React from "react";
import { render } from "ract-dom";
import { RefProvider } from "react-context-refs";
import Page from "./form";

// ...

render(
  <RefProvider>
    <Page />
  </RefProvider>,
  element
);
```

Then you need to add each field to context refs storage. You can add some metadata to your refs. In this example we add `hasError` property to refs.

someField.js

```jsx
import * as React from "react";
import { useContextRef } from "react-context-refs";

export default ({ value, onChange, hasError }) => {
  const setRef = useContextRef({ hasError });

  return (
    <input
      style={hasError ? { backgroundColor: "#FFCABF" } : {}}
      ref={setRef}
      value={value}
      onChange={onChange}
    />
  );
};
```

And then in some root component you can get all refs and set focus to any of them.

```jsx
import * as React from "react";
import { useRefs } from "react-context-refs";
import { compareOrder } from "sort-nodes";

// ...

export default props => {
  // ...

  const refs = useRefs();
  const onSubmit = () => {
    if (!isFormValid()) {
      const firstFieldWithError = refs
        // remove fields without errors
        .filter(ref => ref.meta.hasError)
        // get current value of refs
        .map(ref => ref.current)
        // sort by order in dom tree
        .sort(compareOrder)[0];

      firstFieldWithError.focus();
      return;
    }
    // ...
  };

  return <Form {...formProps} onSubmit={onSubmit} />;
};
```

## API

### RefProvider

This provider creates a storage of refs and let you use other methods of `react-context-refs`.

A storage contains an array of refs and two additional fields for each ref: `type` and `meta`.

### useRefs

`useRefs` returns an array of refs from the storage. Each ref has the following fields:

- _current_ - value of ref
- _type_ - string to determine type of ref if there are several types of ref in the storage
- _meta_ - any additional data

You can use `useRefs` without parameters or you can pass a string to `useRefs` and it will return only refs of the corresponding type.

```js
import { useRefs } from "react-context-refs";

// ...
const myInputs = useRefs("my-input");
```

### useContextRef

This hook returns a method to set ref.

You add pass a metadata to ref or a metadata and type.

The first form of `useContextRef` has the only parameter - `meta`.

The second has two parameters:

- `type` _string_
- `meta` _any_

```js
import { useContextRef } from "react-context-refs";

// ...
const setRef = useContextRef("my-ref-type", { additionalValue: true });
```

### Typings (typescript)

If you want to add strong types to your refs you can set type of `current` and `meta` for each `type`.

You can do it with this code:

```ts
declare module ReactContextRefs {
  export interface Refs {
    myInput: { current: HTMLInputElement; meta: { hasError: boolean } };
  }
}
```

Here we has set types of `current` and `meta` for each ref which has type `myInput`.

```ts
import { useRefs } from "react-context-refs";

// now myInputs has type an array of
// {
// 	type: "myInput",
// 	current: HTMLInputElement,
// 	meta: {hasError: boolean},
// }
const myInputs = useRefs("myInput");
```
