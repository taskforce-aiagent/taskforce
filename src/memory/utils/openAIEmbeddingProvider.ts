import OpenAI from "openai";
import { EmbeddingProvider } from "./embeddingProvider.js";

import dotenv from "dotenv";
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  async getEmbedding(text: string): Promise<number[]> {
    const res = await openai.embeddings.create({
      model: process.env.DEFAULT_OPENAI_EMBEDING_MODEL!,
      input: text,
    });
    return res.data[0].embedding;
  }
}
