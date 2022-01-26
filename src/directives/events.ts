import { evaluate } from "../evaluate";

export function mountEventBindingDirectives(events: { name: string; value: string }[], target: Element, data?: any) {
  events.forEach((event) => {
    const newHandler = evaluate(event.value, data);
    const handlerInUse = (target as any)[`_@${event.name}`];
    if (newHandler === undefined) {
      if (handlerInUse) {
        target.removeEventListener(event.name, handlerInUse);
        (target as any)[`_@${event.name}`] = undefined;
      }
      return;
    }
    if (!(typeof newHandler === "function"))
      throw new Error(`The event handler in @${event.name}="${event.value}" is not a function`);

    if (handlerInUse !== newHandler) {
      if (handlerInUse) {
        target.removeEventListener(event.name, handlerInUse);
      }

      target.addEventListener(event.name, newHandler);
      (target as any)[`_@${event.name}`] = newHandler;
    }

    // if (eventHandler === undefined) {
    //   target.removeAttribute(event.name);
    // } else {
    //   if ((target as any)[`_:${event.name}`] !== eventHandler) {
    //     target.setAttribute(event.name, eventHandler);
    //     (target as any)[`_:${event.name}`] = eventHandler;
    //   }
    // }
  });
}
