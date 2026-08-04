import { InsForgeTwinRagMemory } from "@/lib/insforge/rag-memory";
import logger from "@/lib/logger";

export interface ToolRegistryItem {
  category: string;
  name: string;
  repo: string;
  useCase: string;
}

export const AI_GROWTH_OS_REGISTRY: ToolRegistryItem[] = [
  // Core AI & Agents
  { category: "Core AI & Agents", name: "LangGraph", repo: "https://github.com/langchain-ai/langgraph", useCase: "Stateful multi-agent orchestration and memory management." },
  { category: "Core AI & Agents", name: "CrewAI", repo: "https://github.com/joaomdmoura/crewAI", useCase: "Role-based AI agent collaboration for complex workflows." },
  { category: "Core AI & Agents", name: "Dify", repo: "https://github.com/langgenius/dify", useCase: "Open-source LLM app dev platform with RAG and visual workflows." },
  { category: "Core AI & Agents", name: "Flowise", repo: "https://github.com/FlowiseAI/Flowise", useCase: "Drag-and-drop UI to build LLM flows and chatbots quickly." },
  
  // Web & Browser Tools
  { category: "Web & Browser Tools", name: "Crawl4AI", repo: "https://github.com/unclecode/crawl4ai", useCase: "Fast, AI-optimized web crawling and structured data extraction." },
  { category: "Web & Browser Tools", name: "Firecrawl", repo: "https://github.com/mendableai/firecrawl", useCase: "Turns entire websites into LLM-ready markdown or structured data." },
  { category: "Web & Browser Tools", name: "Playwright (Python)", repo: "https://github.com/microsoft/playwright-python", useCase: "Cross-browser automation for testing, scraping, and form filling." },

  // SEO & GEO
  { category: "SEO & GEO", name: "SerpBear", repo: "https://github.com/nicgene/serpbear", useCase: "Self-hosted, open-source search engine position tracker." },
  { category: "SEO & GEO", name: "OpenSEO", repo: "https://github.com/every-app/open-seo", useCase: "All-in-one SEO suite including audits, rank tracking, and AI content." },
  { category: "SEO & GEO", name: "python-seo-analyzer", repo: "https://github.com/sethblack/python-seo-analyzer", useCase: "Analyzes site structure and warns of technical SEO issues." },

  // WhatsApp & Social
  { category: "WhatsApp & Social", name: "Evolution API", repo: "https://github.com/evolution-foundation/evolution-api", useCase: "Production-ready REST API for WhatsApp multi-channel messaging." },
  { category: "WhatsApp & Social", name: "Baileys", repo: "https://github.com/WhiskeySockets/Baileys", useCase: "Unofficial, lightweight WhatsApp Web API written in TypeScript." },
  { category: "WhatsApp & Social", name: "Chatwoot", repo: "https://github.com/chatwoot/chatwoot", useCase: "Open-source customer engagement suite with WhatsApp/FB integration." },
  { category: "WhatsApp & Social", name: "Typebot", repo: "https://github.com/baptistearno/typebot.io", useCase: "Visual drag-and-drop builder for conversational WhatsApp/Messenger bots." },

  // E-commerce
  { category: "E-commerce", name: "Medusa.js", repo: "https://github.com/medusajs/medusa", useCase: "Open-source headless commerce engine (customizable Shopify alternative)." },
  { category: "E-commerce", name: "WooCommerce (REST API)", repo: "https://github.com/woocommerce/woocommerce", useCase: "Core e-commerce engine for WordPress integrations and automation." },
  { category: "E-commerce", name: "Shopify Python API", repo: "https://github.com/Shopify/shopify-python-api", useCase: "Official wrapper to interact with Shopify Admin and Storefront APIs." },
  { category: "E-commerce", name: "Saleor", repo: "https://github.com/saleor/saleor", useCase: "GraphQL-first, headless e-commerce platform built in Python/Django." },

  // Email & Marketing
  { category: "Email & Marketing", name: "Listmonk", repo: "https://github.com/knadh/listmonk", useCase: "Self-hosted, high-performance newsletter and mailing list manager." },
  { category: "Email & Marketing", name: "Mautic", repo: "https://github.com/mautic/mautic", useCase: "Open-source marketing automation for email, social, and lead tracking." },
  { category: "Email & Marketing", name: "Novu", repo: "https://github.com/novuhq/novu", useCase: "Open-source notification infrastructure (email, SMS, push, in-app)." },

  // Media Generation
  { category: "Media Generation", name: "Whisper (OpenAI)", repo: "https://github.com/openai/whisper", useCase: "Robust, multilingual speech recognition and transcription." },
  { category: "Media Generation", name: "Piper TTS", repo: "https://github.com/rhasspy/piper", useCase: "Fast, local neural text-to-speech engine optimized for low-resource setups." },
  { category: "Media Generation", name: "ComfyUI", repo: "https://github.com/comfyanonymous/ComfyUI", useCase: "Node-based GUI for Stable Diffusion image generation workflows." },
  { category: "Media Generation", name: "Remotion", repo: "https://github.com/remotion-dev/remotion", useCase: "React-based framework for programmatic, code-driven video creation." },

  // South Asian NLP
  { category: "South Asian NLP", name: "IndicTrans2 (AI4Bharat)", repo: "https://github.com/AI4Bharat/IndicTrans2", useCase: "High-quality machine translation model for 22 Indic languages." },
  { category: "South Asian NLP", name: "IndicBERT", repo: "https://github.com/AI4Bharat/IndicBERT", useCase: "Multilingual BERT model pre-trained on 11 major Indic languages." },
  { category: "South Asian NLP", name: "BNLTK", repo: "https://github.com/sagorbrur/bnltk", useCase: "Bangla Natural Language Processing Toolkit for text processing." },
  { category: "South Asian NLP", name: "iNLTK", repo: "https://github.com/goru001/inltk", useCase: "Natural Language Toolkit for Indic languages (Urdu, Bengali, etc.)." },

  // Data & Automation
  { category: "Data & Automation", name: "n8n", repo: "https://github.com/n8n-io/n8n", useCase: "Fair-code workflow automation tool (Zapier alternative) with native AI nodes." },
  { category: "Data & Automation", name: "Activepieces", repo: "https://github.com/activepieces/activepieces", useCase: "Open-source, user-friendly alternative to Zapier for business automation." },
  
  // Data & Analytics
  { category: "Data & Analytics", name: "DuckDB", repo: "https://github.com/duckdb/duckdb", useCase: "Fast in-process SQL OLAP database for local, high-speed data analytics." },
  { category: "Data & Analytics", name: "Apache Superset", repo: "https://github.com/apache/superset", useCase: "Modern, enterprise-ready business intelligence web application." },

  // Knowledge Base/RAG
  { category: "Knowledge Base/RAG", name: "AnythingLLM", repo: "https://github.com/Mintplex-Labs/anything-llm", useCase: "All-in-one desktop app for local RAG, chat, and document ingestion." },
  { category: "Knowledge Base/RAG", name: "Qdrant", repo: "https://github.com/qdrant/qdrant", useCase: "High-performance vector search engine for AI RAG pipelines." },
  { category: "Knowledge Base/RAG", name: "Chroma", repo: "https://github.com/chroma-core/chroma", useCase: "AI-native open-source embedding database for LLM apps." },

  // CRM & Sales
  { category: "CRM & Sales", name: "Twenty CRM", repo: "https://github.com/twentyhq/twenty", useCase: "Modern, open-source alternative to Salesforce/HubSpot for sales teams." },
];

export class AiGrowthRegistryService {
  /**
   * Indexes the AI Growth OS Registry into InsForge Twin RAG Memory Vault.
   */
  static async seedAiGrowthRegistry(twinId: string = "twin_shothik_system"): Promise<{ indexedCount: number }> {
    logger.info("[ai-growth-registry] Ingesting 37 open-source tools into InsForge RAG Memory Vault", {
      twinId,
      totalTools: AI_GROWTH_OS_REGISTRY.length,
    });

    let count = 0;
    for (const tool of AI_GROWTH_OS_REGISTRY) {
      await InsForgeTwinRagMemory.saveMemoryChunk({
        twinId,
        documentId: `doc_tool_${tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
        chunkId: `chk_tool_${count}`,
        title: `${tool.name} (${tool.category})`,
        snippet: `${tool.name}: ${tool.useCase}`,
        content: `Tool Name: ${tool.name}\nCategory: ${tool.category}\nSource Code Repository: ${tool.repo}\nUse Case: ${tool.useCase}`,
        contentType: "tool_registry",
        tags: ["open-source", "skills", "automation", tool.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")],
      });
      count++;
    }

    logger.info("[ai-growth-registry] Successfully indexed AI Growth OS registry into RAG memory", { indexedCount: count });
    return { indexedCount: count };
  }

  /**
   * Resolves relevant open-source tools from the registry for a user's task intent.
   */
  static searchToolsByCategory(categoryOrKeyword: string): ToolRegistryItem[] {
    const term = categoryOrKeyword.toLowerCase();
    return AI_GROWTH_OS_REGISTRY.filter(
      (item) =>
        item.category.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.useCase.toLowerCase().includes(term)
    );
  }
}
