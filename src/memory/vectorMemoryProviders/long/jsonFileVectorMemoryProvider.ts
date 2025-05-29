import fs from "fs";
import path from "path";
import { cosineSimilarity } from "../../utils/embedding.js";
import { EmbeddingProvider } from "../../utils/embeddingProvider.js";
import {
  VectorMemoryRecord,
  VectorMemoryProvider,
} from "../vectorMemoryProvider.js";
import { TFLog } from "../../../helpers/log.helper.js";
import chalk from "chalk";
import { MemoryScope } from "../../../configs/enum.js";
import { generateMemorySummary } from "../../../helpers/summarize.helper.js";
import dotenv from "dotenv";
import { normalizeInput } from "../../../helpers/helper.js";
dotenv.config();
type VectorizedRecord = VectorMemoryRecord & { vector: number[] };
export class JsonFileVectorMemoryProvider implements VectorMemoryProvider {
  private dbPath: string;
  private embeddingProvider: EmbeddingProvider;
  private records: VectorizedRecord[] = [];

  constructor(embeddingProvider: EmbeddingProvider, dbPath?: string) {
    this.embeddingProvider = embeddingProvider;
    this.dbPath = path.resolve(
      dbPath ?? process.env.VECTOR_MEMORY_DB_PATH ?? "taskforce-db/memory.json"
    );
    this.loadFromFile();
  }

  private loadFromFile() {
    if (fs.existsSync(this.dbPath)) {
      const raw = fs.readFileSync(this.dbPath, "utf-8");
      this.records = JSON.parse(raw);
    }
  }

  private saveToFile() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
      this.dbPath,
      JSON.stringify(this.records, null, 2),
      "utf-8"
    );
  }

  async storeMemory(record: VectorMemoryRecord): Promise<void> {
    this.loadFromFile();
    const vector = await this.embeddingProvider.getEmbedding(record.output);
    const normalizedInput = normalizeInput(record.input);

    TFLog(
      `🧠 [MemoryStore] task=${record.taskId}, agent=${
        record.metadata?.agent
      }, outputHash=${record.output.slice(
        0,
        20
      )}, inputPreview=${normalizedInput.slice(0, 50)}`,
      chalk.cyan
    );

    const isDuplicate = this.records.some((r) => {
      const similarity = cosineSimilarity(vector, r.vector);
      return (
        r.taskId === record.taskId &&
        r.metadata?.agent === record.metadata?.agent &&
        similarity > 0.95
      );
    });

    if (isDuplicate) return;
    const summary = await generateMemorySummary(record.output);
    const embedded: VectorizedRecord = {
      ...record,
      input: normalizedInput,
      summary,
      vector,
    };
    this.records.push(embedded);
    this.saveToFile();
  }

  async loadRelevantMemory(
    query: string,
    limit = 3
  ): Promise<VectorMemoryRecord[]> {
    const queryVec = await this.embeddingProvider.getEmbedding(query);

    const filteredRecords = this.records.filter(
      (r) => r.metadata?.agent && r.taskId
    );

    return filteredRecords
      .map((r) => ({
        score: cosineSimilarity(queryVec, r.vector),
        record: r,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.record);
  }

  async clearMemory(filter?: { taskId?: string }): Promise<void> {
    if (!filter?.taskId) {
      this.records = [];
    } else {
      this.records = this.records.filter((r) => r.taskId !== filter.taskId);
    }
    this.saveToFile();
  }

  getMemoryScope(): MemoryScope {
    return MemoryScope.Long;
  }
}
