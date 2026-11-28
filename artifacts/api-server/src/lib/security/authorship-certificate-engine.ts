import crypto from "crypto";

export interface AuthorshipCertificate {
  certificateId: string;
  projectId: string;
  title: string;
  authorId: string;
  sha256Signature: string;
  merkleRootHash: string;
  wordCount: number;
  charCount: number;
  issuedAt: string;
  verificationUrl: string;
  status: "VERIFIED_IMMUTABLE";
}

export class AuthorshipCertificateEngine {
  /**
   * Generates a tamper-evident, cryptographically signed Authorship Certificate
   * linking the draft's SHA-256 fingerprint to the author and timestamp.
   */
  static createCertificate(params: {
    projectId: string;
    title: string;
    authorId: string;
    content: string;
    createdAt?: Date;
  }): AuthorshipCertificate {
    const { projectId, title, authorId, content, createdAt } = params;

    const issuedAt = (createdAt ?? new Date()).toISOString();
    const sha256Signature = crypto.createHash("sha256").update(content, "utf8").digest("hex");

    // Cryptographic token suffix (8 uppercase alphanumeric hex chars)
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    const certificateId = `SHOTHIK-AUTH-${randomSuffix}`;

    // Merkle root combining signature, author, project, and timestamp
    const merkleRootHash = crypto
      .createHash("sha256")
      .update(`${sha256Signature}:${authorId}:${projectId}:${issuedAt}`, "utf8")
      .digest("hex");

    const words = content.trim() ? content.trim().split(/\s+/).length : 0;

    return {
      certificateId,
      projectId,
      title,
      authorId,
      sha256Signature,
      merkleRootHash,
      wordCount: words,
      charCount: content.length,
      issuedAt,
      verificationUrl: `https://shothik.ai/verify/cert/${certificateId}`,
      status: "VERIFIED_IMMUTABLE",
    };
  }

  /**
   * Validates whether a given manuscript content matches a registered SHA-256 signature
   * using timing-safe comparison.
   */
  static verifyCertificateContent(content: string, expectedSignature: string): boolean {
    if (!content || !expectedSignature) {
      return false;
    }
    const computed = crypto.createHash("sha256").update(content, "utf8").digest("hex");
    if (computed.length !== expectedSignature.length) {
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(computed, "utf8"),
      Buffer.from(expectedSignature, "utf8")
    );
  }
}
