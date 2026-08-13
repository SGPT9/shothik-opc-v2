import { describe, it, expect } from "vitest";
import { InsForgeAuthRlsService } from "../auth-rls-service";

describe("InsForgeAuthRlsService Auth & RLS Policy Engine", () => {
  it("should generate Google 1-Tap OAuth sign-in redirect URL", async () => {
    const oauth = await InsForgeAuthRlsService.signInWithGoogleOAuth();
    expect(oauth.redirectUrl).toContain("auth/v1/authorize?provider=google");
  });

  it("should authenticate user via Email and return InsForge profile and JWT token", async () => {
    const auth = await InsForgeAuthRlsService.signInWithEmail("tanvir@polsia.app", "SecretPass123!");
    expect(auth.user.email).toBe("tanvir@polsia.app");
    expect(auth.user.badges).toContain("verified_merchant");
    expect(auth.token).toContain("jwt_insforge_");
  });

  it("should enforce Row-Level Security (RLS) policy (auth.uid() = user_id)", async () => {
    const rls = await InsForgeAuthRlsService.verifyWorkspaceRlsPolicy("ws_polsia_101", "usr_tanvir_99");
    expect(rls.allowed).toBe(true);
    expect(rls.role).toBe("owner");
  });
});
