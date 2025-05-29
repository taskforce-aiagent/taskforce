export interface EmbeddingProvider {
  getEmbedding(text: string): Promise<number[]>;
}
