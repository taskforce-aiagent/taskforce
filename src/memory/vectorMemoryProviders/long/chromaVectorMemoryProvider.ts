import { ChromaClient } from "chromadb";
import {
  VectorMemoryProvider,
  VectorMemoryRecord,
} from "../vectorMemoryProvider.js";
import { MemoryScope } from "../../../configs/enum.js";
import { generateMemorySummary } from "../../../helpers/summarize.helper.js";
import dotenv from "dotenv";
import { normalizeInput } from "../../../helpers/helper.js";
dotenv.config();
export class ChromaVectorMemoryProvider implements VectorMemoryProvider {
  private client: ChromaClient;
  private collectionName: string | undefined;

  constructor(collectionName?: string) {
    this.collectionName =
      collectionName && collectionName != ""
        ? collectionName
        : process.env.CHROMA_COLLECTION_NAME ?? "agent_memory";
    this.client = new ChromaClient({ path: process.env.CHROMA_DB_PATH });
  }

  private async getCollection() {
    if (!this.collectionName) {
      throw new Error("Collection name is not defined");
    }
    return await this.client.getOrCreateCollection({
      name: this.collectionName,
    });
  }

  async storeMemory(record: VectorMemoryRecord): Promise<void> {
    const collection = await this.getCollection();
    const summary = await generateMemorySummary(record.output);
    const normalizedInput = normalizeInput(record.input); // Normalize input
    await collection.add({
      ids: [record.taskId],
      documents: [record.output],
      metadatas: [{ ...record.metadata, input: normalizedInput, summary }],
    });
  }

  async loadRelevantMemory(
    query: string,
    limit = 3,
    filter?: { agent?: string; taskId?: string }
  ): Promise<VectorMemoryRecord[]> {
    const collection = await this.getCollection();

    const result = await collection.query({
      queryTexts: [query],
      nResults: limit,
      where: {
        ...(filter?.agent ? { agent: filter.agent } : {}),
        ...(filter?.taskId ? { taskId: filter.taskId } : {}),
      },
    });

    const records: VectorMemoryRecord[] = (result.documents ?? []).map(
      (docGroup: any, i: number) => {
        const raw = result.metadatas?.[i];
        const metadata: Record<string, any> =
          Array.isArray(raw) && raw.length > 0
            ? (raw[0] as Record<string, any>)
            : typeof raw === "object" && raw !== null
            ? (raw as Record<string, any>)
            : {};

        console.log("🧪 [Chroma DEBUG] raw:", raw);

        return {
          taskId: Array.isArray(result.ids?.[i])
            ? String(result.ids[i][0] ?? "")
            : String(result.ids?.[i] ?? ""),
          input: metadata.input ?? query,
          output: Array.isArray(docGroup)
            ? docGroup[0]
            : String(docGroup ?? ""),
          metadata,
          summary: metadata.summary,
        };
      }
    );

    return records;
  }

  async clearMemory(): Promise<void> {
    if (!this.collectionName) {
      throw new Error("Collection name is not defined");
    }
    await this.client.deleteCollection({ name: this.collectionName });
  }

  getMemoryScope(): MemoryScope {
    return MemoryScope.Long;
  }
}
