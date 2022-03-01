import { mountAttrBindingDirectives } from "./directives/attrs";
import { mountBehaviorDirectives } from "./directives/behaviors";
import { mountEventBindingDirectives } from "./directives/events";
import { getForDirectiveRenderPlan } from "./directives/for";
import { getIfDirectiveRenderPlan } from "./directives/if";

export function render(template: HTMLTemplateElement, container: HTMLElement | DocumentFragment, data?: any) {
  reconcileElementChildren(template.content, container, data);
}

function reconcileElementChildren(src: Node, target: Node, data?: any) {
  const srcNodes = src.childNodes;
  const targetNodes = target.childNodes;
  let targetIndex = 0;

  srcNodes.forEach((srcNode) => {
    let targetNode: undefined | Node = targetNodes[targetIndex];

    switch (srcNode.nodeType) {
      case Node.TEXT_NODE:
      case Node.COMMENT_NODE:
        if (!targetNode) {
          targetNode = srcNode.cloneNode();
          target.appendChild(targetNode);
        }

        reconcileText(srcNode, targetNode);

        targetIndex++;
        break;

      case Node.ELEMENT_NODE:
        // Conditional
        const plan = getConditionalRenderPlan(srcNode as Element, targetNode, data);
        if (plan) {
          if (plan.createReference) {
            const referenceNode = plan.createReference();
            target.insertBefore(referenceNode, targetNode ?? null);
          }

          plan.updateReference?.(targetNodes[targetIndex]);

          const currentNodesSnapshot = [...targetNodes].slice(targetIndex + 1, targetIndex + 1 + plan.oldCount);

          let insertionCount = 0;

          plan.itemUpdates.forEach((operation, newOffset) => {
            if (operation.isCreate) {
              // create
              const newNode = srcNode.cloneNode() as Element;
              reconcileElement(srcNode as Element, newNode, operation.data);
              target.insertBefore(newNode, targetNodes[targetIndex + 1 + newOffset] ?? null);
              insertionCount++;
            } else if (operation.isDelete) {
              // delete
              target.removeChild(currentNodesSnapshot[operation.oldOffset!]);
            } else {
              // update
              const newNode = currentNodesSnapshot[operation.oldOffset!] as Element;
              // Compare the expected node position (sum of insert count and offset in snapshop) with the actual node position (newOffset)
              if (insertionCount + operation.oldOffset! !== newOffset) {
                target.insertBefore(newNode, targetNodes[targetIndex + 1 + newOffset] ?? null);
              }
              reconcileElement(srcNode as Element, newNode, operation.data);
            }
          });

          targetIndex += plan.newCount + 1;

          break;
        }

        // Static
        if (!targetNode) {
          targetNode = srcNode.cloneNode();
          target.appendChild(targetNode);
        }

        reconcileElement(srcNode as Element, targetNode as Element, data);

        targetIndex++;
        break;
    }
  });
}

export interface ConditionalRenderPlan {
  createReference?: () => Node;
  updateReference?: (referenceNode: Node) => void;
  itemUpdates: ItemUpdateOperation[];
  oldCount: number;
  newCount: number;
}

export interface ItemUpdateOperation {
  data?: any;
  isCreate?: boolean;
  isDelete?: boolean;
  oldOffset?: number;
}

function getConditionalRenderPlan(srcNode: Element, targetNode: Node, data?: any): ConditionalRenderPlan {
  if ((srcNode as Element).hasAttribute("$for")) {
    return getForDirectiveRenderPlan(srcNode as Element, targetNode, data);
  } else if ((srcNode as Element).hasAttribute("$if")) {
    return getIfDirectiveRenderPlan(srcNode as Element, targetNode, data);
  } else {
    return null;
  }
}

function reconcileText(src: Node, target: Node) {
  if (target.nodeValue !== src.nodeValue) {
    target.nodeValue = src.nodeValue;
  }
}

function reconcileElement(src: Element, target: Element, data?: any) {
  reconcileElementChildren(src, target, data);
  reconcileElementDirectives(src as HTMLElement, target as HTMLElement, data);
}

function reconcileElementDirectives(src: HTMLElement, target: HTMLElement, data?: any) {
  const { events, behaviors, attrs } = getDirectives(src);

  // ordering matters. Behavior direct may access attr, but not vice versa
  mountAttrBindingDirectives(attrs, target, data);
  mountBehaviorDirectives(behaviors, src, target, data);
  mountEventBindingDirectives(events, target, data);
}

function getDirectives(src: Element) {
  const attrs = [...src.attributes];

  return {
    attrs: attrs
      .filter((attr) => attr.name[0] === ":")
      .map((attr) => ({ name: attr.name.slice(1), value: attr.value })),
    events: attrs
      .filter((attr) => attr.name[0] === "@")
      .map((attr) => ({ name: attr.name.slice(1), value: attr.value })),
    behaviors: Object.fromEntries(
      attrs.filter((attr) => attr.name[0] === "$").map((attr) => [attr.name.slice(1), attr.value])
    ),
  };
}
