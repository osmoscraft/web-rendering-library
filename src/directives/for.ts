import { evaluate } from "../evaluate";

export interface ForDirectiveOperations {
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

export function getForDirectiveOperations(
  srcNode: Element,
  targetNode: Node | undefined,
  data?: any
): ForDirectiveOperations {
  const operations: ForDirectiveOperations = {
    itemUpdates: [],
    oldCount: 0,
    newCount: 0,
  };

  const { itemExp, keyExp, arrayExp } = parseExpression((srcNode as Element).getAttribute("$for") ?? "");
  const srcArray: any[] = evaluate(arrayExp, data) ?? [];
  const isReferenceCreated = targetNode?.nodeType === Node.COMMENT_NODE;
  const targetArray: any[] = isReferenceCreated ? (targetNode as any)._$for : [];

  if (!isReferenceCreated) {
    operations.createReference = () => {
      const refNode = document.createComment(`$for="${itemExp}${keyExp ? `:${keyExp}` : ""} in ${arrayExp}"`);
      (refNode as any)._$for = srcArray;

      return refNode;
    };
  }

  operations.updateReference = (referenceNode: Node) => ((referenceNode as any)._$for = srcArray);

  const oldKeyToOffsetMap = new Map<number, number>(
    targetArray.map((oldData, oldIndex) => [getKeyValue(keyExp, oldData, oldIndex), oldIndex])
  );

  const newKeySet = new Set();

  srcArray.forEach((newData, newIndex) => {
    const newKeyValue = getKeyValue(keyExp, newData, newIndex);
    if (newKeySet.has(newKeyValue)) {
      throw new Error(`Duplicated key value "${newKeyValue}" found in $for="${itemExp}:${keyExp} in ${arrayExp}"`);
    }
    newKeySet.add(newKeyValue);

    const oldOffset = oldKeyToOffsetMap.get(newKeyValue);
    oldKeyToOffsetMap.delete(newKeyValue);
    const isCreate = oldOffset === undefined;
    operations.itemUpdates.push({
      isCreate,
      data: {
        [itemExp]: newData,
        ...data,
      },
      oldOffset,
    });
  });

  operations.itemUpdates.push(
    ...[...oldKeyToOffsetMap.values()].map((deleteIndex) => ({
      isDelete: true,
      oldOffset: deleteIndex,
    }))
  );

  operations.oldCount = targetArray.length;
  operations.newCount = srcArray.length;

  return operations;
}

function getKeyValue<T, K>(keyExp: string, data: T, fallback: K) {
  if (keyExp === "$self") return data;
  if (keyExp) return evaluate(keyExp, data);
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
