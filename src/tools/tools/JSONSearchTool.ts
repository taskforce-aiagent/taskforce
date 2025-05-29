import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";

export class JSONSearchTool extends Tool {
  id = "json_search_tool";
  name = "JSON Search Tool";
  description = "Searches for a keyword in a JSON file (in keys or values).";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "Path to the JSON file.",
        example: "./data.json",
      },
      query: {
        type: "string",
        description: "Keyword to search for in the JSON file.",
        example: "user_id",
      },
    },
    required: ["file", "query"],
  };
  examples = ["Search for user_id in ./data.json"];

  async handler(args: { file: string; query: string }): Promise<string> {
    try {
      const content = fs.readFileSync(args.file, "utf-8");
      const json = JSON.parse(content);
      const results: any[] = [];

      function search(obj: any, keyword: string) {
        if (typeof obj === "object" && obj !== null) {
          for (const key in obj) {
            if (
              key.toLowerCase().includes(keyword.toLowerCase()) ||
              (typeof obj[key] === "string" &&
                obj[key].toLowerCase().includes(keyword.toLowerCase()))
            ) {
              results.push({ key, value: obj[key] });
            }
            search(obj[key], keyword);
          }
        }
      }
      search(json, args.query);
      if (!results.length) return "No matches found.";
      return JSON.stringify(results.slice(0, 5), null, 2);
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error searching JSON: ${err.message}`;
    }
  }
}
