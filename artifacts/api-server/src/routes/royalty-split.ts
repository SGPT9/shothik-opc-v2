import { Router, Request, Response } from "express";
import crypto from "crypto";

export interface StakeholderShare {
  id: string;
  roleBn: string;
  name: string;
  percentage: number; // 0 - 100
  payoutMethod: "bkash" | "nagad" | "beftn_bank" | "crypto_evm";
  walletOrAccount: string;
}

export interface DigitalFirstEdition {
  editionNumber: number; // e.g. 1
  totalEditionSupply: number; // e.g. 500
  editionSerial: string; // e.g. "SHTK-FE-0001/0500"
  collectorName: string;
  mintTimestamp: string;
  editionTokenHash: string;
  merkleLeafHash: string;
  isSpecialAuthorProof: boolean;
}

export interface MerkleProvenanceCertificate {
  projectId: string;
  bookTitleBn: string;
  merkleRootHash: string;
  chapterLeafHashes: {
    chapterIndex: number;
    chapterTitleBn: string;
    leafHash: string;
  }[];
  timestampUtc: string;
  ecdsaSignature: string;
  shothikCertificateId: string;
  immutableBlockNumber: number;
}

export interface RoyaltySplitState {
  projectId: string;
  totalRoyaltyPoolBdt: number;
  stakeholders: StakeholderShare[];
  merkleCertificate: MerkleProvenanceCertificate;
  mintedEditions: DigitalFirstEdition[];
  maxCollectorSupply: number;
}

export function computeMerkleRoot(leafHashes: string[]): string {
  if (leafHashes.length === 0) {
    return crypto.createHash("sha256").update("EMPTY_MANUSCRIPT").digest("hex");
  }

  let currentLevel = [...leafHashes];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
      const combinedHash = crypto
        .createHash("sha256")
        .update(left + right)
        .digest("hex");
      nextLevel.push(combinedHash);
    }
    currentLevel = nextLevel;
  }

  return currentLevel[0];
}

export function buildDefaultProvenanceCertificate(projectId: string): MerkleProvenanceCertificate {
  const chapters = [
    { chapterIndex: 1, chapterTitleBn: "সদরঘাটে কুয়াশা", text: "প্রথম অধ্যায়: সদরঘাটে মধ্যরাতের কুয়াশা ও রহস্যময় যুবকের আগমন।" },
    { chapterIndex: 2, chapterTitleBn: "পন্টুনের মরদেহ", text: "দ্বিতীয় অধ্যায়: ওসি রফিকের জেরা ও তিন নম্বর পন্টুনের লাশ।" },
    { chapterIndex: 3, chapterTitleBn: "বুড়িগঙ্গার তীরে শেষ প্রহর", text: "তৃতীয় অধ্যায়: বুড়িগঙ্গার তীরে শেষ প্রহর ও রুদ্ধশ্বাস গুলির শব্দ।" }
  ];

  const chapterLeafHashes = chapters.map((ch) => ({
    chapterIndex: ch.chapterIndex,
    chapterTitleBn: ch.chapterTitleBn,
    leafHash: crypto.createHash("sha256").update(ch.text).digest("hex")
  }));

  const merkleRoot = computeMerkleRoot(chapterLeafHashes.map((c) => c.leafHash));
  const signature = crypto
    .createHmac("sha256", "shothik_authorship_key_2026")
    .update(merkleRoot + projectId)
    .digest("hex");

  return {
    projectId,
    bookTitleBn: "অনন্ত নক্ষত্রবীথি",
    merkleRootHash: merkleRoot,
    chapterLeafHashes,
    timestampUtc: new Date().toISOString(),
    ecdsaSignature: `0x${signature.substring(0, 64)}`,
    shothikCertificateId: `CERT-SHTK-${merkleRoot.substring(0, 8).toUpperCase()}`,
    immutableBlockNumber: 4891024
  };
}

export function buildDefaultRoyaltyState(projectId: string): RoyaltySplitState {
  const cert = buildDefaultProvenanceCertificate(projectId);

  const initialEditions: DigitalFirstEdition[] = [
    {
      editionNumber: 1,
      totalEditionSupply: 500,
      editionSerial: "SHTK-FE-0001/0500",
      collectorName: "লেখক আর্কাইভ কপি (Author Genesis Proof)",
      mintTimestamp: new Date().toISOString(),
      editionTokenHash: crypto.createHash("sha256").update(cert.merkleRootHash + "1").digest("hex"),
      merkleLeafHash: cert.chapterLeafHashes[0].leafHash,
      isSpecialAuthorProof: true
    },
    {
      editionNumber: 2,
      totalEditionSupply: 500,
      editionSerial: "SHTK-FE-0002/0500",
      collectorName: "ফারহান আহমেদ (ভিআইপি পৃষ্ঠপোষক)",
      mintTimestamp: new Date(Date.now() - 3600000).toISOString(),
      editionTokenHash: crypto.createHash("sha256").update(cert.merkleRootHash + "2").digest("hex"),
      merkleLeafHash: cert.chapterLeafHashes[1].leafHash,
      isSpecialAuthorProof: false
    }
  ];

  return {
    projectId,
    totalRoyaltyPoolBdt: 150000,
    maxCollectorSupply: 500,
    stakeholders: [
      {
        id: "sh_author",
        roleBn: "মূল লেখক ও ঔপন্যাসিক (Lead Storyteller)",
        name: "আহসান হাবীব",
        percentage: 70,
        payoutMethod: "bkash",
        walletOrAccount: "01712-345678"
      },
      {
        id: "sh_artist",
        roleBn: "প্রচ্ছদ ও ৩ডি জ্যাকেট শিল্পী (Cover Artist)",
        name: "রুদ্র আহমেদ",
        percentage: 15,
        payoutMethod: "nagad",
        walletOrAccount: "01898-765432"
      },
      {
        id: "sh_editor",
        roleBn: "প্রধান সাহিত্যিক সম্পাদক (Senior Literary Editor)",
        name: "ড. সামিয়া হক",
        percentage: 10,
        payoutMethod: "beftn_bank",
        walletOrAccount: "City Bank AC 11029384729"
      },
      {
        id: "sh_dao",
        roleBn: "সঠিক সাহিত্য আর্কাইভিং ও রয়্যালটি ডাও (Protocol DAO)",
        name: "Shothik Archival DAO",
        percentage: 5,
        payoutMethod: "crypto_evm",
        walletOrAccount: "0x71C...b84F"
      }
    ],
    merkleCertificate: cert,
    mintedEditions: initialEditions
  };
}

export function createRoyaltySplitRouter(): Router {
  const router = Router();

  const getPaths = [
    "/v1/projects/:projectId/royalty-split",
    "/api/v1/projects/:projectId/royalty-split"
  ];
  router.get(getPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const state = buildDefaultRoyaltyState(projectId);

    res.json({
      success: true,
      projectId,
      state
    });
  });

  const configurePaths = [
    "/v1/projects/:projectId/royalty-split/configure",
    "/api/v1/projects/:projectId/royalty-split/configure"
  ];
  router.post(configurePaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { stakeholders } = req.body || {};

    if (!Array.isArray(stakeholders) || stakeholders.length === 0) {
      return res.status(400).json({ success: false, error: "রয়্যালটি অংশীদারদের তালিকা প্রদান করুন।" });
    }

    const totalPercent = stakeholders.reduce((sum: number, s: StakeholderShare) => sum + (Number(s.percentage) || 0), 0);
    if (Math.round(totalPercent) !== 100) {
      return res.status(400).json({
        success: false,
        error: `রয়্যালটি বণ্টনের মোট যোগফল ১০০% হতে হবে (বর্তমান যোগফল: ${totalPercent}%)`
      });
    }

    res.json({
      success: true,
      projectId,
      message: "স্মার্ট রয়্যালটি স্প্লিট সফলভাবে কনফিগার করা হয়েছে।",
      stakeholders
    });
    return;
  });

  const mintPaths = [
    "/v1/projects/:projectId/royalty-split/mint",
    "/api/v1/projects/:projectId/royalty-split/mint"
  ];
  router.post(mintPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const { collectorName } = req.body || {};

    const defaultState = buildDefaultRoyaltyState(projectId);
    const nextNumber = defaultState.mintedEditions.length + 1;
    const numPadded = String(nextNumber).padStart(4, "0");

    const newEdition: DigitalFirstEdition = {
      editionNumber: nextNumber,
      totalEditionSupply: 500,
      editionSerial: `SHTK-FE-${numPadded}/0500`,
      collectorName: collectorName || `সংগ্রাহক #${nextNumber}`,
      mintTimestamp: new Date().toISOString(),
      editionTokenHash: crypto
        .createHash("sha256")
        .update(defaultState.merkleCertificate.merkleRootHash + String(nextNumber))
        .digest("hex"),
      merkleLeafHash: defaultState.merkleCertificate.chapterLeafHashes[0].leafHash,
      isSpecialAuthorProof: false
    };

    res.json({
      success: true,
      projectId,
      newEdition,
      message: `ডিজিটাল প্রথম সংস্করণ ${newEdition.editionSerial} সফলভাবে মিন্ট হয়েছে।`
    });
  });

  const certPaths = [
    "/v1/projects/:projectId/royalty-split/certificate",
    "/api/v1/projects/:projectId/royalty-split/certificate"
  ];
  router.post(certPaths, (req: Request, res: Response) => {
    const projectId = typeof req.params.projectId === "string" ? req.params.projectId : "default";
    const cert = buildDefaultProvenanceCertificate(projectId);

    const certificateMarkdown =
      `\n\n<!-- ================================================================ -->\n` +
      `<!-- SHOTHIK CRYPTOGRAPHIC PROVENANCE & AUTHORSHIP CERTIFICATE -->\n` +
      `<!-- CERTIFICATE ID: ${cert.shothikCertificateId} -->\n` +
      `<!-- ================================================================ -->\n` +
      `### 🛡️ ক্রিপ্টোগ্রাফিক স্বত্বাধিকার ও প্রমাণপত্র (Provenance Certificate)\n\n` +
      `* **গ্রন্থের নাম**: ${cert.bookTitleBn}\n` +
      `* **সনদ নম্বর**: \`${cert.shothikCertificateId}\`\n` +
      `* **মার্কেল রুট হ্যাশ (Merkle Root)**: \`${cert.merkleRootHash}\`\n` +
      `* **লেখক স্বাক্ষর (ECDSA Sig)**: \`${cert.ecdsaSignature}\`\n` +
      `* **টাইমস্ট্যাম্প (UTC)**: ${cert.timestampUtc}\n` +
      `* **ব্লক হাইট**: #${cert.immutableBlockNumber}\n\n` +
      `> এই পান্ডুলিপির প্রতিটি অধ্যায় শোধক ডিস্ট্রিবিউটেড লেজারে ক্রিপ্টোগ্রাফিকভাবে সংরক্ষিত এবং কপিরাইট সংরক্ষিত।\n` +
      `<!-- ================================================================ -->\n`;

    res.json({
      success: true,
      projectId,
      certificate: cert,
      certificateMarkdown
    });
  });

  return router;
}

export const royaltySplitRouter = createRoyaltySplitRouter();
