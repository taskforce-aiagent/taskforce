import { MemoryScope } from "../../../configs/enum.js";
import { cosineSimilarity } from "../../utils/embedding.js";
import { EmbeddingProvider } from "../../utils/embeddingProvider.js";
import {
  VectorMemoryProvider,
  VectorMemoryRecord,
} from "../vectorMemoryProvider.js";

type EmbeddedRecord = VectorMemoryRecord & { vector: number[] };

export class TaskForceVectorMemoryProvider implements VectorMemoryProvider {
  private records: EmbeddedRecord[] = [];
  constructor(private embeddingProvider: EmbeddingProvider) {}

  async storeMemory(record: VectorMemoryRecord): Promise<void> {
    const isDuplicate = this.records.some(
      (r) => r.output === record.output && r.taskId === record.taskId
    );
    if (isDuplicate) return;
    const vector = await this.embeddingProvider.getEmbedding(record.output);
    this.records.push({ ...record, vector });
  }

  async loadRelevantMemory(
    query: string,
    limit = 3
  ): Promise<VectorMemoryRecord[]> {
    const queryVector = await this.embeddingProvider.getEmbedding(query);
    const ranked = this.records
      .map((r) => ({
        record: r,
        score: cosineSimilarity(queryVector, r.vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.record);

    return ranked;
  }

  async clearMemory(filter?: { taskId?: string }): Promise<void> {
    if (!filter?.taskId) {
      this.records = [];
    } else {
      this.records = this.records.filter((r) => r.taskId !== filter.taskId);
    }
  }

  getMemoryScope(): MemoryScope {
    return MemoryScope.Short;
  }
}
