import type { ChatMessage } from "./types";

export type ParentChatMessage = ChatMessage & {
  children: ParentChatMessage[];
  depth: number;
  siblingIndex: number;
  siblingCount: number;
};

export const ROOT_SIBLING_KEY = "__root__";

/** Sentinel key for messages without parent or root-level siblings */
export function getParentKey(parentMessageId?: string | null): string {
  return parentMessageId && parentMessageId.trim().length > 0 ? parentMessageId : ROOT_SIBLING_KEY;
}

type TreeCacheEntry = {
  bare: ParentChatMessage[];
};
const treeCache = new WeakMap<ChatMessage[], TreeCacheEntry>();

/**
 * Builds an acyclic tree from a flat array of messages.
 * Order-robust: even if streamed messages arrive momentarily out of order,
 * linking occurs after all messages are indexed.
 * Includes depth calculation, sibling indexing, and cycle pruning.
 */
export function buildTree(messages: (ChatMessage | null | undefined)[] | null): ParentChatMessage[] | null {
  if (!messages) {
    return null;
  }

  // Filter out falsy entries
  const validMessages = messages.filter((m): m is ChatMessage => Boolean(m && (m._id || (m as any).id)));
  if (validMessages.length === 0) {
    return [];
  }

  const cached = treeCache.get(validMessages as ChatMessage[]);
  if (cached?.bare) {
    return cached.bare;
  }

  const messageMap = new Map<string, ParentChatMessage>();
  const orderedMessages: ParentChatMessage[] = [];
  const rootMessages: ParentChatMessage[] = [];
  const childrenCount = new Map<string, number>();

  for (const msg of validMessages) {
    const id = msg._id || (msg as any).id;
    const parentId = msg.parentMessageId === id ? "" : (msg.parentMessageId ?? "");
    const currentCount = childrenCount.get(parentId) || 0;
    childrenCount.set(parentId, currentCount + 1);

    const extended: ParentChatMessage = {
      ...msg,
      _id: id,
      children: [],
      depth: 0,
      siblingIndex: currentCount,
      siblingCount: 1,
    };

    messageMap.set(id, extended);
    orderedMessages.push(extended);
  }

  // Link children to parents
  for (const extended of orderedMessages) {
    const parentId = extended.parentMessageId ?? "";
    const parent = parentId ? messageMap.get(parentId) : undefined;
    if (parent && parent !== extended) {
      parent.children.push(extended);
    } else {
      rootMessages.push(extended);
    }
  }

  // Update siblingCount for all nodes
  for (const root of rootMessages) {
    root.siblingCount = rootMessages.length;
  }
  for (const extended of orderedMessages) {
    if (extended.children.length > 0) {
      for (const child of extended.children) {
        child.siblingCount = extended.children.length;
      }
    }
  }

  // Assign depth and break any corrupt cyclic back-edges
  const visited = new Set<ParentChatMessage>();
  const assignDepths = (root: ParentChatMessage) => {
    visited.add(root);
    const stack: ParentChatMessage[] = [root];
    while (stack.length > 0) {
      const node = stack.pop()!;
      // Sever any cycle back-edges
      if (node.children.some((c) => visited.has(c))) {
        node.children = node.children.filter((c) => !visited.has(c));
      }
      for (const child of node.children) {
        child.depth = node.depth + 1;
        visited.add(child);
        stack.push(child);
      }
    }
  };

  for (const root of rootMessages) {
    assignDepths(root);
  }

  // Resurface any unvisited nodes on severed/orphaned cycles as root nodes
  for (const extended of orderedMessages) {
    if (!visited.has(extended)) {
      rootMessages.push(extended);
      assignDepths(extended);
    }
  }

  const result = rootMessages;
  treeCache.set(validMessages as ChatMessage[], { bare: result });
  return result;
}

/**
 * Traverses from roots down through children according to the provided siblingMap.
 * Returns the active linear branch of messages and the sanitized siblingMap.
 */
export function getActiveBranch({
  messages,
  siblingMap = {},
}: {
  messages: ChatMessage[];
  siblingMap?: Record<string, number>;
}): {
  activeBranch: ParentChatMessage[];
  siblingMap: Record<string, number>;
} {
  if (!messages || messages.length === 0) {
    return { activeBranch: [], siblingMap: { ...siblingMap } };
  }

  // If no messages contain tree metadata (parentMessageId), treat as a standard linear sequence
  const hasTreeMetadata = messages.some((m) => Boolean(m && m.parentMessageId && m.parentMessageId.trim().length > 0));
  if (!hasTreeMetadata) {
    const linearBranch: ParentChatMessage[] = messages.map((m) => ({
      ...m,
      _id: m._id || (m as any).id,
      children: [],
      depth: 0,
      siblingIndex: 0,
      siblingCount: 1,
    }));
    return { activeBranch: linearBranch, siblingMap: { ...siblingMap } };
  }

  const tree = buildTree(messages);
  if (!tree || tree.length === 0) {
    return { activeBranch: [], siblingMap: { ...siblingMap } };
  }

  const normalizedSiblingMap = { ...siblingMap };
  const activeBranch: ParentChatMessage[] = [];

  // Pick root sibling
  const rootKey = ROOT_SIBLING_KEY;
  let rootIdx = normalizedSiblingMap[rootKey];
  if (rootIdx === undefined || rootIdx < 0 || rootIdx >= tree.length) {
    // Default to the newest sibling
    rootIdx = tree.length - 1;
    normalizedSiblingMap[rootKey] = rootIdx;
  }

  let currentNode: ParentChatMessage | undefined = tree[rootIdx];

  while (currentNode) {
    activeBranch.push(currentNode);

    if (currentNode.children && currentNode.children.length > 0) {
      const parentKey = currentNode._id;
      let childIdx = normalizedSiblingMap[parentKey];
      if (childIdx === undefined || childIdx < 0 || childIdx >= currentNode.children.length) {
        // Default to newest sibling
        childIdx = currentNode.children.length - 1;
        normalizedSiblingMap[parentKey] = childIdx;
      }
      currentNode = currentNode.children[childIdx];
    } else {
      currentNode = undefined;
    }
  }

  return {
    activeBranch,
    siblingMap: normalizedSiblingMap,
  };
}

/**
 * Calculates the exact sibling indices required so that `targetId` is part of the active branch.
 */
export function getBranchSiblingIndexesForTarget(
  messages: ChatMessage[],
  targetId: string,
): Record<string, number> {
  const tree = buildTree(messages);
  if (!tree || tree.length === 0 || !targetId) {
    return {};
  }

  const siblingMap: Record<string, number> = {};
  type StackFrame = {
    parentKey: string;
    siblings: ParentChatMessage[];
    index: number;
  };

  const stack: StackFrame[] = [
    { parentKey: ROOT_SIBLING_KEY, siblings: tree, index: 0 },
  ];

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    if (frame.index >= frame.siblings.length) {
      stack.pop();
      delete siblingMap[frame.parentKey];
      continue;
    }

    const currentIdx = frame.index++;
    const node = frame.siblings[currentIdx];
    siblingMap[frame.parentKey] = currentIdx;

    if (node._id === targetId) {
      return siblingMap;
    }

    if (node.children && node.children.length > 0) {
      stack.push({
        parentKey: node._id,
        siblings: node.children,
        index: 0,
      });
    }
  }

  return {};
}
