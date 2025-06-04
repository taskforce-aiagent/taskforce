export type LLMToolParameter = {
  type: "object";
  properties: Record<string, LLMToolParameterField>;
  required?: string[];
};

export type LLMToolParameterField = {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  example?: any;
  properties?: Record<string, LLMToolParameterField>; // for nested object support
  items?: LLMToolParameterField; // for array of items
  required?: string[];
};

export type InputSchema = {
  type: "string" | "number" | "object";
  required: boolean;
};

/**
 * Base class for all tools. All tools must inherit from this.
 * Tools are callable by agents and must define input/output schema,
 * robust error handling, caching, and examples for documentation/UI.
 */
export abstract class Tool {
  /** Unique id of the tool (for registry and usage) */
  abstract id: string;
  /** Human-readable name of the tool */
  abstract name: string;
  /** Short description of the tool (displayed in UI and prompt) */
  abstract description: string;
  /** Input schema (for validation, doc, UI) */
  abstract inputSchema: InputSchema;
  /** LLM-optimized function parameter definitions */
  abstract parameters?: LLMToolParameter;
  /**
   * Main tool handler. Must return a string or JSON-serializable result.
   * Must handle input validation and throw on invalid inputs.
   */
  abstract handler(input: any): Promise<string>;
  /** Should results of this tool be cached? */
  cacheable: boolean = true;
  /**
   * Optionally override cache logic. Return true to cache, false to skip.
   * Example: cache only if result.status === "success"
   */
  cacheFunction?(args: Record<string, any>, result: any): boolean;
  /**
   * Custom error handler. Return a string or object, or rethrow to escalate.
   * Example: log and return "API is temporarily unavailable, try later."
   */
  errorHandler?(error: any): any;
  /**
   * At least one example (used for prompt enrichment, auto-documentation, UI display, and testing).
   * Example: ["Summarize the web page at url: https://example.com"]
   */
  examples?: string[];
  /**
   * Optional category or tags for discovery, UI grouping, filtering, etc.
   * Example: "search", "data-processing", "web"
   */
  category?: string;
  /**
   * Optional external source/adapter/platform for cross-platform tool registry
   * Example: "crewai", "langchain", "custom"
   */
  source?: string;
}
