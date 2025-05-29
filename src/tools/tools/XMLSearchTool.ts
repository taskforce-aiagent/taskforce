import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import fs from "fs";
import xml2js from "xml2js";

export class XMLSearchTool extends Tool {
  id = "xml_search_tool";
  name = "XML Search Tool";
  description = "Searches an XML file for a keyword in tags or attributes.";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      file: {
        type: "string",
        description: "Path to the XML file.",
        example: "./data/info.xml",
      },
      query: {
        type: "string",
        description: "Keyword to search for.",
        example: "company",
      },
    },
    required: ["file", "query"],
  };
  examples = ["Search for 'company' in info.xml"];

  async handler(args: { file: string; query: string }): Promise<string> {
    try {
      const xmlData = fs.readFileSync(args.file, "utf-8");
      const result = await xml2js.parseStringPromise(xmlData);
      const results: string[] = [];
      function search(obj: any) {
        if (typeof obj === "object" && obj !== null) {
          for (const [key, val] of Object.entries(obj)) {
            if (key.toLowerCase().includes(args.query.toLowerCase())) {
              results.push(`Tag: ${key} → Value: ${JSON.stringify(val)}`);
            }
            if (typeof val === "object") search(val);
          }
        }
      }
      search(result);
      if (!results.length) return "No matches found.";
      return results.slice(0, 10).join("\n---\n");
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error searching XML: ${err.message}`;
    }
  }
}
