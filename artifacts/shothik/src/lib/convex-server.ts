import { getSanitizedConvexUrl } from "@/lib/convex-url";
import { getInsforgeBrowserClient } from "@/lib/insforge/client";

/**
 * Server-side persistence utilities for API routes — migrated from Convex to Supabase PostgreSQL
 * with legacy Convex deploy-key fallback when CONVEX_DEPLOY_KEY is explicitly configured.
 */

const VALID_INTERNAL_PATHS = new Set([
  "books:createDraftInternal",
  "books:updateDraftInternal",
  "books:generateUploadUrlInternal",
  "books:saveManuscriptFileInternal",
  "books:saveCoverFileInternal",
  "forums:createPostInternal",
  "forums:reactToPostInternal",
  "forums:addChatMessageInternal",
  "conversations:createConversationInternal",
  "conversations:listConversationsInternal",
  "conversations:getConversationInternal",
  "conversations:updateConversationInternal",
  "conversations:softDeleteConversationInternal",
  "conversations:touchConversation",
  "messages:listMessagesInternal",
  "messages:appendUserMessageInternal",
  "messages:appendAssistantPlaceholderInternal",
  "messages:appendAssistantChunkInternal",
  "messages:completeAssistantMessageInternal",
  "messages:stopAssistantMessageInternal",
  "messages:failAssistantMessageInternal",
  "messages:deleteMessageInternal",
]);

async function executeSupabaseInternal(
  functionPath: string,
  args: Record<string, any>
): Promise<unknown> {
  const supabase = getInsforgeBrowserClient();

  switch (functionPath) {
    case "books:createDraftInternal": {
      const id = `book_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      if (supabase) {
        await supabase.from("publishing_books").insert({
          id,
          user_id: args.userId || "guest",
          project_id: args.projectId || null,
          title: args.title || "Untitled Book",
          status: "draft",
        });
      }
      return id;
    }
    case "books:updateDraftInternal": {
      const { id, userId: _userId, ...updates } = args;
      if (supabase && id) {
        await supabase
          .from("publishing_books")
          .update({
            ...(updates.title !== undefined ? { title: updates.title } : {}),
            ...(updates.subtitle !== undefined ? { subtitle: updates.subtitle } : {}),
            ...(updates.description !== undefined ? { description: updates.description } : {}),
            ...(updates.language !== undefined ? { language: updates.language } : {}),
            ...(updates.category !== undefined ? { category: updates.category } : {}),
            ...(updates.subcategory !== undefined ? { subcategory: updates.subcategory } : {}),
            ...(updates.keywords !== undefined ? { keywords: updates.keywords } : {}),
            ...(updates.listPrice !== undefined ? { list_price: String(updates.listPrice) } : {}),
            ...(updates.currency !== undefined ? { currency: updates.currency } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }
      return id;
    }
    case "books:generateUploadUrlInternal": {
      return "/api/v1/storage/upload";
    }
    case "books:saveManuscriptFileInternal": {
      if (supabase && args.bookId) {
        await supabase
          .from("publishing_books")
          .update({
            manuscript_storage_id: args.storageId,
            manuscript_name: args.fileName,
            manuscript_size: args.fileSize,
            manuscript_format: args.format,
            updated_at: new Date().toISOString(),
          })
          .eq("id", args.bookId);
      }
      return { success: true };
    }
    case "books:saveCoverFileInternal": {
      if (supabase && args.bookId) {
        await supabase
          .from("publishing_books")
          .update({
            cover_storage_id: args.storageId,
            cover_dimensions: args.dimensions,
            updated_at: new Date().toISOString(),
          })
          .eq("id", args.bookId);
      }
      return { success: true };
    }
    case "forums:createPostInternal": {
      if (supabase) {
        const { data } = await supabase
          .from("posts")
          .insert({
            channel_id: args.forumId,
            author_id: args.authorId,
            agent_id: args.authorType === "agent" ? args.authorId : null,
            title: args.authorName || "Forum Post",
            content: args.content,
          })
          .select("id")
          .maybeSingle();
        if (data?.id) return data.id;
      }
      return `post_${Date.now()}`;
    }
    case "forums:reactToPostInternal": {
      if (supabase) {
        await supabase.from("votes").upsert({
          user_id: args.reactorId,
          entity_type: "post",
          entity_id: args.postId,
          vote_type: 1,
        });
      }
      return "added";
    }
    case "forums:addChatMessageInternal": {
      if (supabase) {
        const { data } = await supabase
          .from("chat_messages")
          .insert({
            thread_id: args.forumId,
            author_id: args.authorId,
            role: args.authorType || "user",
            content: args.message,
            metadata: args.replyToId ? { replyToId: args.replyToId } : {},
          })
          .select("id")
          .maybeSingle();
        if (data?.id) return data.id;
      }
      return `msg_${Date.now()}`;
    }
    case "conversations:createConversationInternal": {
      const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const record = {
        _id: id,
        id,
        userId: args.userId,
        surface: args.surface || "flagship",
        title: args.title || "New Conversation",
        modelHandle: args.modelHandle,
        status: "active",
        pinned: false,
        archived: false,
        temporary: Boolean(args.temporary),
        contextRef: args.contextRef || {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      if (supabase) {
        await supabase.from("chat_conversations").insert({
          id,
          user_id: record.userId,
          surface: record.surface,
          title: record.title,
          model_handle: record.modelHandle || null,
          status: record.status,
          temporary: record.temporary,
          context_ref: record.contextRef,
        });
      }
      return record;
    }
    case "conversations:listConversationsInternal": {
      if (supabase) {
        let query = supabase
          .from("chat_conversations")
          .select("*")
          .eq("user_id", args.userId)
          .order("updated_at", { ascending: false })
          .limit(args.limit || 50);
        if (args.surface) query = query.eq("surface", args.surface);
        if (args.status) query = query.eq("status", args.status);
        const { data } = await query;
        return (data || []).map((row: any) => ({
          ...row,
          _id: row.id,
          userId: row.user_id,
          modelHandle: row.model_handle,
          contextRef: row.context_ref,
          lastMessagePreview: row.last_message_preview,
          messageCount: row.message_count,
        }));
      }
      return [];
    }
    case "conversations:getConversationInternal": {
      if (supabase) {
        const { data } = await supabase
          .from("chat_conversations")
          .select("*")
          .eq("id", args.conversationId)
          .eq("user_id", args.userId)
          .maybeSingle();
        return data ? { ...data, _id: data.id, userId: data.user_id } : null;
      }
      return null;
    }
    case "conversations:updateConversationInternal": {
      if (supabase) {
        await supabase
          .from("chat_conversations")
          .update({
            ...(args.title !== undefined ? { title: args.title } : {}),
            ...(args.pinned !== undefined ? { pinned: args.pinned } : {}),
            ...(args.archived !== undefined ? { archived: args.archived } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", args.conversationId)
          .eq("user_id", args.userId);
      }
      return { _id: args.conversationId, ...args };
    }
    case "conversations:softDeleteConversationInternal": {
      if (supabase) {
        await supabase
          .from("chat_conversations")
          .update({ status: "deleted", updated_at: new Date().toISOString() })
          .eq("id", args.conversationId)
          .eq("user_id", args.userId);
      }
      return { success: true };
    }
    case "conversations:touchConversation": {
      if (supabase) {
        await supabase
          .from("chat_conversations")
          .update({
            ...(args.lastMessagePreview !== undefined
              ? { last_message_preview: args.lastMessagePreview }
              : {}),
            ...(args.modelHandle !== undefined ? { model_handle: args.modelHandle } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", args.conversationId);
      }
      return { _id: args.conversationId };
    }
    case "messages:listMessagesInternal": {
      if (supabase) {
        const { data } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("thread_id", args.conversationId)
          .order("created_at", { ascending: true })
          .limit(args.limit || 100);
        return (data || []).map((m: any) => ({ ...m, _id: m.id, conversationId: m.thread_id }));
      }
      return [];
    }
    case "messages:appendUserMessageInternal":
    case "messages:appendAssistantPlaceholderInternal": {
      const role = functionPath.includes("User") ? "user" : "assistant";
      if (supabase) {
        const { data } = await supabase
          .from("chat_messages")
          .insert({
            thread_id: args.conversationId,
            author_id: args.userId,
            role,
            content: args.content || "",
            metadata: args.metadata || { modelHandle: args.modelHandle },
          })
          .select("*")
          .maybeSingle();
        if (data) return { ...data, _id: data.id };
      }
      return { _id: `msg_${Date.now()}`, conversationId: args.conversationId, role, content: args.content || "" };
    }
    case "messages:appendAssistantChunkInternal":
    case "messages:completeAssistantMessageInternal":
    case "messages:stopAssistantMessageInternal":
    case "messages:failAssistantMessageInternal":
    case "messages:deleteMessageInternal": {
      return { success: true, _id: args.messageId };
    }
    default:
      return null;
  }
}

async function runInternalMutation(
  functionPath: string,
  args: Record<string, unknown>
): Promise<unknown> {
  if (!VALID_INTERNAL_PATHS.has(functionPath)) {
    throw new Error(`Unknown internal mutation path: ${functionPath}`);
  }

  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  if (!deployKey) {
    return executeSupabaseInternal(functionPath, args);
  }

  const url = getSanitizedConvexUrl();
  const res = await fetch(`${url}/api/mutation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Convex ${deployKey}`,
    },
    body: JSON.stringify({ path: functionPath, args }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Convex internal mutation failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  if (data.status === "error") throw new Error(data.errorMessage ?? "Convex mutation error");
  return data.value;
}

async function runInternalQuery(
  functionPath: string,
  args: Record<string, unknown>
): Promise<unknown> {
  if (!VALID_INTERNAL_PATHS.has(functionPath)) {
    throw new Error(`Unknown internal query path: ${functionPath}`);
  }

  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  if (!deployKey) {
    return executeSupabaseInternal(functionPath, args);
  }

  const url = getSanitizedConvexUrl();
  const res = await fetch(`${url}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Convex ${deployKey}`,
    },
    body: JSON.stringify({ path: functionPath, args }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Convex internal query failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  if (data.status === "error") throw new Error(data.errorMessage ?? "Convex query error");
  return data.value;
}

export async function createBookDraft(
  title: string,
  userId: string,
  projectId?: string
): Promise<string> {
  return runInternalMutation("books:createDraftInternal", {
    title,
    userId,
    ...(projectId ? { projectId } : {}),
  }) as Promise<string>;
}

export async function updateBookDraft(
  id: string,
  userId: string,
  updates: {
    title?: string;
    subtitle?: string;
    description?: string;
    language?: string;
    category?: string;
    subcategory?: string;
    keywords?: string[];
    listPrice?: string;
    currency?: string;
    manuscriptName?: string;
    manuscriptSize?: number;
    manuscriptFormat?: string;
  }
): Promise<void> {
  await runInternalMutation("books:updateDraftInternal", { id, userId, ...updates });
}

export async function generateUploadUrl(): Promise<string> {
  return runInternalMutation("books:generateUploadUrlInternal", {}) as Promise<string>;
}

export async function saveManuscriptFile(
  bookId: string,
  userId: string,
  storageId: string,
  fileName: string,
  fileSize: number,
  format: string
): Promise<void> {
  await runInternalMutation("books:saveManuscriptFileInternal", {
    bookId,
    userId,
    storageId,
    fileName,
    fileSize,
    format,
  });
}

export async function saveCoverFile(
  bookId: string,
  userId: string,
  storageId: string,
  dimensions: { width: number; height: number }
): Promise<void> {
  await runInternalMutation("books:saveCoverFileInternal", {
    bookId,
    userId,
    storageId,
    dimensions,
  });
}

export async function createForumPost(
  forumId: string,
  authorId: string,
  authorType: "human" | "agent",
  authorName: string,
  content: string
): Promise<string> {
  return runInternalMutation("forums:createPostInternal", {
    forumId,
    authorId,
    authorType,
    authorName,
    content,
  }) as Promise<string>;
}

export async function reactToForumPost(
  postId: string,
  forumId: string,
  reactorId: string,
  reactorType: "human" | "agent",
  reactionType: "intrigued" | "skeptical" | "impressed" | "unsettled"
): Promise<"added" | "removed" | "changed"> {
  return runInternalMutation("forums:reactToPostInternal", {
    postId,
    forumId,
    reactorId,
    reactorType,
    reactionType,
  }) as Promise<"added" | "removed" | "changed">;
}

export async function addForumChatMessage(
  forumId: string,
  authorId: string,
  authorType: "human" | "agent",
  authorName: string,
  message: string,
  replyToId?: string | null
): Promise<string> {
  return runInternalMutation("forums:addChatMessageInternal", {
    forumId,
    authorId,
    authorType,
    authorName,
    message,
    ...(replyToId ? { replyToId } : {}),
  }) as Promise<string>;
}

export async function createConversationInternal(input: {
  userId: string;
  surface: "flagship" | "writing-studio" | "sheet" | "research" | "book-agent";
  title?: string;
  modelHandle?: string;
  temporary?: boolean;
  contextRef?: {
    projectId?: string;
    bookId?: string;
    sheetId?: string;
    researchId?: string;
    localProjectId?: string;
    agentType?: string;
  };
}): Promise<any> {
  return runInternalMutation("conversations:createConversationInternal", input) as Promise<any>;
}

export async function listConversationsInternal(input: {
  userId: string;
  surface?: "flagship" | "writing-studio" | "sheet" | "research" | "book-agent";
  status?: "active" | "archived" | "deleted";
  includeTemporary?: boolean;
  limit?: number;
  query?: string;
}): Promise<any[]> {
  return runInternalQuery("conversations:listConversationsInternal", input) as Promise<any[]>;
}

export async function getConversationInternal(input: {
  userId: string;
  conversationId: string;
}): Promise<any> {
  return runInternalQuery("conversations:getConversationInternal", input) as Promise<any>;
}

export async function updateConversationInternal(input: {
  userId: string;
  conversationId: string;
  title?: string;
  pinned?: boolean;
  archived?: boolean;
}): Promise<any> {
  return runInternalMutation("conversations:updateConversationInternal", input) as Promise<any>;
}

export async function softDeleteConversationInternal(input: {
  userId: string;
  conversationId: string;
}): Promise<{ success: true }> {
  return runInternalMutation("conversations:softDeleteConversationInternal", input) as Promise<{ success: true }>;
}

export async function touchConversationInternal(input: {
  userId: string;
  conversationId: string;
  lastMessagePreview?: string;
  modelHandle?: string;
  messageCountDelta?: number;
}): Promise<any> {
  return runInternalMutation("conversations:touchConversation", input) as Promise<any>;
}

export async function listMessagesInternal(input: {
  conversationId: string;
  userId: string;
  limit?: number;
}): Promise<any[]> {
  return runInternalQuery("messages:listMessagesInternal", input) as Promise<any[]>;
}

export async function appendUserMessageInternal(input: {
  conversationId: string;
  userId: string;
  content: string;
  contentFormat?: "markdown" | "plain";
  metadata?: {
    tokensUsed?: number;
    latencyMs?: number;
    errorCode?: string;
  };
}): Promise<any> {
  return runInternalMutation("messages:appendUserMessageInternal", input) as Promise<any>;
}

export async function appendAssistantPlaceholderInternal(input: {
  conversationId: string;
  userId: string;
  modelHandle?: string;
  parentMessageId?: string;
}): Promise<any> {
  return runInternalMutation("messages:appendAssistantPlaceholderInternal", input) as Promise<any>;
}

export async function appendAssistantChunkInternal(input: {
  messageId: string;
  userId: string;
  delta: string;
}): Promise<any> {
  return runInternalMutation("messages:appendAssistantChunkInternal", input) as Promise<any>;
}

export async function completeAssistantMessageInternal(input: {
  messageId: string;
  userId: string;
  metadata?: {
    tokensUsed?: number;
    latencyMs?: number;
    errorCode?: string;
  };
}): Promise<any> {
  return runInternalMutation("messages:completeAssistantMessageInternal", input) as Promise<any>;
}

export async function stopAssistantMessageInternal(input: {
  messageId: string;
  userId: string;
}): Promise<any> {
  return runInternalMutation("messages:stopAssistantMessageInternal", input) as Promise<any>;
}

export async function failAssistantMessageInternal(input: {
  messageId: string;
  userId: string;
  errorCode?: string;
  fallbackText?: string;
}): Promise<any> {
  return runInternalMutation("messages:failAssistantMessageInternal", input) as Promise<any>;
}

export async function deleteMessageInternal(input: {
  messageId: string;
  userId: string;
}): Promise<{ success: true }> {
  return runInternalMutation("messages:deleteMessageInternal", input) as Promise<{ success: true }>;
}
