import axios from "axios";
import { webScrapeTool } from "./WebScrapeTool.js";
import { InputSchema, LLMToolParameter, Tool } from "../base/baseTool.js";

import dotenv from "dotenv";
dotenv.config();
const BRAVE_API_KEY = process.env.BRAVE_API_KEY!;
const BRAVE_WEB_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search";
const BRAVE_SUMMARIZER_URL =
  "https://api.search.brave.com/res/v1/summarizer/search";

export interface BraveSearchToolOptions {
  useScrapeLinksAfterSearch?: boolean;
}

export class BraveSearchTool extends Tool {
  id = "brave_search_tool";
  name = "Brave Search Tool";
  description =
    "Performs real-time web search using the Brave API. Use for up-to-date results and latest news.";
  inputSchema = { type: "object", required: true } as InputSchema;
  parameters = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "A simplified, keyword-optimized search phrase relevant to the topic.\nIf the topic includes recent or uncertain events (e.g., trends, current issues, latest data), prefer using brave_search_tool to ensure up-to-date results.",
        example: "Aircraft engine history",
      },
    },
    required: ["query"],
  } as LLMToolParameter;

  examples = [
    "Search the latest news about quantum computing breakthroughs.",
    "Find recent articles on GPT-4 and AI safety.",
  ];
  category = "search";
  source = "brave";

  constructor(
    private options: BraveSearchToolOptions = {
      useScrapeLinksAfterSearch: false,
    }
  ) {
    super();
  }

  async handler(args: { query: string }): Promise<string> {
    if (!args.query || typeof args.query !== "string") {
      throw new Error("Invalid input for search tool: must be a string.");
    }

    if (!BRAVE_API_KEY) {
      throw new Error("BRAVE_API_KEY is not set in environment variables.");
    }

    try {
      const searchResponse = await axios.get(BRAVE_WEB_SEARCH_URL, {
        params: {
          q: args.query, // encode axios
          summary: 1,
        },
        timeout: 15000,
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": BRAVE_API_KEY,
        },
      });

      const summarizerKey = (searchResponse.data as any)?.summarizer?.key;

      if (summarizerKey) {
        const summarizerResponse = await axios.get(BRAVE_SUMMARIZER_URL, {
          params: {
            key: summarizerKey,
            entity_info: 1,
          },
          timeout: 15000,
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": BRAVE_API_KEY,
          },
        });

        return (summarizerResponse.data as any)?.summary || "No summary found.";
      } else {
        const links: { url: string; title: string; description: string }[] =
          (searchResponse.data as any).web?.results
            ?.slice(0, 10)
            .map((r: any) => ({
              url: r.url,
              title: r.title,
              description: r.description,
            })) || [];

        if (this.options.useScrapeLinksAfterSearch) {
          const summaries = await Promise.all(
            links.slice(0, 5).map(async (link) => {
              if (
                !link.url ||
                typeof link.url !== "string" ||
                !link.url.startsWith("http")
              ) {
                console.error("Invalid link:", link.url);
                return "";
              }
              try {
                return await webScrapeTool(link.url);
              } catch (err) {
                console.error("Scrape error:", err);
                return "";
              }
            })
          );
          return summaries.filter(Boolean).join("\n\n");
        } else {
          return links
            .map(
              (link, i) =>
                `🔗 [${i + 1}] ${link.title || "No title"}\n${
                  link.description || "No description"
                }\nurl: ${link.url}`
            )
            .join("\n\n");
        }
      }
    } catch (err: any) {
      if (typeof this.errorHandler === "function") {
        return this.errorHandler(err);
      }
      return `❌ Tool '${this.id}' execution error: ${err.message}`;
    }
  }
  errorHandler(error: any) {
    return `❌ BraveSearchTool error: ${error?.message || error}`;
  }
}
