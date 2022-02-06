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
    targetArray.map((oldData, oldIndex) => [keyExp ? evaluate(keyExp, oldData) : oldIndex, oldIndex])
  );

  const newKeySet = new Set();

  srcArray.forEach((newData, newIndex) => {
    const newKey = keyExp ? evaluate(keyExp, newData) : newIndex;
    if (newKeySet.has(newKey)) {
      throw new Error(`Duplicated key value "${newKey}" found in $for="${itemExp}:${keyExp} in ${arrayExp}"`);
    }
    newKeySet.add(newKey);

    const oldOffset = oldKeyToOffsetMap.get(newKey);
    oldKeyToOffsetMap.delete(newKey);
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

function parseExpression(input: string) {
  const [itemExpWithKey, arrayExp] = input.trim().split(" in ");
  const [itemExp, keyExp] = itemExpWithKey.split(":");
  return {
    itemExp,
    keyExp,
    arrayExp,
  };
}
