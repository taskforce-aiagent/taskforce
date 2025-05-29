import {
  VectorMemoryProvider,
  VectorMemoryRecord,
} from "../vectorMemoryProvider.js";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "langchain/document";
import { MemoryScope } from "../../../configs/enum.js";

export class LangChainVectorMemoryProvider implements VectorMemoryProvider {
  private vectorStore: MemoryVectorStore;
  private records: VectorMemoryRecord[] = [];

  constructor() {
    this.vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
  }

  async storeMemory(record: VectorMemoryRecord): Promise<void> {
    const isDuplicate = this.records.some(
      (r) => r.output === record.output && r.taskId === record.taskId
    );

    if (isDuplicate) return;
    const doc = new Document({
      pageContent: record.output,
      metadata: {
        taskId: record.taskId,
        input: record.input,
        ...record.metadata,
      },
    });
    await this.vectorStore.addDocuments([doc]);
    this.records.push(record);
  }

  async loadRelevantMemory(
    query: string,
    limit = 3,
    filter?: { agent?: string; taskId?: string }
  ): Promise<VectorMemoryRecord[]> {
    const results = await this.vectorStore.similaritySearch(query, limit);

    return results
      .map((res) => ({
        taskId: res.metadata.taskId,
        input: res.metadata.input,
        output: res.pageContent,
        metadata: res.metadata,
      }))
      .filter(
        (r) =>
          (!filter?.agent || r.metadata?.agent === filter.agent) &&
          (!filter?.taskId || r.taskId === filter.taskId)
      );
  }

  async clearMemory(): Promise<void> {
    this.vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
    this.records = [];
  }

  getMemoryScope(): MemoryScope {
    return MemoryScope.Short;
  }
}
