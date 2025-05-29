import chalk from "chalk";
import { TFLog } from "../../helpers/log.helper.js";
import { Retriever } from "./retrieval.interface.js";
import {
  VectorMemoryProvider,
  VectorMemoryRecord,
} from "../vectorMemoryProviders/vectorMemoryProvider.js";
import { SupportedModel } from "../../configs/enum.js";
import { callOpenAIFunction } from "../../helpers/systemAi.helper.js";

export async function retrieveAndEnrichPrompt(
  query: string,
  retriever?: Retriever,
  memoryProvider?: VectorMemoryProvider,
  modelName?: SupportedModel | string,
  verbose = false,
  contextFilter?: { agent?: string; taskId?: string }
): Promise<string> {
  let records: VectorMemoryRecord[] = [];

  if (retriever) {
    const raw = await retriever.retrieve(query);

    if (Array.isArray(raw)) {
      if (raw.length === 0) {
        records = [];
      } else if (typeof raw[0] === "string") {
        records = (raw as string[]).map((s) => ({
          output: s,
          summary: s,
          taskId: "retriever",
          input: "",
          metadata: {},
        }));
      } else if (
        typeof raw[0] === "object" &&
        raw[0] !== null &&
        "output" in raw[0]
      ) {
        records = raw as VectorMemoryRecord[];
      } else {
        // Hiçbiri değilse
        records = [];
      }
    }
  } else if (memoryProvider) {
    records = await memoryProvider.loadRelevantMemory(query, 3, contextFilter);
  }

  const validRecords = records.filter(
    (r) => r.summary?.trim() || r.output?.trim()
  );

  if (validRecords.length === 0) return "";

  const texts = validRecords.map(
    (r) => r.summary?.trim() ?? r.output?.trim() ?? ""
  );

  const fullText = texts.join("\n\n");
  if (fullText.length < 1000) {
    if (verbose) TFLog("[Retriever] Injecting full memory text", chalk.yellow);
    return fullText;
  } else {
    if (verbose)
      TFLog("[Retriever] Summarizing memory text due to length", chalk.yellow);

    const summary = await callOpenAIFunction({
      model: modelName || process.env.DEFAULT_AI_MODEL!,
      system:
        "Please provide a concise, focused summary of the following text, preserving all important details relevant to the task. Do not omit critical information.",
      user: fullText,
      temperature: 0.3,
    });

    return summary;
  }
}

export async function conversationalRetrievalChain(
  query: string,
  retriever: Retriever,
  modelName: SupportedModel | string,
  chatHistory: string[] = [],
  verbose = false
): Promise<string> {
  const docs = await retriever.retrieve(query);
  const context = docs.join("\n\n");

  let prompt = "";
  if (context.length > 0) {
    prompt += `Related knowledge:\n${context}\n\n`;
  }
  if (chatHistory.length > 0) {
    prompt += `Chat history:\n${chatHistory.join("\n")}\n\n`;
  }
  prompt += `Question: ${query}`;

  if (verbose)
    TFLog("[ConversationalRetrievalChain] Prompt:\n" + prompt, chalk.blue);

  // LLM çağrısı
  const response = await callOpenAIFunction({
    model: modelName,
    system: "You are a helpful assistant with access to relevant knowledge.",
    user: prompt,
    temperature: 0.3,
  });

  return response;
}
