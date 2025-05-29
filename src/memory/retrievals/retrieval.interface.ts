import { VectorMemoryRecord } from "../vectorMemoryProviders/vectorMemoryProvider.js";

export interface Retriever {
  retrieve(
    query: string,
    options?: any
  ): Promise<string[] | VectorMemoryRecord[]>;
}
