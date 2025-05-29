import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

export class YoutubeVideoSearchTool extends Tool {
  id = "youtube_video_search_tool";
  name = "YouTube Video Search Tool";
  description =
    "Searches for YouTube videos by keyword using the YouTube Data API.";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Keyword to search videos for.",
        example: "LangChain demo",
      },
    },
    required: ["query"],
  };
  examples = ["Find LangChain demos on YouTube"];

  async handler(args: { query: string }): Promise<string> {
    try {
      const youtube = google.youtube({
        version: "v3",
        auth: process.env.YOUTUBE_API_KEY,
      });

      const response = await youtube.search.list({
        q: args.query,
        type: ["video"],
        maxResults: 5,
        part: ["snippet"],
      } as any);

      const items = (response.data.items || []) as any[];
      if (!items.length) return "No videos found.";
      return items
        .map(
          (item: any) =>
            `Title: ${item.snippet.title}\nChannel: ${item.snippet.channelTitle}\nURL: https://www.youtube.com/watch?v=${item.id.videoId}\nDescription: ${item.snippet.description}`
        )
        .join("\n---\n");
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `YouTube video search error: ${err.message}`;
    }
  }
}
