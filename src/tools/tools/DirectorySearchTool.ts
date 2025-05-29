import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";

export class DirectorySearchTool extends Tool {
  id = "directory_search_tool";
  name = "Directory Search Tool";
  description =
    "Searches for files or folders in a directory that match a given keyword.";
  category = "file";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      directory: {
        type: "string",
        description: "Path to the directory.",
        example: "./data",
      },
      query: {
        type: "string",
        description: "Keyword to search for in file or folder names.",
        example: "report",
      },
    },
    required: ["directory", "query"],
  };
  examples = ["Find files in ./data containing 'report'"];

  async handler(args: { directory: string; query: string }): Promise<string> {
    try {
      const items = fs.readdirSync(args.directory);
      const matches = items.filter((name) =>
        name.toLowerCase().includes(args.query.toLowerCase())
      );
      if (!matches.length) return "No matches found.";
      return matches.join("\n");
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error searching directory: ${err.message}`;
    }
  }
}
