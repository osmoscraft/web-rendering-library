import { evaluate } from "../evaluate";

export function mountAttrBindingDirectives(attrs: { name: string; value: string }[], target: Element, data?: any) {
  attrs.forEach((attr) => {
    const attrValue = evaluate(attr.value, data);
    if (attrValue === undefined) {
      target.removeAttribute(attr.name);
      (target as any)[`_:${attr.name}`] = undefined;
    } else {
      if ((target as any)[`_:${attr.name}`] !== attrValue) {
        target.setAttribute(attr.name, attrValue);
        (target as any)[`_:${attr.name}`] = attrValue;
      }
    }
  });
}
