import { NextRequest, NextResponse } from "next/server";
import { getInsforgePublicConfig } from "@/lib/insforge/config";

export interface PonytailSynthesisResult {
  businessIdea: string;
  category: string;
  wholesaleSupplierQuote: {
    supplierName: string;
    itemUnitCostBdt: number;
    recommendedRetailPriceBdt: number;
    unitProfitBdt: number;
    marginPercentage: number;
  };
  generatedAdCopy: {
    headline: string;
    primaryText: string;
    targetAudience: string;
    hashtags: string[];
  };
  whatsappResponderConfig: {
    channel: string;
    autoReply: string;
  };
  starterTwinTasks: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { ideaPrompt } = await req.json();

    const prompt = ideaPrompt || "Sell custom leather wallets in Dhaka";

    // Call InsForge LLM Gateway / Gemini Flash to synthesize business infrastructure
    const insforgeConfig = getInsforgePublicConfig();
    const systemPrompt = `You are Ponytail Zero-Prompt Intent Synthesizer for Shothik Web.
Given a short business idea sentence, synthesize a complete business infrastructure in JSON format:
{
  "businessIdea": "${prompt}",
  "category": "Fashion & Accessories",
  "wholesaleSupplierQuote": {
    "supplierName": "Chawkbazar Wholesale Leather Guild",
    "itemUnitCostBdt": 350,
    "recommendedRetailPriceBdt": 1500,
    "unitProfitBdt": 1150,
    "marginPercentage": 76.6
  },
  "generatedAdCopy": {
    "headline": "প্রিমিয়াম হ্যান্ডমেড চামড়ার মানিব্যাগ — ৳১৫০০ (ডেলিভারি ফ্রি)",
    "primaryText": "১০০% খাঁটি চামড়ায় তৈরি আধুনিক ওয়ালেট। আপনার পছন্দের যেকোনো নাম খোদাই করে অর্ডার করুন।",
    "targetAudience": "Men aged 18-45 in Dhaka, Chittagong, Sylhet interested in Leather Goods",
    "hashtags": ["#LeatherWallet", "#HandmadeDhaka", "#ShothikWeb"]
  },
  "whatsappResponderConfig": {
    "channel": "WhatsApp Business",
    "autoReply": "ধন্যবাদ! আমাদের পিরমিয়াম চামড়ার মানিব্যাগটির মূল্য ৳১৫০০। অর্ডার করতে ডেলিভারি ঠিকানা জানান।"
  },
  "starterTwinTasks": [
    "Verify 5 wholesale leather sample units from Chawkbazar",
    "Launch Facebook & Instagram Ad Campaign with generated ad copy",
    "Activate ChatbotX WhatsApp automated lead responder",
    "Set up 1-Click Steadfast courier pickup integration",
    "Run ScenarioLab 100-run Monte Carlo profit simulation"
  ]
}`;

    let result: PonytailSynthesisResult;

    try {
      const aiRes = await fetch(`${insforgeConfig.baseUrl}/ai/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${insforgeConfig.anonKey}`,
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Synthesize business plan for: ${prompt}` },
          ],
        }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        const rawContent = data.choices?.[0]?.message?.content || "";
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          return NextResponse.json(result);
        }
      }
    } catch {
      // Use structured fallback if external VLM API is unreachable
    }

    result = {
      businessIdea: prompt,
      category: "E-Commerce & Retail",
      wholesaleSupplierQuote: {
        supplierName: "Chawkbazar Wholesale Guild",
        itemUnitCostBdt: 350,
        recommendedRetailPriceBdt: 1500,
        unitProfitBdt: 1150,
        marginPercentage: 76.6,
      },
      generatedAdCopy: {
        headline: `প্রিমিয়াম ${prompt} — ৳১৫০০ (ডেলিভারি ফ্রি)`,
        primaryText: `১০০% খাঁটি উপাদানে তৈরি। সেরা কোয়ালিটিতে অর্ডার করতে ইনবক্স করুন।`,
        targetAudience: "Male & Female 18-45 in Dhaka, Chittagong, Sylhet",
        hashtags: ["#EcommerceBD", "#ShothikWeb", "#OnlineShoppingBD"],
      },
      whatsappResponderConfig: {
        channel: "WhatsApp Business",
        autoReply: `ধন্যবাদ! আমাদের পণ্যের প্রিমিয়াম কালেকশনের মূল্য ৳১৫০০। অর্ডার করতে বিস্তারিত পাঠান।`,
      },
      starterTwinTasks: [
        "Verify wholesale supplier sample quality",
        "Launch Facebook Ad Campaign with generated ad copy",
        "Activate ChatbotX WhatsApp automated lead responder",
        "Set up Steadfast courier pickup integration",
        "Run ScenarioLab 100-run Monte Carlo profit simulation",
      ],
    };

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
