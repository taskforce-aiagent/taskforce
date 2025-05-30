import { Tool } from "./baseTool.js";

export const ToolCategories = [
  "search",
  "rag",
  "file",
  "api",
  "external",
  "vision",
  "langchain",
  "custom",
] as const;
export type ToolCategory = (typeof ToolCategories)[number] | string;

export interface RegisteredTool {
  id: string;
  name: string;
  instance: Tool;
  category?: ToolCategory;
  source?: string; // (örn. "built-in", "langchain", "crewai", "custom", "enterprise")
}

const toolMap = new Map<string, RegisteredTool>();

export class ToolRegistry {
  /**
   * Register a tool in the global registry.
   * If a tool with the same id or name exists, return.
   */
  static register(
    toolInstance: Tool,
    category?: ToolCategory,
    source: string = "built-in"
  ) {
    if (toolMap.has(toolInstance.id) || toolMap.has(toolInstance.name)) {
      return;
    }
    toolMap.set(toolInstance.id, {
      id: toolInstance.id,
      name: toolInstance.name,
      instance: toolInstance,
      category: category || toolInstance.category,
      source: source || toolInstance.source,
    });
    // (Optional) Also register by name for backward compatibility
    toolMap.set(toolInstance.name, {
      id: toolInstance.id,
      name: toolInstance.name,
      instance: toolInstance,
      category: category || toolInstance.category,
      source: source || toolInstance.source,
    });
  }

  /** Remove a tool by id or name. */
  static unregister(key: string) {
    toolMap.delete(key);
  }

  /**
   * Get all registered tools, with optional filtering by category or source.
   */
  static getAll(filter?: {
    category?: ToolCategory;
    source?: string;
  }): RegisteredTool[] {
    let tools = Array.from(toolMap.values()).filter(
      (t, i, arr) => arr.findIndex((other) => other.id === t.id) === i // Unique by id
    );
    if (filter?.category) {
      tools = tools.filter((tool) => tool.category === filter.category);
    }
    if (filter?.source) {
      tools = tools.filter((tool) => tool.source === filter.source);
    }
    return tools;
  }

  /** Get a tool by id or name. */
  static getByKey(key: string): RegisteredTool | undefined {
    return toolMap.get(key);
  }

  /** Reload/replace a tool (for hot reloading, development, or plugin updates). */
  static update(toolInstance: Tool, category?: ToolCategory, source?: string) {
    toolMap.set(toolInstance.id, {
      id: toolInstance.id,
      name: toolInstance.name,
      instance: toolInstance,
      category: category || toolInstance.category,
      source: source || toolInstance.source,
    });
    toolMap.set(toolInstance.name, {
      id: toolInstance.id,
      name: toolInstance.name,
      instance: toolInstance,
      category: category || toolInstance.category,
      source: source || toolInstance.source,
    });
  }

  /** For external tool adapters (LangChain, CrewAI etc), mass-register tools in batch. */
  static registerBatch(
    tools: Tool[],
    category?: ToolCategory,
    source: string = "external"
  ) {
    for (const tool of tools) {
      this.register(tool, category, source);
    }
  }

  /** For auto-discovery/documentation/UI. */
  static listToolSummaries(): any[] {
    return this.getAll().map(({ id, name, instance, category, source }) => ({
      id,
      name,
      description: instance.description,
      examples: instance.examples,
      parameters: instance.parameters,
      inputSchema: instance.inputSchema,
      category: category || instance.category,
      source: source || instance.source,
      cacheable: instance.cacheable,
    }));
  }
}
