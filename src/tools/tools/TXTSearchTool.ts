import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";

export class TXTSearchTool extends Tool {
  id = "txt_search_tool";
  name = "TXT Search Tool";
  description =
    "Searches for a keyword in a .txt file and returns matching lines.";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "Path to the .txt file.",
        example: "./data/notes.txt",
      },
      query: {
        type: "string",
        description: "Keyword to search for.",
        example: "openai",
      },
    },
    required: ["file", "query"],
  };
  examples = ["Find lines in notes.txt with 'openai'"];

  async handler(args: { file: string; query: string }): Promise<string> {
    try {
      const lines = fs.readFileSync(args.file, "utf-8").split("\n");
      const matches = lines.filter((line) =>
        line.toLowerCase().includes(args.query.toLowerCase())
      );
      if (!matches.length) return "No matches found.";
      return matches.slice(0, 10).join("\n");
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error searching .txt: ${err.message}`;
    }
  }
}
