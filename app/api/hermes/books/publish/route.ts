import { NextRequest } from "next/server";
import { getChatAuthenticatedUser } from "@/lib/server-auth";
import { PublishDrivePublisherService } from "@/lib/infrastructure/publishdrive-publisher";
import logger from "@/lib/logger";

/**
 * POST /api/hermes/books/publish - Publish written manuscript to PublishDrive & Shothik Store
 */
export async function POST(request: NextRequest) {
  const user = await getChatAuthenticatedUser();
  if (!user?._id) {
    return Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    const result = await PublishDrivePublisherService.publishBook({
      workspaceId: body.workspaceId || "ws_book_default",
      bookTitle: body.bookTitle || "Autonomous AI Growth Masterclass",
      authorName: body.authorName || (user as any).name || "Shothik Author",
      manuscriptFormat: body.manuscriptFormat || "epub",
      priceUsd: body.priceUsd || 19.99,
      channels: body.channels || ["publishdrive", "shothik_store"],
    });

    logger.info("[api] Book published successfully", {
      publishingId: result.publishingId,
      bookTitle: result.bookTitle,
      storeUrl: result.storeUrl,
    });

    return Response.json({ data: result }, { status: 201 });
  } catch (error) {
    logger.error("[api] Book publishing failed", {
      error: error instanceof Error ? error.message : String(error),
    });

    return Response.json(
      {
        error: "Book publishing failed",
        code: "BOOK_PUBLISH_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
