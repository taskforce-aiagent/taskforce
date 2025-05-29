import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import axios from "axios";

export class FirecrawlSearchTool extends Tool {
  id = "firecrawl_search_tool";
  name = "Firecrawl Search Tool";
  description = "Performs a search using the Firecrawl API.";
  category = "web";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Keyword or phrase to search via Firecrawl.",
        example: "vector database",
      },
    },
    required: ["query"],
  };
  examples = ["Find latest on vector database with Firecrawl."];

  async handler(args: { query: string }) {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY;
      if (!apiKey) throw new Error("FIRECRAWL_API_KEY is missing.");
      const res = await axios.get("https://api.firecrawl.dev/v1/search", {
        params: { q: args.query },
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return JSON.stringify(res.data.results?.slice(0, 5), null, 2);
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error with Firecrawl: ${err.message}`;
    }
  }
}
