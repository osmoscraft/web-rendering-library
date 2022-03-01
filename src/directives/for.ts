import { evaluate } from "../evaluate";
import { ConditionalRenderPlan } from "../render";

export function getForDirectiveRenderPlan(
  srcNode: Element,
  targetNode: Node | undefined,
  data?: any
): ConditionalRenderPlan {
  const plan: ConditionalRenderPlan = {
    itemUpdates: [],
    oldCount: 0,
    newCount: 0,
  };

  const { itemExp, arrayExp } = parseExpression((srcNode as Element).getAttribute("$for") ?? "");
  const keyExp = (srcNode as Element).getAttribute("$key") ?? "";
  const isReferenceCreated = targetNode?.nodeType === Node.COMMENT_NODE;
  const srcArray: any[] = evaluate(arrayExp, data) ?? [];
  const targetArray: any[] = isReferenceCreated ? (targetNode as any)._$for : [];

  if (!isReferenceCreated) {
    plan.createReference = () => {
      const refNode = document.createComment(`$for="${itemExp} in ${arrayExp}"${keyExp ? ` $key="${keyExp}"` : ""}`);
      (refNode as any)._$for = srcArray;

      return refNode;
    };
  }

  plan.updateReference = (referenceNode: Node) => ((referenceNode as any)._$for = srcArray);

  const oldKeyToOffsetMap = new Map<number, number>(
    targetArray.map((oldData, oldIndex) => [getKeyValue(itemExp, keyExp, oldData, oldIndex), oldIndex])
  );

  const newKeySet = new Set();

  srcArray.forEach((newData, newIndex) => {
    const newKeyValue = getKeyValue(itemExp, keyExp, newData, newIndex);
    if (newKeySet.has(newKeyValue)) {
      throw new Error(`Duplicated key value "${newKeyValue}" found in $for="${itemExp}:${keyExp} in ${arrayExp}"`);
    }
    newKeySet.add(newKeyValue);

    const oldOffset = oldKeyToOffsetMap.get(newKeyValue);
    oldKeyToOffsetMap.delete(newKeyValue);
    const isCreate = oldOffset === undefined;
    plan.itemUpdates.push({
      isCreate,
      data: {
        [itemExp]: newData,
        ...data,
      },
      oldOffset,
    });
  });

  plan.itemUpdates.push(
    ...[...oldKeyToOffsetMap.values()].map((deleteIndex) => ({
      isDelete: true,
      oldOffset: deleteIndex,
    }))
  );

  plan.oldCount = targetArray.length;
  plan.newCount = srcArray.length;

  return plan;
}

function getKeyValue<T, K>(itemExp: string, keyExp: string, data: T, fallback: K) {
  if (keyExp) return evaluate(keyExp, { [itemExp]: data });
  return fallback;
}

function parseExpression(input: string) {
  const [itemExpWithKey, arrayExp] = input.trim().split(" in ");
  const [itemExp, keyExp] = itemExpWithKey.split(":");
  return {
    itemExp,
    keyExp,
    arrayExp,
  };
}
