import axios from "axios";
import { EmbeddingProvider } from "./embeddingProvider.js";

export class HuggingFaceEmbeddingProvider implements EmbeddingProvider {
  private apiUrl: string;
  private model: string;

  constructor(
    apiUrl = "http://localhost:1234/v1/embeddings",
    model = "sentence-transformers/all-MiniLM-L12-v2"
  ) {
    this.apiUrl = apiUrl;
    this.model = model;
  }

  async getEmbedding(text: string): Promise<number[]> {
    const response = await axios.post(this.apiUrl, {
      model: this.model,
      input: text,
    });

    if (
      !response.data ||
      !response.data.data ||
      !Array.isArray(response.data.data[0]?.embedding)
    ) {
      throw new Error("Invalid embedding response from LM Studio");
    }

    return response.data.data[0].embedding;
  }
}
