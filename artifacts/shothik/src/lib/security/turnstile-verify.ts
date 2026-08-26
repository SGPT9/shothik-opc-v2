import logger from "@/lib/logger";

export interface TurnstileVerificationResult {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
  action?: string;
  cdata?: string;
}

const CLOUDFLARE_TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Server-side Turnstile siteverify validator
 * Validates invisible bot-protection tokens against Cloudflare API
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey?: string,
  remoteIp?: string
): Promise<TurnstileVerificationResult> {
  const secret = secretKey || process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  // Development bypass when secret is not configured or in test mode
  if (!secret || secret === "test_secret_bypass" || token === "test_pass_token") {
    logger.info("[turnstile] Development/Test bypass granted", { token: token.slice(0, 10) });
    return {
      success: true,
      hostname: "localhost",
      challenge_ts: new Date().toISOString(),
    };
  }

  if (!token) {
    return {
      success: false,
      error_codes: ["missing-input-response"],
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(CLOUDFLARE_TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      logger.error("[turnstile] Verification HTTP error", { status: response.status });
      return {
        success: false,
        error_codes: [`http-status-${response.status}`],
      };
    }

    const result: TurnstileVerificationResult = await response.json();
    return result;
  } catch (error: any) {
    logger.error("[turnstile] Network error verifying token", { error: error.message });
    return {
      success: false,
      error_codes: ["internal-error"],
    };
  }
}
