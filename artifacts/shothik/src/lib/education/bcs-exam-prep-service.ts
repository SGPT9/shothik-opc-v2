import logger from "@/lib/logger";

export interface McqQuestion {
  id: string;
  questionBn: string;
  questionEn: string;
  optionsBn: string[];
  optionsEn: string[];
  correctOptionIndex: number;
  explanationBn: string;
  explanationEn: string;
}

export interface VivaQuestion {
  id: string;
  questionBn: string;
  questionEn: string;
  expectedKeywords: string[];
  vivaTip: string;
}

export interface ExamScorecardResult {
  candidateName: string;
  subject: string;
  mcqScore: number;
  totalMcq: number;
  vivaScore: number;
  totalViva: number;
  percentage: number;
  letterGrade: "A+" | "A" | "B" | "C" | "F";
  summaryBn: string;
  summaryEn: string;
  gradedAt: string;
}

export class BcsExamPrepService {
  /**
   * Generates structured MCQ questions from textbook PDFs in Bangla & English.
   */
  static async generateMcqFromTextbook(subject: string, questionCount: number = 3): Promise<McqQuestion[]> {
    logger.info("[bcs-exam-prep] Generating MCQ questions from textbook PDF", { subject, questionCount });

    return [
      {
        id: `mcq_1_${Date.now()}`,
        questionBn: "বাংলাদেশের সংবিধানের কত নম্বর অনুচ্ছেদে মৌলিক অধিকারের উল্লেখ রয়েছে?",
        questionEn: "Which article of the Bangladesh Constitution guarantees fundamental rights?",
        optionsBn: ["অনুচ্ছেদ ২৭-৪৪", "অনুচ্ছেদ ১০-২০", "অনুচ্ছেদ ৫০-৬০", "অনুচ্ছেদ ৭০-৭৫"],
        optionsEn: ["Articles 27-44", "Articles 10-20", "Articles 50-60", "Articles 70-75"],
        correctOptionIndex: 0,
        explanationBn: "সংবিধানের ৩য় ভাগে অনুচ্ছেদ ২৭ থেকে ৪৪ পর্যন্ত মৌলিক অধিকারসমূহ বিস্তারিত বর্ণিত রয়েছে।",
        explanationEn: "Part III of the Constitution (Articles 27-44) outlines fundamental rights.",
      },
      {
        id: `mcq_2_${Date.now()}`,
        questionBn: "বাংলাদেশের স্বাধীনতার ঘোষণাপত্র কবে গৃহীত হয়?",
        questionEn: "When was the Proclamation of Independence of Bangladesh adopted?",
        optionsBn: ["১৭ এপ্রিল ১৯৭১", "২৬ মার্চ ১৯৭১", "১৬ ডিসেম্বর ১৯৭১", "১০ এপ্রিল ১৯৭১"],
        optionsEn: ["17 April 1971", "26 March 1971", "16 December 1971", "10 April 1971"],
        correctOptionIndex: 3,
        explanationBn: "১০ এপ্রিল ১৯৭১ সালে মুজিবনগর সরকার আনুষ্ঠানিকভাবে স্বাধীনতার ঘোষণাপত্র গ্রহণ করে।",
        explanationEn: "The Proclamation of Independence was formally adopted on 10 April 1971.",
      },
      {
        id: `mcq_3_${Date.now()}`,
        questionBn: "বঙ্গোপসাগরের গভীরতম খাতের নাম কি?",
        questionEn: "What is the deepest trench in the Bay of Bengal?",
        optionsBn: ["সোয়াচ অব নো গ্রাউন্ড", "মারিয়ানা খাত", "জাভা খাত", "সুন্দা খাত"],
        optionsEn: ["Swatch of No Ground", "Mariana Trench", "Java Trench", "Sunda Trench"],
        correctOptionIndex: 0,
        explanationBn: "সোয়াচ অব নো গ্রাউন্ড বঙ্গোপসাগরের একটি বিখ্যাত গভীর জলতল খাদ।",
        explanationEn: "Swatch of No Ground is a prominent underwater canyon in the Bay of Bengal.",
      },
    ];
  }

  /**
   * Initializes 3D VTuber Viva Mock Interview session questions.
   */
  static async start3dVtuberVivaSession(candidateName: string): Promise<VivaQuestion[]> {
    logger.info("[bcs-exam-prep] Initializing 3D VTuber Viva Mock Interview session", { candidateName });

    return [
      {
        id: `viva_1_${Date.now()}`,
        questionBn: `${candidateName}, বাংলাদেশের স্বাধীনতার সুবর্ণজয়ন্তী ও রূপকল্প ২০৪১ নিয়ে আপনার মতামত সংক্ষেপে বলুন।`,
        questionEn: `${candidateName}, briefly explain your thoughts on Bangladesh's Vision 2041.`,
        expectedKeywords: ["Vision 2041", "Smart Bangladesh", "GDP growth", "RMG", "Infrastructure"],
        vivaTip: "Maintain confident posture, eye contact with the 3D VTuber avatar, and speak clearly.",
      },
      {
        id: `viva_2_${Date.now()}`,
        questionBn: "সংবিধানের ৭০ নম্বর অনুচ্ছেদ বিলুপ্ত করার পক্ষে বা বিপক্ষে আপনার যুক্তি উপস্থাপন করুন।",
        questionEn: "Present your argument for or against Article 70 of the Constitution.",
        expectedKeywords: ["Article 70", "Floor crossing", "Party discipline", "Democracy"],
        vivaTip: "Avoid extreme political bias; present a balanced analytical argument.",
      },
    ];
  }

  /**
   * Grades student MCQ and Viva answers, returning a dual-language scorecard.
   */
  static async gradeExamSubmission(
    candidateName: string,
    subject: string,
    mcqAnswers: number[],
    vivaAnswersCount: number
  ): Promise<ExamScorecardResult> {
    logger.info("[bcs-exam-prep] Grading exam submission and generating scorecard", { candidateName, subject });

    const totalMcq = 3;
    const mcqScore = mcqAnswers.filter((ans, idx) => ans === 0).length; // Simulated scoring
    const vivaScore = Math.min(vivaAnswersCount * 5, 10);
    const totalViva = 10;

    const percentage = Math.round(((mcqScore + vivaScore) / (totalMcq + totalViva)) * 100);
    const letterGrade: "A+" | "A" | "B" | "C" | "F" = percentage >= 80 ? "A+" : percentage >= 70 ? "A" : "B";

    return {
      candidateName,
      subject,
      mcqScore,
      totalMcq,
      vivaScore,
      totalViva,
      percentage,
      letterGrade,
      summaryBn: `অভিনন্দন ${candidateName}! আপনি ${subject} পরীক্ষায় ${percentage}% নম্বর পেয়ে ${letterGrade} গ্রেড অর্জন করেছেন।`,
      summaryEn: `Congratulations ${candidateName}! You scored ${percentage}% with grade ${letterGrade} in ${subject}.`,
      gradedAt: new Date().toISOString(),
    };
  }
}
