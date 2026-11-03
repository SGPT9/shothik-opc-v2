import { describe, it, expect } from "vitest";
import {
  analyzeManuscriptWorkshop,
  type RubricDimension,
  type BlindPeerReview
} from "../mfa-workshop";

describe("MFA Creative Writing Classroom & Workshop Crucible (Capability #27)", () => {
  it("evaluates manuscript and generates comprehensive MFA rubric breakdown with letter grade & GPA", () => {
    const text = `নিঝুম রাতে বৃষ্টি নামল। সে জানালার পাশে এসে দাঁড়াল। মনে হলো বাতাসে শিউলি ফুলের গন্ধ।
কিন্তু বুকের ভেতরে অজানা একটা আতঙ্ক কাজ করছিল। সে ভাবল, কাল সকালের আলো ফুটলে এই শহর আর আগের মতো থাকবে না।
"তুমি কি শুনতে পাচ্ছ?" ওপাশ থেকে একটি চাপা দীর্ঘশ্বাস ভেসে এল।`;

    const report = analyzeManuscriptWorkshop(text, "student", "proj_mfa_test");

    expect(report.projectId).toBe("proj_mfa_test");
    expect(report.activeRole).toBe("student");
    expect(report.userClaim.claims.mfa_role).toBe("student");
    expect(report.compositeScore).toBeGreaterThanOrEqual(60);
    expect(report.compositeScore).toBeLessThanOrEqual(100);
    expect(["A", "A-", "B+", "B", "B-", "C+", "C", "F"]).toContain(report.letterGrade);
    expect(report.gpa).toBeGreaterThanOrEqual(2.0);

    // Verify all 5 rubric criteria
    const rubric = report.professorVerdict.rubricBreakdown;
    expect(rubric.length).toBe(5);
    const expectedDimensions = ["voice", "tension", "character", "craft", "theme"];
    for (const dim of expectedDimensions) {
      const match = rubric.find((r: RubricDimension) => r.id === dim);
      expect(match).toBeDefined();
      expect(match!.score).toBeGreaterThanOrEqual(50);
      expect(match!.name).toBeTruthy();
      expect(match!.nameBn).toBeTruthy();
      expect(match!.assessment).toBeTruthy();
    }
  });

  it("generates 3 distinct blind peer reviews with actionable prescriptions and author comparisons", () => {
    const text = "বৃষ্টির তোড়ে রাস্তাঘাট ফাঁকা। রিকশাওয়ালার ভেজা গামছা থেকে টপ টপ করে জল পড়ছে।";
    const report = analyzeManuscriptWorkshop(text, "ta", "proj_ta_review");

    expect(report.activeRole).toBe("ta");
    expect(report.userClaim.claims.can_endorse).toBe(true);
    expect(report.blindReviews.length).toBe(3);

    const reviewerAliases = report.blindReviews.map((r: BlindPeerReview) => r.reviewerAlias);
    expect(reviewerAliases).toContain("Peer Reviewer Alpha (Fiction Fellow)");
    expect(reviewerAliases).toContain("Peer Reviewer Beta (Poetics & Modernist Forms)");
    expect(reviewerAliases).toContain("Peer Reviewer Gamma (Speculative & Noir Workshop)");

    for (const review of report.blindReviews) {
      expect(review.strongestBeat).toBeTruthy();
      expect(review.frictionPoint).toBeTruthy();
      expect(review.workshopPrescription).toBeTruthy();
      expect(review.inspirationalAuthor).toBeTruthy();
    }
  });

  it("empowers professor role with master sign-off, action plan and line-level craft revisions", () => {
    const text = "সে চুপচাপ দাঁড়িয়ে রইল। কোনো শব্দ নেই। শুধু দীর্ঘ প্রতীক্ষা।";
    const report = analyzeManuscriptWorkshop(text, "professor", "proj_prof_test");

    expect(report.activeRole).toBe("professor");
    expect(report.userClaim.claims.can_grade).toBe(true);
    expect(report.userClaim.claims.can_endorse).toBe(true);

    expect(report.professorVerdict.headline).toBeTruthy();
    expect(report.professorVerdict.strengths.length).toBeGreaterThanOrEqual(2);
    expect(report.professorVerdict.criticalRevisions.length).toBeGreaterThanOrEqual(2);
    expect(report.professorVerdict.recommendedReading.length).toBeGreaterThanOrEqual(2);

    expect(report.lineCritiques.length).toBeGreaterThan(0);
    const firstCritique = report.lineCritiques[0];
    expect(firstCritique.quote).toBeTruthy();
    expect(firstCritique.critique).toBeTruthy();
    expect(firstCritique.suggestedRevision).toBeTruthy();

    expect(report.workshopActionPlan.length).toBeGreaterThanOrEqual(3);
  });
});
