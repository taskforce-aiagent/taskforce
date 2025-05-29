import { MemoryScope } from "../../configs/enum.js";

export interface VectorMemoryRecord {
  taskId: string;
  input: string;
  output: string;
  metadata?: Record<string, any>;
  timestamp?: number;
  summary?: string;
}

export interface VectorMemoryProvider {
  storeMemory(record: VectorMemoryRecord): Promise<void>;
  loadRelevantMemory(
    query: string,
    limit?: number,
    filter?: { agent?: string; taskId?: string }
  ): Promise<VectorMemoryRecord[]>;
  clearMemory?(filter?: { taskId?: string }): Promise<void>;
  getMemoryScope(): MemoryScope;
}
