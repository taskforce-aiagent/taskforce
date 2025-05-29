import chalk from "chalk";
import { FakeEmbeddingProvider } from "./utils/fakeEmbeddingProvider.js";
import { OpenAIEmbeddingProvider } from "./utils/openAIEmbeddingProvider.js";
import { TaskForceVectorMemoryProvider } from "./vectorMemoryProviders/session/taskForceVectorMemoryProvider.js";
import { VectorMemoryProvider } from "./vectorMemoryProviders/vectorMemoryProvider.js";
import { JsonFileVectorMemoryProvider } from "./vectorMemoryProviders/long/jsonFileVectorMemoryProvider.js";
import { EmbeddingProvider } from "./utils/embeddingProvider.js";
import {
  MemoryMode,
  MemoryScope,
  VectorMemoryProviderType,
} from "../configs/enum.js";
import { TFLog } from "../helpers/log.helper.js";
import { LangChainVectorMemoryProvider } from "./vectorMemoryProviders/session/langChainVectorMemoryProvider.js";
import { ChromaVectorMemoryProvider } from "./vectorMemoryProviders/long/chromaVectorMemoryProvider.js";
import dotenv from "dotenv";
import { HuggingFaceEmbeddingProvider } from "./utils/huggingFaceEmbeddingProvider.js";
dotenv.config();
export function getEmbeddingProvider(): EmbeddingProvider {
  const providerType = process.env.DEFAULT_EMBEDDING?.toLowerCase();

  if (process.env.VERBOSE === "true") {
    TFLog(
      `🧠 Using ${
        providerType || "fake"
      }EmbeddingProvider with TaskForceVectorMemoryProvider`,
      chalk.cyanBright
    );
  }
  switch (providerType) {
    case "openai":
      return new OpenAIEmbeddingProvider();
    case "huggingface":
      return new HuggingFaceEmbeddingProvider(process.env.HF_EMBEDDING_URL);
    default:
      return new FakeEmbeddingProvider();
  }
}

export function useTaskForceShortVectorMemoryProvider(): VectorMemoryProvider {
  return new TaskForceVectorMemoryProvider(getEmbeddingProvider());
}

export function useTaskForceLongVectorMemoryProvider(
  mode: MemoryMode = MemoryMode.Same
): (agentName?: string) => JsonFileVectorMemoryProvider {
  if (mode === MemoryMode.Seperated) {
    return (agentName?: string) =>
      agentName
        ? new JsonFileVectorMemoryProvider(
            getEmbeddingProvider(),
            `taskforce-db/memory_${agentName}.json`
          )
        : new JsonFileVectorMemoryProvider(getEmbeddingProvider());
  } else {
    const shared = new JsonFileVectorMemoryProvider(getEmbeddingProvider());
    return () => shared;
  }
}

export function useTaskForceVectorMemoryProvider(
  agentName?: string,
  scope: MemoryScope = MemoryScope.Short,
  mode: MemoryMode = MemoryMode.Same
): VectorMemoryProvider | undefined {
  if (scope === MemoryScope.None) return undefined;
  if (scope === MemoryScope.Short)
    return useTaskForceShortVectorMemoryProvider();
  if (scope === MemoryScope.Long) {
    return useTaskForceLongVectorMemoryProvider(mode)(agentName);
  }
}

export function MemoryProvider(
  agentName?: string,
  scope: MemoryScope = MemoryScope.None,
  mode: MemoryMode = MemoryMode.Same,
  type: VectorMemoryProviderType = VectorMemoryProviderType.Local
): VectorMemoryProvider | undefined {
  if (scope === MemoryScope.None) return undefined;
  if (scope === MemoryScope.Short) {
    switch (type) {
      case VectorMemoryProviderType.LangChain:
        return new LangChainVectorMemoryProvider();
      case VectorMemoryProviderType.Local:
        return useTaskForceShortVectorMemoryProvider();
      default:
        return undefined;
    }
  }
  if (scope === MemoryScope.Long) {
    switch (type) {
      case VectorMemoryProviderType.Local:
        return useTaskForceVectorMemoryProvider(agentName, scope, mode);
      case VectorMemoryProviderType.Chroma:
        return agentName
          ? new ChromaVectorMemoryProvider(agentName)
          : new ChromaVectorMemoryProvider();
      default:
        return undefined;
    }
  }
}
