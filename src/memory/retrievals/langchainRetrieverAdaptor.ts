import { Retriever } from "./retrieval.interface.js";
import { BaseRetriever } from "@langchain/core/retrievers";

export class LangChainRetrieverAdapter implements Retriever {
  constructor(private langChainRetriever: BaseRetriever) {}
  async retrieve(query: string): Promise<string[]> {
    const docs = await this.langChainRetriever._getRelevantDocuments(query);
    return docs.map((doc) => doc.pageContent);
  }
}
