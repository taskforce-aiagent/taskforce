import { TaskForce } from "../../engine/taskForce.js";
import { getToolCache } from "../../helpers/lru.helper.js";
import { LLMToolParameterField, Tool } from "../base/baseTool.js";
import dotenv from "dotenv";
dotenv.config();
export class ToolExecutor {
  private cache = getToolCache();

  constructor(
    private tools: Tool[],
    private taskForce?: TaskForce,
    private agentName?: string
  ) {}

  public setTaskForce(taskForce: TaskForce): void {
    this.taskForce = taskForce;
  }

  getTools(): Tool[] {
    return this.tools;
  }

  getToolNameById(toolId: string): string | undefined {
    return this.tools.find((t) => t.id === toolId)?.name || toolId;
  }

  buildToolUsageExamples(tools: Tool[]): string {
    return tools
      .map((tool) => {
        const paramDescriptions = this.buildDetailedParameterBlock(tool);
        const example = this.buildExampleUsage(tool);
        return `- ${tool.id}\n - Purpose: ${tool.description}\n${paramDescriptions}\n - Example ${tool.name} Usage:\n${example}`;
      })
      .join("\n\n");
  }

  private buildDetailedParameterBlock(tool: Tool): string {
    if (!tool.parameters?.properties) return "";

    const topLevelRequired = tool.parameters.required ?? [];

    const plural =
      Object.keys(tool.parameters.properties).length > 1
        ? "Parameters"
        : "Parameter";

    const renderField = (
      key: string,
      def: LLMToolParameterField,
      indent: number = 2,
      parentRequired: string[] = []
    ): string => {
      const pad = " ".repeat(indent);
      const isRequired = parentRequired.includes(key);
      let line = `${pad}- ${key} (${def.type})${
        isRequired ? " [required]" : ""
      }`;
      if (def.description) line += `: ${def.description}`;

      if (def.type === "object" && def.properties) {
        const nestedRequired = def.required ?? [];
        const nested = Object.entries(def.properties)
          .map(([k, v]) => renderField(k, v, indent + 2, nestedRequired))
          .join("\n");
        line += `\n${nested}`;
      } else if (def.type === "array" && def.items) {
        line += `\n${pad}  items:`;
        line += `\n${renderField(
          "item",
          def.items,
          indent + 4,
          def.items.required ?? []
        )}`;
      }

      return line;
    };

    const lines = Object.entries(tool.parameters.properties).map(([k, v]) =>
      renderField(k, v, 2, topLevelRequired)
    );

    return ` - ${plural}:\n${lines.join("\n")}`;
  }

  private buildExampleUsage(tool: Tool): string {
    if (!tool.parameters || !tool.parameters.properties)
      return `TOOL(${tool.id}, {})`;

    const args: Record<string, any> = {};
    for (const [key, def] of Object.entries(tool.parameters.properties)) {
      if (def.example !== undefined) {
        args[key] = def.example;
      } else {
        switch (def.type) {
          case "string":
            args[key] = "example";
            break;
          case "number":
            args[key] = 0;
            break;
          case "boolean":
            args[key] = false;
            break;
          default:
            args[key] = "value";
        }
      }
    }

    return `TOOL(${tool.id}, ${JSON.stringify(args)})`;
  }

  isValidInput(input: any, schema: Tool["inputSchema"]): boolean {
    if (!schema.required) return true;

    switch (schema.type) {
      case "string":
        return typeof input === "string";
      case "number":
        return typeof input === "number" && !isNaN(input);
      case "object":
        return (
          typeof input === "object" && input !== null && !Array.isArray(input)
        );
      default:
        return false;
    }
  }
  async executeToolById(toolId: string, args: any): Promise<string> {
    const tool = this.tools.find((t) => t.id === toolId);
    if (!tool) return `⚠️ Tool '${toolId}' not found.`;

    if (!this.isValidInput(args, tool.inputSchema)) {
      return `⚠️ Invalid input for tool '${toolId}': expected ${tool.inputSchema.type}`;
    }
    const cacheKey = `${toolId}::${JSON.stringify(args)}`;
    if (tool.cacheable) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return `🧠 (tool cached) ${cached}`;
      }
    }

    try {
      const result = await tool.handler(args);
      // Optional caching
      if (tool.cacheable) {
        const shouldCache = tool.cacheFunction
          ? tool.cacheFunction(args, result)
          : true;
        if (shouldCache) {
          this.cache.set(cacheKey, result);
        }
      }

      const emitting = process.env.EMITTING;

      if (emitting === "true") {
        this.taskForce?.emitStep({
          action: "tool_executed",
          agent: this.agentName,
          tool: tool.id,
          toolPayload: args,
          result,
        });
      }

      return result;
    } catch (err: any) {
      if (typeof tool.errorHandler === "function") {
        return tool.errorHandler(err);
      }
      return `❌ Tool '${toolId}' execution error: ${err.message}`;
    }
  }
}
