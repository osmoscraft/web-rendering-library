# Web Rendering Library

Minimalist rendering library, optimized for web components.

- Server side rendering with `<template>` elements
- Client side hydration with javascript
- Efficiently update DOM between multiple renderings

Note: This library only exports TypeScript. So you will need a modern compiler to use it. Currently only supporting [vite](https://vitejs.dev/) and [esbuild](https://esbuild.github.io/).

## Get started

```sh
npm i @osmoscraft/web-rendering-library
```

Declare template

```html
<template id="my-template">
  <div $text="count"></div>
  <button @click="handleClick">+1</button>
</template>

<div id="my-container"></div>
```

Render into container

```TypeScript
import {render} from "@osmoscraft/web-rendering-library";

const template = document.getElementById("my-template");
const container = document.getElementById("my-container");

let count = 0;

function myRender() {
  render(template, container, { count, handleClick: () => { count++; myRender(); });
}

myRender();

```
## API

```TypeScript
render(templateElement, containerElement, dataObject);
```

### Pure rendering

To achieve high performance, this library treats all components as pure. If a components input doesn't change, re-render will have no effect on it.

For each binding, change is determined via strict equal (`===`).

### Use in web components

To build reactive web component with this library, you need to re-render whenever an update should affect the UI. For example:

- Initially in `connectedCallback()`
- Everytime when some user input updates the data model that is used by the `render()`.
  - e.g. `@click` handler function should usually call `render()` in the end.
- In `attributeChangedCallback()`

It's recommended each web component manages its own lifecycle by calling `render()` at the right time in their own lifecycle hooks. Use the platform. Don't re-invent it.

## Expression

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

## Template syntax

### Logic-based rendering

```html
<!-- if -->
<div $if="myBooleanVar"></div>

<!-- for -->
<ul $for="myItem in myArrayVar">
  <li $text="myItem.id"></li>
</ul>

<!-- for with key-->
<ul $for="myItem:id in myArrayVar">
  <li $text="myItem.id"></li>
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
