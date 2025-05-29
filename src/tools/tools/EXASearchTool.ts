import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import axios from "axios";

export class EXASearchTool extends Tool {
  id = "exa_search_tool";
  name = "EXA Search Tool";
  description = "Performs a search using EXA API.";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query for EXA API.",
        example: "ai agent orchestration",
      },
    },
    required: ["query"],
  };
  examples = ["Search 'ai agent orchestration' with EXA"];

  async handler(args: { query: string }) {
    try {
      const apiKey = process.env.EXA_API_KEY;
      if (!apiKey) throw new Error("EXA_API_KEY is missing.");
      const res = await axios.get("https://api.exa.ai/search", {
        params: { q: args.query },
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return JSON.stringify(res.data.results?.slice(0, 5), null, 2);
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `EXA API error: ${err.message}`;
    }
  }
}
