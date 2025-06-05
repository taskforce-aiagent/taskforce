import { SupportedModel, SupportedModelProvider } from "./enum.js";
import fs from "fs";
import { MODELS_PATH } from "../fineTune/fineTuner.js";
import { baseModelTokenLimits } from "../helpers/helper.js";
import dotenv from "dotenv";
dotenv.config();

export type LLMModel = {
  name: string;
  provider: SupportedModelProvider;
  supportsTools: boolean;
  maxContextTokens: number;
};

export interface LLMRoute {
  apiKey?: string;
  baseUrl?: string;
  model: LLMModel;
}

const builtInModels: Record<string, LLMRoute> = {
  "gpt-4o-mini": {
    apiKey: process.env.OPENAI_API_KEY!,
    model: {
      name: "gpt-4o-mini",
      provider: SupportedModelProvider.OPENAI,
      supportsTools: false,
      maxContextTokens: baseModelTokenLimits["gpt-4o-mini"] || 16000,
    },
  },
  "gpt-4o": {
    apiKey: process.env.OPENAI_API_KEY!,
    model: {
      name: "gpt-4o",
      provider: SupportedModelProvider.OPENAI,
      supportsTools: true,
      maxContextTokens: baseModelTokenLimits["gpt-4o"] || 64000,
    },
  },
  "gpt-3.5-turbo": {
    apiKey: process.env.OPENAI_API_KEY!,
    model: {
      name: "gpt-3.5-turbo",
      provider: SupportedModelProvider.OPENAI,
      supportsTools: true,
      maxContextTokens: baseModelTokenLimits["gpt-3.5-turbo"] || 16000,
    },
  },
  "deepseek-chat": {
    apiKey: process.env.DEEPSEEK_API_KEY!,
    baseUrl: "https://api.deepseek.com/v1/chat/completions",
    model: {
      name: "deepseek-chat",
      provider: SupportedModelProvider.DEEPSEEK,
      supportsTools: false,
      maxContextTokens: baseModelTokenLimits["deepseek-chat"] || 16000,
    },
  },
  "claude-3-haiku": {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    baseUrl: "https://api.anthropic.com/v1/messages",
    model: {
      name: "claude-3-haiku",
      provider: SupportedModelProvider.ANTHROPIC,
      supportsTools: false,
      maxContextTokens: baseModelTokenLimits["claude-3-haiku"] || 200000,
    },
  },

  "claude-3-opus": {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    baseUrl: "https://api.anthropic.com/v1/messages",
    model: {
      name: "claude-3-opus",
      provider: SupportedModelProvider.ANTHROPIC,
      supportsTools: false,
      maxContextTokens: baseModelTokenLimits["claude-3-opus"] || 200000,
    },
  },

  "gemini-1.5-pro": {
    apiKey: process.env.GEMINI_API_KEY!,
    model: {
      name: "gemini-1.5-pro",
      provider: SupportedModelProvider.GEMINI,
      supportsTools: false,
      maxContextTokens: baseModelTokenLimits["gemini-1.5-pro"] || 1000000,
    },
  },

  "gemini-1.5-flash": {
    apiKey: process.env.GEMINI_API_KEY!,
    model: {
      name: "gemini-1.5-flash",
      provider: SupportedModelProvider.GEMINI,
      supportsTools: false,
      maxContextTokens: baseModelTokenLimits["gemini-1.5-flash"] || 2000000,
    },
  },
  "local-meta-llama": {
    baseUrl: "http://localhost:1234/v1/chat/completions",
    model: {
      name: "meta-llama-3.1-8b-instruct",
      provider: SupportedModelProvider.LOCAL,
      supportsTools: false,
      maxContextTokens:
        baseModelTokenLimits["meta-llama-3.1-8b-instruct"] || 8192,
    },
  },
  "local-hermes-writer": {
    baseUrl: "http://localhost:1234/v1/chat/completions",
    model: {
      name: "nous-hermes-2-mistral-7b-dpo",
      provider: SupportedModelProvider.LOCAL,
      supportsTools: false,
      maxContextTokens:
        baseModelTokenLimits["nous-hermes-2-mistral-7b-dpo"] || 8192,
    },
  },
};

// Load external fine-tuned models
let externalModels: Record<string, LLMRoute> = {};
const externalPath = MODELS_PATH;

if (fs.existsSync(externalPath)) {
  try {
    const raw = fs.readFileSync(externalPath, "utf-8");
    externalModels = JSON.parse(raw);
  } catch (err) {
    console.warn("⚠️ Failed to load external fine-tuned models:", err);
  }
}

export const aiConfig: Record<string, LLMRoute> = {
  ...builtInModels,
  ...externalModels,
};

export function getLLMModelByName(
  modelName: SupportedModel | string
): LLMRoute["model"] | undefined {
  const route = getLLMRouteByModel(modelName);
  return route?.model;
}

export function getLLMRouteByModel(modelName: string): LLMRoute | undefined {
  return aiConfig[modelName as SupportedModel];
}
