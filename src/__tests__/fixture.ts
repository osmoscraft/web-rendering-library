import { render } from "..";

export function setup(templateInnerHtml: string, data?: any) {
  const template = document.createElement("template");
  template.id = "test-fixture-template";
  const container = document.createElement("div");
  container.id = "test-fixture-container";

  document.body.appendChild(template);
  document.body.appendChild(container);

  template.innerHTML = templateInnerHtml;
  render(template, container, data);

  const update = (data?: any) => {
    render(template, container, data);
  };

  return {
    template,
    container,
    update,
  };
}

export function cleanup() {
  document.getElementById("test-fixture-template")?.remove();
  document.getElementById("test-fixture-container")?.remove();
}

export async function flushAsync() {
  await new Promise<any>((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, 0);
  });
}

export interface TestNode01Props {
  onConnected?: () => any;
}

export function defineTestNode(name: string, props: TestNode01Props) {
  class MyTestNode extends HTMLElement {
    connectedCallback() {
      props.onConnected?.();
    }
  }

  if (customElements.get(name)) {
    throw new Error(`${name} is already defined by another test. Please make sure each test node usage is unique`);
  }
  customElements.define(name, MyTestNode);
}
