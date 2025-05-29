import { SupportedModel } from "../configs/enum.js";
import { ChatMessage } from "../llm/aiClient.js";
import { callOpenAIFunction } from "./systemAi.helper.js";

import dotenv from "dotenv";
dotenv.config();

/**
 * Summarizes a single long output string for memory storage.
 */
export async function generateMemorySummary(output: string): Promise<string> {
  if (!output.trim()) return "";

  const model =
    process.env.DEFAULT_AI_SUMMARY_MODEL || SupportedModel.GPT_4O_MINI;

  const summary = await callOpenAIFunction({
    model,
    system:
      "Summarize the following output. Keep the task context intact. Write concisely and clearly, focusing on actionable insights. Do not omit any risk or strategy-related details.",
    user: output,
  });

  return summary;
}

/**
 * Summarizes previous ChatMessage[] context.
 */
export async function summarizeOldMessages(
  messages: ChatMessage[]
): Promise<ChatMessage> {
  const model =
    process.env.DEFAULT_AI_SUMMARY_MODEL || SupportedModel.GPT_4O_MINI;

  const content = await callOpenAIFunction({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a memory summarizer AI. The following conversation history may be too long to fit in future prompts. Please summarize the key facts, user intentions, tool calls, decisions, or conclusions from context. Be concise, and retain all relevant context that would help the assistant continue the session.",
      },
      ...messages,
    ],
  });

  return {
    role: "system",
    content: `📘 Context Summary (from old history):\n${content}`,
  };
}
