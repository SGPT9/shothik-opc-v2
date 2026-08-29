import React from "react";
import { Sparkles, TrendingUp, DollarSign, Package, GraduationCap, ArrowRight } from "lucide-react";

export const PRESET_STAR_PROMPTS = [
  {
    id: "fcommerce",
    icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
    badge: "E-Commerce",
    title: "Dhaka F-Commerce Ledger",
    desc: "Track daily orders, bKash/Nagad vs COD payments, delivery partners (Steadfast/Pathao), and return ratios.",
    prompt: "Generate a comprehensive F-Commerce order ledger with columns: Order_ID, Customer_Name, District, Product_Name, Quantity, Unit_Price, Delivery_Charge, Payment_Method (bKash/Nagad/COD), Courier (Steadfast/Pathao/RedX), Order_Status, and Net_Payout.",
  },
  {
    id: "financial-model",
    icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
    badge: "Finance",
    title: "12-Month SaaS Financial Model",
    desc: "Project monthly recurring revenue (MRR), churn rate, cloud server costs, customer acquisition cost (CAC), and net runway.",
    prompt: "Create a 12-month financial model spreadsheet with Month, Starting_MRR, New_MRR, Churned_MRR, Ending_MRR, CAC, Marketing_Spend, Server_Costs, Salaries, and Net_Burn.",
  },
  {
    id: "inventory",
    icon: <Package className="w-5 h-5 text-blue-500" />,
    badge: "Operations",
    title: "Warehouse Inventory & SKU Margins",
    desc: "Monitor warehouse stock levels, supplier unit cost, selling price, profit margin %, and automatic reorder alerts.",
    prompt: "Create a warehouse inventory management sheet with SKU, Product_Title, Category, Supplier, Stock_Quantity, Unit_Cost_BDT, Selling_Price_BDT, Gross_Margin_Percent, and Reorder_Status.",
  },
  {
    id: "academic",
    icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
    badge: "Academic",
    title: "University Research & Grade Matrix",
    desc: "Calculate weighted exam scores, midterm weights, letter grades, and statistical standard deviations across cohorts.",
    prompt: "Generate a university semester grading sheet with Student_ID, Full_Name, Attendance_10, Assignment_20, Midterm_30, Final_Exam_40, Total_Score, Grade_Point, and Letter_Grade.",
  },
];

export default function StarPromptCards({ onSelectPrompt }) {
  return (
    <div className="w-full max-w-2xl mx-auto my-6 px-2">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Native Spreadsheet Co-Founder</span>
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">
          What kind of spreadsheet are we building today?
        </h2>
        <p className="text-muted-foreground text-xs mt-1">
          Pick a battle-tested template or describe custom columns in natural language
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESET_STAR_PROMPTS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group relative flex flex-col text-left p-4 rounded-2xl bg-card hover:bg-muted/40 border border-border/80 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between w-full mb-2.5">
              <div className="p-2 rounded-xl bg-background border border-border group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">
                {item.badge}
              </span>
            </div>
            <h3 className="font-semibold text-sm text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center gap-1">
              {item.title}
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
            </h3>
            <p className="text-muted-foreground text-xs line-clamp-2 mt-1 leading-relaxed">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
