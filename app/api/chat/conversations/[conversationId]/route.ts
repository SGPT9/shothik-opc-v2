import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import {
  getConversationForUser,
  softDeleteConversationForUser,
  updateConversationForUser,
} from "@/lib/chat/server";

function unauthorized() {
  return Response.json(
    {
      error: "Authentication required",
      code: "INSFORGE_SESSION_REQUIRED",
      message: "Please sign in again to continue using chat.",
    },
    { status: 401 },
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const user = await getChatAuthenticatedUser();
  const deviceId = request.headers.get("x-chat-device-id");
  const effectiveUserId = user?._id ? String(user._id) : deviceId ? `guest-${deviceId}` : "guest-user";

  const { conversationId } = await params;
  try {
    const conversation = await getConversationForUser(conversationId, effectiveUserId);
    return Response.json({ data: conversation });
  } catch {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const user = await getChatAuthenticatedUser();
  const deviceId = request.headers.get("x-chat-device-id");
  const effectiveUserId = user?._id ? String(user._id) : deviceId ? `guest-${deviceId}` : "guest-user";

  const { conversationId } = await params;
  const body = await request.json();

  try {
    const conversation = await updateConversationForUser({
      conversationId,
      userId: effectiveUserId,
      title: body.title,
      pinned: body.pinned,
      archived: body.archived,
    });
    return Response.json({ data: conversation });
  } catch {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const user = await getChatAuthenticatedUser();
  const deviceId = request.headers.get("x-chat-device-id");
  const effectiveUserId = user?._id ? String(user._id) : deviceId ? `guest-${deviceId}` : "guest-user";

  const { conversationId } = await params;
  try {
    const result = await softDeleteConversationForUser(conversationId, effectiveUserId);
    return Response.json({ data: result });
  } catch {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }
}
