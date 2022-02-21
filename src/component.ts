import { render } from "./render";

export interface ComponentConfig {
  /**
   * When set to `open` or `closed`, component is attached to Shadow DOM according [ShadowRootMode](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode).
   * When set to `none`, component is directly rendered, without using Shadow DOM.
   * Default value is `open`.
   * */
  mode?: ShadowRootMode | "none";
}

export interface Component<T> {
  render: (dataOrUpdate?: Partial<T> | ((data: T) => Partial<T>)) => void;
  getData: () => T;
  patchData: (dataOrUpdate?: Partial<T> | ((data: T) => Partial<T>)) => T;
}

export function useComponent<T extends {} = any>(
  template: HTMLTemplateElement,
  host: HTMLElement,
  config?: ComponentConfig
): Component<T> {
  const effectiveConfig: ComponentConfig = { ...{ mode: "open" }, ...config };
  const renderTarget = effectiveConfig.mode === "none" ? host : host.attachShadow({ mode: "open" });
  const currentData: T = {} as T;

  return createRenderer<T>(renderTarget, template, currentData);
}

function createRenderer<T>(host: HTMLElement | DocumentFragment, template: HTMLTemplateElement, data: T) {
  function patchData(dataOrUpdate?: Partial<T> | ((data: T) => Partial<T>)) {
    const isUpdate = typeof dataOrUpdate === "function";

    const patch = isUpdate ? dataOrUpdate(data as T) : dataOrUpdate;
    Object.assign(data, patch);

    return data;
  }

  function getData() {
    return data;
  }

  function renderWrapper(dataOrUpdate?: Partial<T> | ((data: T) => Partial<T>)) {
    patchData(dataOrUpdate);
    render(template, host, data);
  }

  return {
    render: renderWrapper,
    getData,
    patchData,
  };
}
