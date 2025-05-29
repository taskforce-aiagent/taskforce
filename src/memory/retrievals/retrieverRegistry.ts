import { LocalVectorRetriever } from "./localVectorRetriever.js";
import { JsonFileVectorMemoryProvider } from "../vectorMemoryProviders/long/jsonFileVectorMemoryProvider.js";
import { TaskForceVectorMemoryProvider } from "../vectorMemoryProviders/session/taskForceVectorMemoryProvider.js";
import { getEmbeddingProvider } from "../memoryFactory.js";
import { Retriever } from "./retrieval.interface.js";

function getDefaultProvider() {
  return new JsonFileVectorMemoryProvider(getEmbeddingProvider());
}

const retrieverRegistry: Record<string, () => Retriever> = {
  local: () => new LocalVectorRetriever(getDefaultProvider()),

  taskforce: () =>
    new LocalVectorRetriever(
      new TaskForceVectorMemoryProvider(getEmbeddingProvider())
    ),

  default: () => new LocalVectorRetriever(getDefaultProvider()),
};

export function getRetrieverByName(name?: string): Retriever {
  if (name && retrieverRegistry[name]) {
    return retrieverRegistry[name]();
  }
  return retrieverRegistry["default"]();
}
