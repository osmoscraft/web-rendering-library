import { render } from "..";

export function setupTemplate(templateInnerHtml: string, data?: any) {
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

export function setupHtml(html: string) {
  const container = document.createElement("div");
  container.id = "test-fixture-container";

  container.innerHTML = html;

  document.body.appendChild(container);

  return {
    container,
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

export function defineTestElement(name: string, klass: CustomElementConstructor) {
  if (customElements.get(name)) {
    throw new Error(`${name} is already defined by another test. Please make sure each test node usage is unique`);
  }

  return customElements.define(name, klass);
}
