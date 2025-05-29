import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import { Actor } from "apify";

export class ApifyActorsTool extends Tool {
  id = "apify_actors_tool";
  name = "Apify Actors Tool";
  description = "Runs an Apify Actor for advanced web scraping/automation.";
  category = "web";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      actorId: {
        type: "string",
        description: "Apify actor ID or name.",
        example: "apify/website-content-crawler",
      },
      input: {
        type: "object",
        description: "JSON input for the Apify actor.",
        example: { startUrls: [{ url: "https://example.com" }] },
      },
    },
    required: ["actorId", "input"],
  };
  examples = ["Run apify/website-content-crawler on example.com"];

  async handler(args: { actorId: string; input: any }) {
    try {
      await Actor.init();
      const run = await Actor.call(args.actorId, args.input);
      await Actor.exit();
      return JSON.stringify(run, null, 2);
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Apify error: ${err.message}`;
    }
  }
}
