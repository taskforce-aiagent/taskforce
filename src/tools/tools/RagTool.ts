import { getRetrieverByName } from "../../memory/retrievals/retrieverRegistry.js";
import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";

export class RagTool extends Tool {
  id = "rag_tool";
  name = "RAG Tool";
  description = "Semantic search via retriever (Chroma, Pinecone, etc).";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Semantic search query.",
        example: "What is vector memory?",
      },
      retriever: {
        type: "string",
        description: "Retriever name/id (optional, default: system default).",
        example: "default",
      },
      topK: {
        type: "number",
        description: "Number of results (optional).",
        example: "3",
      },
    },
    required: ["query"],
  };
  examples = ["Semantic search for 'agent memory' using default retriever."];

  async handler(args: { query: string; retriever?: string; topK?: number }) {
    try {
      const retriever = getRetrieverByName(args.retriever);
      const results = await retriever.retrieve(args.query, {
        limit: args.topK || 3,
      });
      return JSON.stringify(results, null, 2);
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error in RAG search: ${err.message}`;
    }
  }
}
