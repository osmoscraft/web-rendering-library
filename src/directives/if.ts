import { ConditionalRenderPlan } from "..";
import { evaluate } from "../evaluate";

export function getIfDirectiveRenderPlan(
  srcNode: Element,
  targetNode: Node | undefined,
  data?: any
): ConditionalRenderPlan {
  const plan: ConditionalRenderPlan = {
    itemUpdates: [],
    oldCount: 0,
    newCount: 0,
  };

  const expression = (srcNode as Element).getAttribute("$if")!;
  const isReferenceCreated = targetNode?.nodeType === Node.COMMENT_NODE;
  const isNewOn = !!evaluate(expression, data);
  const isOldOn = isReferenceCreated ? !!(targetNode as any)._$if : false;

  if (!isReferenceCreated) {
    plan.createReference = () => {
      const refNode = document.createComment(`$if="${expression}"`);
      (refNode as any)._$if = isNewOn;

      return refNode;
    };
  }

  plan.updateReference = (referenceNode: Node) => ((referenceNode as any)._$if = isNewOn);

  if (isNewOn || isOldOn) {
    plan.itemUpdates.push({
      isCreate: !isOldOn,
      isDelete: !isNewOn,
      data,
      oldOffset: isOldOn ? 0 : undefined,
    });
  }

  plan.oldCount = isOldOn ? 1 : 0;
  plan.newCount = isNewOn ? 1 : 0;

  return plan;
}
