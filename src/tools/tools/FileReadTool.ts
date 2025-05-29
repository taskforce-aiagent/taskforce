import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";

export class FileReadTool extends Tool {
  id = "file_read_tool";
  name = "File Read Tool";
  description = "Reads the content of a file (txt, md, json, csv, etc.).";
  category = "file";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "Path to the file to be read.",
        example: "./README.md",
      },
    },
    required: ["file"],
  };
  examples = [
    "Read the content of ./README.md",
    "Show me the content of ./data/data.json",
  ];

  async handler(args: { file: string }): Promise<string> {
    try {
      const content = fs.readFileSync(args.file, "utf-8");
      return content;
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error reading file: ${err.message}`;
    }
  }
}
