import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import axios from "axios";

export class StableDiffusionTool extends Tool {
  id = "stable_diffusion_tool";
  name = "Stable Diffusion Tool";
  description = "Generates images using Stable Diffusion via Replicate API.";
  category = "vision";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "Image prompt for Stable Diffusion.",
        example: "A futuristic cityscape at sunset",
      },
    },
    required: ["prompt"],
  };
  examples = ["Generate 'a cat astronaut on Mars'"];

  async handler(args: { prompt: string }) {
    try {
      const apiKey = process.env.REPLICATE_API_KEY;
      const res = await axios.post(
        "https://api.replicate.com/v1/predictions",
        {
          version: "your-model-version",
          input: { prompt: args.prompt },
        },
        {
          headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return JSON.stringify(res.data, null, 2);
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Vision API error: ${err.message}`;
    }
  }
}
