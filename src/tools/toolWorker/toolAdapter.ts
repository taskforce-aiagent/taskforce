import { ChatCompletionTool } from "../../configs/enum.js";
import { LLMModel } from "../../configs/aiConfig.js";
import { Tool } from "../../index.js";

export function toAIToolSchema(
  model: LLMModel,
  tools: Tool[]
): any[] | undefined {
  switch (model.provider) {
    case "openai":
      return toOpenAIToolSchemaWithBinding(tools);

    default:
      break;
  }
}

function toOpenAIToolSchemaWithBinding(
  tools: Tool[]
): (ChatCompletionTool & { __originalTool__: Tool })[] {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.id,
      description: tool.description,
      parameters: tool.parameters || {
        type: "object",
        properties: {},
      },
    },
    __originalTool__: tool,
  }));
}
