import { evaluate } from "../evaluate";

/**
 * process any $<directive> other than $if, $for
 */
export function mountBehaviorDirectives(
  behaviors: Record<string, string>,
  src: HTMLElement,
  target: HTMLElement,
  data?: any
) {
  // $text
  if (behaviors["text"]) {
    const textValue = evaluate(behaviors["text"], data);
    if ((target as any)._$text !== textValue) {
      target.innerText = textValue ?? "";
      // save directive data
      (target as any)._$text = textValue ?? "";
    }
  }

  // $model
  if (behaviors["model"]) {
    const modelValue = evaluate(behaviors["model"], data);
    switch (src.tagName) {
      case "INPUT":
        const inputType = src.getAttribute("type");
        if (inputType === "checkbox") {
          memoizedMount(modelValue, target as HTMLElement, () => ((target as any).checked = modelValue));
          break;
        }
        if (inputType === "radio") {
          memoizedMount(
            modelValue,
            target as HTMLElement,
            () => ((target as any).checked = (target as HTMLInputElement).value === modelValue)
          );
          break;
        }
      case "TEXTAREA":
      case "SELECT":
        memoizedMount(modelValue, target as HTMLElement, () => ((target as any).value = modelValue));
        break;
      default:
        throw new Error(
          `${src.tagName} does not have a $model directive. Use one of these instead: input, select, textarea`
        );
    }
  }
}

function memoizedMount(modelValue: any, target: HTMLElement, onChange: () => void) {
  if ((target as any)[`_$model`] !== modelValue) {
    onChange();
    (target as any)[`_$model`] = modelValue;
  }
}
