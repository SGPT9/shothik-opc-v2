import { describe, it, expect } from "vitest";
import { AuthorshipCertificateEngine } from "../authorship-certificate-engine.js";

describe("Authorship Certificate Engine", () => {
  it("generates an immutable cryptographic proof certificate with SHA-256 hash", () => {
    const cert = AuthorshipCertificateEngine.createCertificate({
      projectId: "proj_123",
      title: "Amar Boi",
      authorId: "usr_author_1",
      content: "সূর্য উঠার সাথে সাথে বুড়িগঙ্গার জল চকচক করে উঠল।",
      createdAt: new Date("2026-10-30T10:00:00Z"),
    });

    expect(cert.sha256Signature).toMatch(/^[a-f0-9]{64}$/);
    expect(cert.certificateId).toMatch(/^SHOTHIK-AUTH-[A-Z0-9]{8}$/);
    expect(cert.merkleRootHash).toBeDefined();
    expect(cert.title).toBe("Amar Boi");
    expect(cert.authorId).toBe("usr_author_1");
    expect(cert.wordCount).toBe(9);
    expect(cert.issuedAt).toBeDefined();
  });

  it("verifies tamper-resistance: any alteration to content invalidates the certificate", () => {
    const originalContent = "প্রথম অধ্যায়: মেঘনা নদীর মোহনায়";
    const cert = AuthorshipCertificateEngine.createCertificate({
      projectId: "proj_456",
      title: "Nodir Kotha",
      authorId: "usr_author_2",
      content: originalContent,
    });

    const isOriginalValid = AuthorshipCertificateEngine.verifyCertificateContent(
      originalContent,
      cert.sha256Signature
    );
    expect(isOriginalValid).toBe(true);

    const isTamperedValid = AuthorshipCertificateEngine.verifyCertificateContent(
      originalContent + " (Modified)",
      cert.sha256Signature
    );
    expect(isTamperedValid).toBe(false);
  });
});
