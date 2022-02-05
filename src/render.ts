import { mountAttrBindingDirectives } from "./directives/attrs";
import { mountBehaviorDirectives } from "./directives/behaviors";
import { mountEventBindingDirectives } from "./directives/events";
import { getForDirectiveOperations } from "./directives/for";
import { getIfDirectiveOperations } from "./directives/if";

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
        if (!targetNode) {
          targetNode = srcNode.cloneNode();
          target.appendChild(targetNode);
        }

        reconcileText(srcNode as Text, targetNode as Text);

        targetIndex++;
        break;

      case Node.ELEMENT_NODE:
        // Element: $for
        if ((srcNode as Element).hasAttribute("$for")) {
          const operations = getForDirectiveOperations(srcNode as Element, targetNode, data);
          if (operations.createReference) {
            const referenceNode = operations.createReference();
            target.insertBefore(referenceNode, targetNode ?? null);
          }

          operations.updateReference?.(targetNodes[targetIndex]);

          const currentNodesSnapshot = [...targetNodes].slice(targetIndex + 1, targetIndex + 1 + operations.oldCount);

          let insertionCount = 0;

          operations.itemUpdates.forEach((operation, newOffset) => {
            if (operation.isCreate) {
              // create
              const newNode = srcNode.cloneNode() as Element;
              target.insertBefore(newNode, targetNodes[targetIndex + 1 + newOffset] ?? null);
              reconcileElement(srcNode as Element, newNode, operation.data);
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

          targetIndex += operations.newCount + 1;

          break;
        }

        // Element: $if
        if ((srcNode as Element).hasAttribute("$if")) {
          const operations = getIfDirectiveOperations(srcNode as Element, targetNode, data);
          if (operations.createReference) {
            const referenceNode = operations.createReference();
            target.insertBefore(referenceNode, targetNode ?? null);
          }

          operations.updateReference?.(targetNodes[targetIndex]);

          operations.remove.forEach((node) => target.removeChild(node));
          operations.clone.forEach((node) => target.insertBefore(node, targetNodes[targetIndex + 1] ?? null));
          operations.update.forEach((node) => reconcileElement(srcNode as Element, node, data));

          targetIndex += operations.clone.length + 1;

          break;
        }

        // Element: static
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

function reconcileText(src: Text, target: Text) {
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
