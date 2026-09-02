import { NextRequest, NextResponse } from "next/server";
import { createAuthActions } from "@insforge/sdk/ssr";

import { getInsforgePublicConfig } from "@/lib/insforge/config";

function normalizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/auth/post-login";
  }

  return nextPath;
}

function buildFailureResponse(request: NextRequest) {
  const origin = request.nextUrl?.origin ?? "http://localhost:3000";
  const response = NextResponse.redirect(new URL("/auth/login?error=oauth", origin));
  response.cookies.delete("insforge_code_verifier");
  return response;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl ?? new URL(request.url);
  const code = url.searchParams.get("insforge_code");
  const verifier = request.cookies.get("insforge_code_verifier")?.value;

  if (!code || !verifier) {
    return buildFailureResponse(request);
  }

  const nextPath = normalizeNextPath(url.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(nextPath, url.origin));
  const auth = createAuthActions({
    requestCookies: request.cookies,
    responseCookies: response.cookies,
    ...getInsforgePublicConfig(),
  });

  const { error } = await auth.exchangeOAuthCode(code, verifier);

  if (error) {
    return buildFailureResponse(request);
  }

  response.cookies.delete("insforge_code_verifier");
  return response;
}
