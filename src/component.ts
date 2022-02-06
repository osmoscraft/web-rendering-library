import { render } from "./render";

export interface ComponentConfig {
  /**
   * When set to `open` or `closed`, component is attached to Shadow DOM according [ShadowRootMode](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode).
   * When set to `none`, component is directly rendered, without using Shadow DOM.
   * Default value is `open`.
   * */
  mode?: ShadowRootMode | "none";
}

export function useComponent<T extends {} = any>(
  template: HTMLTemplateElement,
  host: HTMLElement,
  config?: ComponentConfig
) {
  const effectiveConfig: ComponentConfig = { ...{ mode: "open" }, ...config };
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
    Object.assign(currentData, patch);

    render(template, host, currentData);
  };
}
