import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import axios from "axios";

export class WikipediaSearchTool extends Tool {
  id = "wikipedia_search_tool";
  name = "Wikipedia Search Tool";
  description =
    "Searches Wikipedia for a given topic and returns the summary section of the article, if available.";
  category = "search";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search term or topic to look up in Wikipedia.",
        example: "Large Language Model",
      },
      language: {
        type: "string",
        description: "Wikipedia language code (default: 'en').",
        example: "en",
      },
    },
    required: ["query"],
  };
  examples = [
    "Summarize 'Alan Turing' from Wikipedia",
    "Wikipedia'da 'Yapay zeka' nedir?",
  ];

  async handler(args: { query: string; language?: string }): Promise<string> {
    try {
      const lang = args.language || "en";
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        args.query
      )}`;
      const response = await axios.get(url, { timeout: 8000 });
      if (response.data.extract) {
        return response.data.extract;
      } else {
        return "No summary found for this topic in Wikipedia.";
      }
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Wikipedia search error: ${err.message}`;
    }
  }
}
