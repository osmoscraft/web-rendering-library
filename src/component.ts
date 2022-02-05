import { render } from "./render";

export interface ComponentConfig {
  /**
   * When set to `open` or `closed`, component is attached to Shadow DOM according [ShadowRootMode](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode).
   * When set to `none`, component is directly rendered, without using Shadow DOM.
   * Default value is `open`.
   * */
  mode?: ShadowRootMode | "none";
}

export function useComponent<T extends {} = {}>(
  host: HTMLElement,
  template: HTMLTemplateElement,
  config?: ComponentConfig
) {
  const effectiveConfig: ComponentConfig = { ...config, ...{ mode: "open" } };
  const renderTarget = effectiveConfig.mode === "none" ? host : host.attachShadow({ mode: "open" });

  return {
    render: createRenderer<T>(renderTarget, template),
  };
}

function createRenderer<T>(host: HTMLElement | DocumentFragment, template: HTMLTemplateElement) {
  const currentData: T | {} = {};

  return function (dataOrUpdate?: Partial<T> | ((data: T) => Partial<T>)) {
    const isUpdate = typeof dataOrUpdate === "function";

    const patch = isUpdate ? dataOrUpdate(currentData as T) : dataOrUpdate;
    const newData = Object.assign({ ...currentData }, patch);

    render(template, host, newData);
  };
}

export function html(strings: TemplateStringsArray, ...variables: (string | number)[]): HTMLTemplateElement {
  const templateHtml = strings.flatMap((item, index) => [item, `${variables[index] ?? ""}`]).join("");

  return createTemplate(templateHtml);
}

function createTemplate(html: string): HTMLTemplateElement {
  const template = document.createElement("template");
  template.innerHTML = html;

  return template;
}
