import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";
import { parse } from "csv-parse/sync";

export class CSVSearchTool extends Tool {
  id = "csv_search_tool";
  name = "CSV Search Tool";
  description =
    "Searches for rows in a CSV file that match a keyword or value.";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "Path to the CSV file.",
        example: "./data.csv",
      },
      query: {
        type: "string",
        description: "Keyword or value to search for in the CSV rows.",
        example: "OpenAI",
      },
    },
    required: ["file", "query"],
  };
  examples = ["Find rows in ./data.csv containing OpenAI"];

  async handler(args: { file: string; query: string }): Promise<string> {
    try {
      const fileContent = fs.readFileSync(args.file, "utf-8");
      const records = parse(fileContent, { columns: true });
      const results = records.filter((row: any) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(args.query.toLowerCase())
        )
      );
      if (!results.length) return "No results found.";
      return JSON.stringify(results.slice(0, 5), null, 2);
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error reading/searching CSV: ${err.message}`;
    }
  }
}
