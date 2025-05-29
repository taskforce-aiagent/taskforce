import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import axios from "axios";

export class DALLETool extends Tool {
  id = "dalle_tool";
  name = "DALL-E Tool";
  description = "Generates an image from a prompt using OpenAI DALL-E API.";
  category = "vision";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "Description of the image to generate.",
        example: "A robot writing code in a cozy cafe",
      },
    },
    required: ["prompt"],
  };
  examples = ["Generate an image: A robot writing code in a cozy cafe"];

  async handler(args: { prompt: string }): Promise<string> {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set.");
    }
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/images/generations",
        {
          prompt: args.prompt,
          n: 1,
          size: "1024x1024",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
      return response.data.data[0].url || "No image returned.";
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error generating image: ${err.message}`;
    }
  }
}
