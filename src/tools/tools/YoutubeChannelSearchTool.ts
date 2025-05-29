import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

export class YoutubeChannelSearchTool extends Tool {
  id = "youtube_channel_search_tool";
  name = "YouTube Channel Search Tool";
  description =
    "Searches for YouTube channels by keyword using the YouTube Data API.";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Keyword to search channels for.",
        example: "AI research",
      },
    },
    required: ["query"],
  };
  examples = ["Search for AI channels on YouTube"];

  async handler(args: { query: string }): Promise<string> {
    try {
      const youtube = google.youtube({
        version: "v3",
        auth: process.env.YOUTUBE_API_KEY,
      });

      const response = await youtube.search.list({
        q: args.query,
        type: ["channel"],
        maxResults: 5,
        part: ["snippet"],
      } as any);

      const items = (response.data.items || []) as any[];
      if (!items.length) return "No channels found.";
      return items
        .map(
          (item: any) =>
            `Channel: ${item.snippet.title}\nDescription: ${item.snippet.description}\nURL: https://www.youtube.com/channel/${item.id.channelId}`
        )
        .join("\n---\n");
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `YouTube channel search error: ${err.message}`;
    }
  }
}
