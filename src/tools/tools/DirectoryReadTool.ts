import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";

export class DirectoryReadTool extends Tool {
  id = "directory_read_tool";
  name = "Directory Read Tool";
  description = "Lists all files and folders in a given directory path.";
  category = "file";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      directory: {
        type: "string",
        description: "Absolute or relative path to the directory.",
        example: "./data",
      },
    },
    required: ["directory"],
  };
  examples = ["List files in ./blog-posts", "Show all files in /var/data"];

  async handler(args: { directory: string }): Promise<string> {
    try {
      const dirPath = args.directory;
      const items = fs.readdirSync(dirPath);
      return `Contents of ${dirPath}:\n` + items.join("\n");
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error reading directory: ${err.message}`;
    }
  }
}
