# 🛠️ What is a Tool?

A **Tool** represents external or internal functions, APIs, or services that an agent can use while performing its tasks. Tools enable agents to access information, perform operations, or interact with external resources.

---

## 🔑 Key Features and Properties

| Property    | Type       | Description                                                                               | Required |
| ----------- | ---------- | ----------------------------------------------------------------------------------------- | -------- |
| id          | `string`   | Unique identifier of the tool.                                                            | ✔️       |
| name        | `string`   | Human-readable name of the tool. Used by the agent when calling the tool.                 | ✔️       |
| description | `string`   | A short description explaining what the tool does.                                        | ✔️       |
| parameters  | `object`   | JSON-schema-like definition of the input parameters, including nested types and examples. |          |
| inputSchema | `object`   | Simple input type guard used for runtime validation (`string`, `number`, or `object`).    | ✔️       |
| handler     | `function` | Main function that executes the tool’s logic using input parameters.                      | ✔️       |
| examples    | `string[]` | (Optional) Example invocations to enrich prompts and documentation.                       |          |
| cacheable   | `boolean`  | Should the result be cached? Defaults to `true`.                                          |          |
| category    | `string`   | (Optional) Used for UI grouping, search filtering.                                        |          |
| source      | `string`   | (Optional) Origin of the tool such as `"langchain"`, `"custom"`, etc.                     |          |

---

## 💡 Conceptual Overview

Tools provide additional functions that agents need to perform their tasks. These can include external API calls, web scraping, database queries, search engine usage, or custom computations. Tools allow agents to interact with the "outside world."

#### Examples include:

- Web scraping
- Database queries
- Vector search
- Financial cleansing
- Calling external APIs
- Performing calculations

Agents invoke tools dynamically using a `TOOL(toolId, { args })` syntax in their prompt instructions.

---

## Usage Example

```typescript
import { Tool, InputSchema, LLMToolParameter } from "taskforce-aiagent";

export class WebScraperTool extends Tool {
  id = "webScraper";
  name = "Web Scraper";
  description = "Fetches content from a given URL with optional headers.";

  inputSchema: InputSchema = { type: "object", required: true };

  parameters: LLMToolParameter = {
    type: "object",
    required: ["url"],
    properties: {
      url: {
        type: "string",
        description: "Target URL to scrape",
        example: "https://example.com",
      },
      headers: {
        type: "object",
        description: "Optional HTTP headers",
        properties: {
          Authorization: {
            type: "string",
            description: "Bearer token or API key",
            example: "Bearer abc123",
          },
        },
        required: [],
      },
    },
  };

  async handler({ url }: { url: string }) {
    const res = await fetch(url);
    return await res.text();
  }
}
```

---

## Property Descriptions

- **name:** The unique name of the tool used in the system and agent prompts.
- **description:** A short explanation of the tool's function.
- **parameters:** The parameters expected by the tool and their descriptions. (e.g., { url: "Web address" })
- **run:** The main function of the tool. Takes parameters and performs the operation.
- **examples:** (Optional) Examples of how to use the tool.

---

## 🧱 Parameter Schema Specification

Each tool may define a full schema describing its input structure. The following features are supported:

### 🔸 Base Types

- `"string"`
- `"number"`
- `"boolean"`
- `"object"`
- `"array"`

### 🔸 Nested Structure

You can nest objects or arrays using:

- `properties` (inside `type: "object"`)
- `items` (inside `type: "array"`)

---

## ⚙️ Tool Usage and Integration

- **Multiple Tools:** Agents can use multiple tools during a task flow.
- **Invocation:** Tools are invoked in prompts using the format:
  `TOOL(toolId, { "param": "value" })`
- **Validation:** Inputs are validated both at runtime (`inputSchema`) and for documentation/UI via `parameters`.

---

## Notes

- Tools extend the capabilities of agents and enable interaction with external resources.
- Each tool must have a unique name.
- Tools can be defined as classes or functions.
  > **Note:** In AI-driven TaskForce workflows, tools can still be assigned to agents, and the system will utilize them as needed based on the generated plan.

---

## ❓ Frequently Asked Questions (FAQ)

**Can an agent use multiple tools?**
Yes. You can assign multiple tools to an agent's `tools` array.

**How are tools invoked in prompts?**
Agents use this format: `TOOL(toolId, { param1, param2 })`.

**Are tool parameters required?**
Each tool defines its own `required` parameters. These are specified in the schema's `required` field.

**What is the difference between `parameters` and `inputSchema`?**

- `parameters` is used for LLM prompt formatting, documentation, and UI generation.
- `inputSchema` is used for basic runtime type validation before executing the tool.

---

### [⬅ Back to README](../../README.md)
