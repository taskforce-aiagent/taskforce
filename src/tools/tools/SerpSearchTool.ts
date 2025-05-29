import axios from "axios";
import { InputSchema, LLMToolParameter, Tool } from "../base/baseTool.js";

import dotenv from "dotenv";
dotenv.config();
const SERP_API_KEY = process.env.SERPAPI_API_KEY!;
const SERP_API_URL = "https://serpapi.com/search.json";

export class SerpSearchTool extends Tool {
  id = "serp_search_tool";
  name = "Serp Search Tool";
  description =
    "Performs real-time web search using a search engine API. Use this tool when the task requires current or unknown information from the internet. It returns a list of relevant URLs along with brief summaries, allowing you to choose which links to explore further using a web scraping tool.";
  inputSchema = {
    type: "object",
    required: true,
  } as InputSchema;
  parameters = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The exact user query or question to search online. For example: 'Who is the current president of USA?'",
        example: "Who is the current president of USA?",
      },
    },
    required: ["query"],
  } as LLMToolParameter;
  examples = [
    "Find latest headlines about OpenAI.",
    "Search: What is the weather in Istanbul today?",
  ];
  category = "search";
  source = "serpapi";

  async handler(args: { query: string }): Promise<string> {
    if (!args?.query || typeof args.query !== "string") {
      throw new Error("Invalid input: 'query' is required.");
    }

    if (!args.query || typeof args.query !== "string") {
      throw new Error("Invalid input for search tool.");
    }

    try {
      // 1. SerpAPI üzerinden Google araması
      const response = await axios.get(SERP_API_URL, {
        params: {
          q: args.query,
          api_key: SERP_API_KEY,
          hl: "tr",
          gl: "tr",
        },
      });

      const links: { url: string; title: string; description: string }[] =
        (response.data as any)?.organic_results?.slice(0, 10).map((r: any) => ({
          url: r.url,
          title: r.title,
          description: r.description,
        })) || [];

      return links
        .map(
          (link, i) =>
            `🔗 [${i + 1}] ${link.title || "No title"}\n${
              link.description || "No description"
            }\nurl: ${link.url}`
        )
        .join("\n\n");
    } catch (err: any) {
      if (typeof this.errorHandler === "function") {
        return this.errorHandler(err);
      }
      return `❌ Tool '${this.id}' execution error: ${err.message}`;
    }
  }

  errorHandler(error: any) {
    return `❌ SerpSearchTool error: ${error?.message || error}`;
  }
}
