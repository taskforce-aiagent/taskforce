import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";

export class MDXSearchTool extends Tool {
  id = "mdx_search_tool";
  name = "MDX Search Tool";
  description = "Searches for keywords in Markdown (.md, .mdx) files.";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "Path to the Markdown file.",
        example: "./README.md",
      },
      query: {
        type: "string",
        description: "Keyword to search for.",
        example: "agent",
      },
    },
    required: ["file", "query"],
  };
  examples = ["Find 'agent' in README.md"];

  async handler(args: { file: string; query: string }): Promise<string> {
    try {
      const content = fs.readFileSync(args.file, "utf-8");
      const lines = content
        .split("\n")
        .filter((l) => l.toLowerCase().includes(args.query.toLowerCase()));
      if (!lines.length) return "No matches found.";
      return lines.slice(0, 5).join("\n");
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error searching MDX: ${err.message}`;
    }
  }
}
