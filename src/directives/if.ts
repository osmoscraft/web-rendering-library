import { evaluate } from "../evaluate";

export interface IfDirectiveOperations {
  createReference?: () => Node;
  updateReference?: (referenceNode: Node) => void;
  create: Element[];
  update: Element[];
  remove: Element[];
}

export function getIfDirectiveOperations(
  srcNode: Element,
  targetNode: Node | undefined,
  data?: any
): IfDirectiveOperations {
  const operations: IfDirectiveOperations = {
    create: [],
    update: [],
    remove: [],
  };

  const expression = (srcNode as Element).getAttribute("$if")!;
  const isSrcOn = !!evaluate(expression, data);
  const isReferenceCreated = targetNode?.nodeType === Node.COMMENT_NODE;
  const isTargetOn = isReferenceCreated ? !!(targetNode as any)._$if : false;

  if (!isReferenceCreated) {
    operations.createReference = () => {
      const refNode = document.createComment(`$if="${expression}"`);
      (refNode as any)._$if = isSrcOn;

      return refNode;
    };
  }

  operations.updateReference = (referenceNode: Node) => ((referenceNode as any)._$if = isSrcOn);

  if (isSrcOn && !isTargetOn) {
    const newNode = srcNode.cloneNode() as Element;
    operations.create.push(newNode);
  } else if (isSrcOn && isTargetOn) {
    operations.update.push(targetNode!.nextSibling as Element);
  } else if (!isSrcOn && isTargetOn) {
    operations.remove.push(targetNode!.nextSibling as Element);
  } else {
    // no-op
  }

  return operations;
}
