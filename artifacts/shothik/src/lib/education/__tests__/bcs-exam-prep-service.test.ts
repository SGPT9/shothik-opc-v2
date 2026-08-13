import { describe, it, expect } from "vitest";
import { BcsExamPrepService } from "../bcs-exam-prep-service";

describe("BcsExamPrepService AI Education Engine", () => {
  it("should generate 3 structured MCQ questions in Bangla & English from textbook PDF", async () => {
    const mcqs = await BcsExamPrepService.generateMcqFromTextbook("BCS Bangladesh Affairs", 3);

    expect(mcqs).toHaveLength(3);
    expect(mcqs[0].questionBn).toContain("সংবিধানের");
    expect(mcqs[0].questionEn).toContain("Constitution");
    expect(mcqs[0].optionsBn).toHaveLength(4);
    expect(mcqs[0].correctOptionIndex).toBe(0);
  });

  it("should start 3D VTuber Viva Mock Interview session", async () => {
    const viva = await BcsExamPrepService.start3dVtuberVivaSession("Tanvir Ahmed");

    expect(viva).toHaveLength(2);
    expect(viva[0].questionBn).toContain("Tanvir Ahmed");
    expect(viva[0].expectedKeywords).toContain("Vision 2041");
  });

  it("should grade exam submission and return dual-language scorecard report", async () => {
    const card = await BcsExamPrepService.gradeExamSubmission("Tanvir Ahmed", "BCS Bangladesh Affairs", [0, 0, 0], 2);

    expect(card.candidateName).toBe("Tanvir Ahmed");
    expect(card.percentage).toBeGreaterThanOrEqual(70);
    expect(card.letterGrade).toBe("A+");
    expect(card.summaryBn).toContain("অভিনন্দন");
    expect(card.summaryEn).toContain("Congratulations");
  });
});
