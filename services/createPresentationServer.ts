import logger from "@/lib/logger";

export interface CreatePresentationServerOptions {
  message: string;
  file_urls?: string[] | Array<{ url: string; name?: string }> | null;
  token?: string | null;
  p_id?: string;
  userId?: string;
}

export interface CreatePresentationServerResult {
  success: boolean;
  presentationId?: string;
  status?: string;
  message?: string;
  error?: string;
}

export async function createPresentationServer({
  message,
  file_urls,
  token,
  p_id,
  userId,
}: CreatePresentationServerOptions): Promise<CreatePresentationServerResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://shothik.ai";
  const api = `${baseUrl}/slide/create-presentation`;

  try {
    const requestBody: Record<string, unknown> = {
      message,
      file_urls: file_urls || null,
    };

    if (p_id) {
      requestBody.p_id = p_id;
    }
    if (userId) {
      requestBody.userId = userId;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(api, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      logger.warn("[services] createPresentationServer request failed", {
        status: res.status,
        message: data.message,
      });
      return {
        success: false,
        error: data.message || "Failed to create presentation",
      };
    }

    return {
      success: true,
      presentationId: data?.presentationId || data?.presentation_id || data?.p_id,
      status: data?.status,
      message: data?.message,
    };
  } catch (err: any) {
    logger.error("[services] createPresentationServer error", { error: err.message || String(err) });
    return { success: false, error: err.message || "Something went wrong" };
  }
}
