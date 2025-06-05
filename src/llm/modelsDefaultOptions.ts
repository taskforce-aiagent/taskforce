import { SupportedModel } from "../configs/enum.js";
import { GenerationOptions } from "../llm/aiClient.js";

export const modelGenerationDefaults: Record<
  SupportedModel | string,
  GenerationOptions
> = {
  [SupportedModel.GPT_4O_MINI]: {
    temperature: 0.7,
    top_p: 1,
    max_tokens: 2048,
    presence_penalty: 0,
    frequency_penalty: 0,
  },
  [SupportedModel.GPT_4O]: {
    temperature: 0.7,
    top_p: 1,
    max_tokens: 4096,
    presence_penalty: 0,
    frequency_penalty: 0,
  },
  [SupportedModel.GPT_3_5_TURBO]: {
    temperature: 0.7,
    top_p: 1,
    max_tokens: 2048,
    presence_penalty: 0,
    frequency_penalty: 0,
  },
  [SupportedModel.DEEPSEEK_CHAT]: {
    temperature: 0.7,
    top_p: 1,
    max_tokens: 2048,
  },
  [SupportedModel.CLAUDE_3_SONNET]: {
    temperature: 0.5,
    top_p: 1,
    max_tokens: 4096,
  },
  [SupportedModel.GEMINI_1_5_PRO]: {
    temperature: 0.8,
    max_tokens: 2048,
  },
  [SupportedModel.GEMINI_1_5_FLASH]: {
    temperature: 0.7,
    max_tokens: 2048,
  },
  [SupportedModel.LOCAL_META_LLAMA]: {
    temperature: 0.7,
    top_p: 1,
    max_tokens: 2048,
  },
  [SupportedModel.LOCAL_HERMES_WRITER]: {
    temperature: 0.75,
    top_p: 0.95,
    max_tokens: 2048,
  },
  [SupportedModel.MIXTRAL_8X7B]: {
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 2048,
  },
};
