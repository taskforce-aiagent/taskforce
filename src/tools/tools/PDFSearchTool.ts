import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";
import pdfParse from "pdf-parse";

export class PDFSearchTool extends Tool {
  id = "pdf_search_tool";
  name = "PDF Search Tool";
  description =
    "Searches for a keyword in a PDF file and returns matching paragraphs.";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "Path to the PDF file.",
        example: "./contract.pdf",
      },
      query: {
        type: "string",
        description: "Keyword to search for in the PDF.",
        example: "LLM",
      },
    },
    required: ["file", "query"],
  };
  examples = ["Find paragraphs in contract.pdf containing LLM"];

  async handler(args: { file: string; query: string }): Promise<string> {
    try {
      const fileBuffer = fs.readFileSync(args.file);
      const data = await pdfParse(fileBuffer);
      const paragraphs = data.text
        .split("\n")
        .filter((p) => p.toLowerCase().includes(args.query.toLowerCase()));
      if (!paragraphs.length) return "No matches found.";
      return paragraphs.slice(0, 5).join("\n---\n");
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error searching PDF: ${err.message}`;
    }
  }
}
