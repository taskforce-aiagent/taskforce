import OpenAI from "openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from "../configs/enum.js";
import { recordLLMCall } from "./telemetry.helper.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Unified call for OpenAI chat model with optional structured message input.
 */
export async function callOpenAIFunction({
  model,
  messages,
  system,
  user,
  temperature = 0.3,
}: {
  model: string;
  messages?: ChatCompletionMessageParam[];
  system?: string;
  user?: string;
  temperature?: number;
}): Promise<string> {
  const finalMessages: ChatCompletionMessageParam[] = messages ?? [
    {
      role: "system",
      content: system || "",
    } as ChatCompletionSystemMessageParam,
    {
      role: "user",
      content: user || "",
    } as ChatCompletionUserMessageParam,
  ];

  const startTime = Date.now();
  const res = await openai.chat.completions.create({
    model,
    messages: finalMessages,
    temperature,
  });
  const duration = Date.now() - startTime;

  if (process.env.TELEMETRY_MODE === "none") {
    return res.choices[0].message.content?.trim() || "N/A";
  }

  // Approximate token usage
  const totalTokens = Math.round(JSON.stringify(finalMessages).length / 4);
  recordLLMCall("system", totalTokens, duration, model);

  return res.choices[0].message.content?.trim() || "N/A";
}
