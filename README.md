# Web Rendering Library

Minimalist rendering library, optimized for web components.

- Server side rendering with `<template>` elements
- Client side hydration with javascript
- Efficiently update DOM between multiple renderings
- Composes with browser APIs, instead of wrapping them

Note: This library only exports TypeScript. So you will need a modern compiler to use it. Currently only supporting [vite](https://vitejs.dev/) and [esbuild](https://esbuild.github.io/).

## Get started

```sh
npm i @osmoscraft/web-rendering-library
```

Define component in TypeScript

```TypeScript
import { html, useComponent } from "@osmoscraft/web-rendering-library";

// This creates a real HTMLTemplateElement
const template = html`
<template id="my-template">
  <div $text="count"></div>
  <button @click="handleClick">+1</button>
</template>
`

class MyCounter extends HTMLElement {
  private component = useComponent(template, this);

  connectedCallback() {
    this.component.render({
      count: 0,
      handleClick: () => {
        this.component.render(data => ({
          count: data.count + 1,
        })),
      }
    });
  }
}

customElements.define("my-counter", MyCounter);

```

Use component in HTML

```html
<my-counter></my-counter>
```

## API reference

```TypeScript
// Shadow DOM
useComponent(host, template);
useComponent(host, template, { mode: "open" }); // equivalent to above

// Light DOM
useComponent(host, template, { mode: "none" });

// Update by data patching
component = useComponent(...args);
component.render({ ...newPartialDataObject });

// Update by function
component = useComponent(...args);
component.render((oldData) => ({ ...newPartialDataObject }));

// Typed data
interface Model {
  myVar: string;
}

component = useComponent<Model>(host, template);
component.render({ myVar: "helloworld" }); // OK
component.render({ myVar: 123 }); // Type error


// Manual render
render(template, host, fullDataObject);
```

## Usage notes

### Pure rendering

To achieve high performance, this library treats all components as pure. If a components input doesn't change, re-render will have no effect on it.

For each binding, change is determined via strict equal (`===`).

### Use in web components

To build reactive web component with this library, you need to re-render whenever an update should affect the UI. For example:

- Initially in `connectedCallback()`, call `component.render()`;
- On user input
  - e.g. `@click` handler function should usually call `component.render()` in the end.
- In `attributeChangedCallback()`, call `component.render()`;

## Templating syntax

### Expression

Simple variable

```html
<div $text="myVar"></div>
```

```TypeScript
render(template, container, { myVar: "hello" });
```

Chained path

```html
<div $text="myVar.mySubVar"></div>
```

```TypeScript
render(template, container, { myVar: { mySubVar: "hello" } });
```

Negation

```html
<div $text="!myBooleanVar"></div>
```

```TypeScript
render(template, container, { myBooleanVar: true });
```

### Logic-based rendering

```html
<!-- if -->
<div $if="myBooleanVar"></div>
<div $if="fooType !== 'sandwich'"></div>
<div $if="position > 32"></div>

<!-- for -->
<ul>
  <li $for="myItem in myArrayVar" $text="myItem.id"></li>
</ul>

<!-- for, using each item as a unique key -->
<ul>
  <li $for="myItem in myArrayVar" $key="myItem" $text="myItem"></li>
</ul>

<!-- for, using each item's child field as unique key -->
<ul>
  <li $for="myItem in myArrayVar" $key="myItem.id" $text="myItem.id"></li>
</ul>
```

Note: providing a key can help the diffing algorithm re-use elements when there is no change.

### Text binding

```html
<div $text="myVar"></div>
```

### Attribute binding

```html
<div :id="myVar"></div>
```

Note: Setting `myVar` to `undefined` removes the attribute.

### Value binding

```html
<!-- Text input value -->
<input $model="myVar" />
<textarea $model="myVar"></textarea>

<!-- Select -->
<select $model="myVar">
  <option value="1">A</option>
</select>

<!-- Select with variable options -->
<select $model="myVar">
  <option :value="myValue" $text="myText"></option>
  <option :value="myValue2" $text="myText2"></option>
</select>

<!-- Checkbox -->
<input type="checkbox" $model="myBooleanVar" />

<!-- Radio -->
<input type="radio" name="radio-demo" value="option1" $model="mySelectedValue" />
<input type="radio" name="radio-demo" value="option2" $model="mySelectedValue" />

<!-- Radio with variable options -->
<input type="radio" name="radio-demo" :value="myValue1" $model="mySelectedValue" />
<input type="radio" name="radio-demo" :value="myValue2" $model="mySelectedValue" />
```

### Event binding

```html
<button @click="myClickHandler"></button>
```

### Suppported expressions

- Unary operators
  - `!`
  - `!!`
- Binary operators
  - `==`
  - `!==`
  - `!=`
  - `&&`
  - `||`
  - `>=`
  - `>`
  - `<=`
  - `<`
- Primitives
  - String, e.g. `"hello"`, or `'hello'`
  - Number (only integers), e.g. `123`, `-52`, or `+999`.
  - `null`
  - `undefined`
