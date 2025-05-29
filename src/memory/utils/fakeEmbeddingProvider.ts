import { EmbeddingProvider } from "./embeddingProvider.js";
import * as crypto from "crypto";

export class FakeEmbeddingProvider implements EmbeddingProvider {
  async getEmbedding(text: string): Promise<number[]> {
    const hash = crypto.createHash("sha256").update(text).digest();
    return Array.from(hash.slice(0, 128)).map((byte) => byte / 255);
  }
}
