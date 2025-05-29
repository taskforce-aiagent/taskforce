import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";
import mammoth from "mammoth";

export class DOCXSearchTool extends Tool {
  id = "docx_search_tool";
  name = "DOCX Search Tool";
  description =
    "Searches for a keyword in a .docx file and returns matching paragraphs.";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "Path to the .docx file.",
        example: "./data/report.docx",
      },
      query: {
        type: "string",
        description: "Keyword to search for.",
        example: "summary",
      },
    },
    required: ["file", "query"],
  };
  examples = ["Find paragraphs in report.docx containing 'summary'"];

  async handler(args: { file: string; query: string }): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(args.file);
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const paragraphs = result.value
        .split("\n")
        .filter((p) => p.toLowerCase().includes(args.query.toLowerCase()));
      if (!paragraphs.length) return "No matches found.";
      return paragraphs.slice(0, 5).join("\n---\n");
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error searching DOCX: ${err.message}`;
    }
  }
}
