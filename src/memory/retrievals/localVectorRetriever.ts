import {
  VectorMemoryProvider,
  VectorMemoryRecord,
} from "../vectorMemoryProviders/vectorMemoryProvider.js";
import { Retriever } from "./retrieval.interface.js";

export class LocalVectorRetriever implements Retriever {
  constructor(private provider: VectorMemoryProvider) {}

  async retrieve(
    query: string,
    options?: { limit?: number; raw?: boolean; agent?: string; taskId?: string }
  ): Promise<string[] | VectorMemoryRecord[]> {
    const records = await this.provider.loadRelevantMemory(
      query,
      options?.limit || 3,
      {
        agent: options?.agent,
        taskId: options?.taskId,
      }
    );

    if (options?.raw) {
      return records;
    }

    return records.map((r) => r.summary?.trim() || r.output?.trim() || "");
  }
}
