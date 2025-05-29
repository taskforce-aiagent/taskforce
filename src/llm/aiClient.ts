import OpenAI from "openai";
import { aiConfig } from "../configs/aiConfig.js";
import { toAIToolSchema } from "../tools/toolWorker/toolAdapter.js";
import { TFLog } from "../helpers/log.helper.js";
import chalk from "chalk";
import { Tool } from "../tools/base/baseTool.js";
import { ChatCompletionToolMessageParam } from "../configs/enum.js";
import { SupportedModel } from "../configs/enum.js";
import { recordLLMCall } from "../helpers/telemetry.helper.js";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Wraps callAIModel with telemetry recording if TELEMETRY=true.
 */
export async function callAIModel(
  agentName: string,
  modelName: SupportedModel | string,
  messages: ChatMessage[],
  verbose: boolean = false,
  tools?: Tool[]
): Promise<string> {
  if (process.env.TELEMETRY_MODE === "none") {
    return callAIModelFunc(modelName, messages, verbose, tools);
  }

  const startTime = Date.now();
  const result = await callAIModelFunc(modelName, messages, verbose, tools);
  const duration = Date.now() - startTime;

  // Approximate token usage
  const totalTokens = Math.round(JSON.stringify(messages).length / 4);

  recordLLMCall(agentName, totalTokens, duration, modelName);
  return result;
}

async function callAIModelFunc(
  modelName: SupportedModel | string,
  messages: ChatMessage[],
  verbose: boolean = false,
  tools?: Tool[]
): Promise<string> {
  const config = aiConfig[modelName];
  if (!config) throw new Error(`Model '${modelName}' not defined in llmConfig`);

  switch (config.model.provider) {
    case "openai": {
      const openai = new OpenAI({ apiKey: config.apiKey });

      if (config.model.supportsTools && tools?.length) {
        const rawTools = toAIToolSchema(config.model, tools) || [];
        const openAITools = rawTools.map(({ __originalTool__, ...t }) => t);
        const toolMap = rawTools.reduce((acc, t: any) => {
          if (t.function?.name && t.__originalTool__) {
            acc[t.function.name] = t.__originalTool__;
          }
          return acc;
        }, {} as Record<string, Tool>);

        const res = await withRetry(
          () =>
            openai.chat.completions.create({
              model: config.model.name,
              messages,
              temperature: 0.7,
              tools: openAITools,
              tool_choice: "auto",
            }),
          3,
          1000,
          verbose
        );

        const toolCalls = res.choices[0].message.tool_calls;
        let toolResult: ChatCompletionToolMessageParam[] = [];
        if (toolCalls && toolCalls?.length > 0 && toolMap) {
          if (verbose) {
            TFLog(
              `🧠 [LLM] Total ${toolCalls.length} tool call${
                toolCalls.length > 1 ? "s" : ""
              } received.`,
              chalk.yellow
            );
            const names = toolCalls.map((t) => t.function.name).join(", ");
            TFLog(`🧠 [LLM] Tool calls received: ${names}`, chalk.yellow);
          }

          for (const toolCall of toolCalls) {
            const toolName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);

            const selectedTool = toolMap[toolName];
            if (!selectedTool) {
              throw new Error(`Tool not found: ${toolName}`);
            }

            if (verbose) {
              TFLog(
                `🧠 [LLM] Calling Tool: '${
                  toolCall.function.name
                }' ${JSON.stringify(args, null, 2)}`,
                chalk.yellow
              );
            }

            const result = await selectedTool.handler(args);
            if (verbose) {
              TFLog(
                `🧠 [LLM] Tool Result: '${toolCall.function.name}'`,
                chalk.yellow
              );
              TFLog(`Output:\n${result}\n`, chalk.white);
            }

            toolResult.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: result,
            });
          }

          const followUp = await withRetry(
            () =>
              openai.chat.completions.create({
                model: config.model.name,
                messages: [
                  ...messages,
                  {
                    role: "assistant",
                    content: null,
                    tool_calls: [...toolCalls],
                  },
                  ...toolResult,
                ],
                temperature: 0.7,
              }),
            3,
            1000,
            verbose
          );

          return followUp.choices[0].message.content || "";
        }

        return res.choices[0].message.content || "";
      } else {
        const res = await withRetry(
          () =>
            openai.chat.completions.create({
              model: config.model.name,
              messages,
              temperature: 0.7,
            }),
          3,
          1000,
          verbose
        );
        return res.choices[0].message.content || "";
      }
    }

    case "deepseek": {
      const res = await fetch(config.baseUrl!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: 0.7,
        }),
      });
      const json = await res.json();
      return json.choices?.[0]?.message?.content || "";
    }

    case "local": {
      const res = await fetch(config.baseUrl!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model.name,
          messages,
          temperature: 0.7,
        }),
      });

      const json = await res.json();
      return json.choices?.[0]?.message?.content || "";
    }

    default:
      throw new Error(`Unsupported LLM provider: ${config.model.provider}`);
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
  verbose = false
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      if (
        err?.status === 429 ||
        err?.message?.toLowerCase().includes("rate limit")
      ) {
        if (verbose) {
          console.warn(
            `⏳ OpenAI rate limit hit. Retrying in ${delayMs}ms... (attempt ${
              attempt + 1
            })`
          );
        }
        await new Promise((res) => setTimeout(res, delayMs));
        attempt++;
      } else {
        throw err;
      }
    }
  }
  throw new Error("❌ Retry failed after multiple OpenAI 429 errors.");
}
