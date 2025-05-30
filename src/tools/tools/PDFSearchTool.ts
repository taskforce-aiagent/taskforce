import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";
import { PdfReader } from "pdfreader";

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
    return new Promise((resolve, reject) => {
      const lines: string[] = [];
      let currentLine = "";
      const queryLower = args.query.toLowerCase();

      new PdfReader().parseFileItems(args.file, (err: any, item: any) => {
        if (err) {
          return resolve(
            this.errorHandler
              ? this.errorHandler(err)
              : `Error searching PDF: ${err.message}`
          );
        }
        if (!item) {
          const matches = lines.filter((line) =>
            line.toLowerCase().includes(queryLower)
          );
          if (matches.length === 0) return resolve("No matches found.");
          return resolve(matches.slice(0, 5).join("\n---\n"));
        }
        if (item.text) {
          currentLine += item.text;
        }
        if (item && item.text === undefined && currentLine) {
          lines.push(currentLine.trim());
          currentLine = "";
        }
      });
    });
  }
}
