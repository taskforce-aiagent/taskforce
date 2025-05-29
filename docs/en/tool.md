# What is a Tool?

A Tool represents external or internal functions, APIs, or services that an agent can use while performing its tasks. Tools enable agents to access information, perform operations, or interact with external resources.

---

## Key Features and Properties

| Property    | Type       | Description                                                        | Required |
| ----------- | ---------- | ------------------------------------------------------------------ | -------- |
| name        | `string`   | The name of the tool. Used by the agent when calling the tool.     | ✔️       |
| description | `string`   | A short description explaining what the tool does.                 | ✔️       |
| parameters  | `object`   | The parameters expected by the tool and their descriptions.        |          |
| run         | `function` | The main function of the tool. Executes the operation when called. | ✔️       |
| examples    | `string[]` | (Optional) Examples of how to use the tool.                        |          |

---

## Conceptual Overview

Tools provide additional functions that agents need to perform their tasks. These can include external API calls, web scraping, database queries, search engine usage, or custom computations. Tools allow agents to interact with the "outside world."

---

## Usage Example

```typescript
import { Tool } from "../tools/base/baseTool";

export class WebScrapeTool extends Tool {
  name = "WebScrapeTool";
  description = "Fetches content from the specified URL.";
  parameters = { url: "The web address to fetch content from" };

  async run({ url }: { url: string }) {
    // Web scraping logic goes here
    return await fetchAndExtractContent(url);
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

## Advanced: Tool Usage and Integration

- **Multiple Tools:** An agent can use multiple tools. Add them to the tools array.
- **Tool Invocation:** The agent calls the tool when needed during a task. Tools are used in the prompt as TOOL(toolName, { param }).
- **Tool Registry:** Tools are automatically registered in the system and can be shared among agents.
- **Parameter Validation:** Tools can validate the correctness and completeness of parameters.

---

## Notes

- Tools extend the capabilities of agents and enable interaction with external resources.
- Each tool must have a unique name.
- Tools can be defined as classes or functions.
  > **Note:** In AI-driven TaskForce workflows, tools can still be assigned to agents, and the system will utilize them as needed based on the generated plan.

---

## Frequently Asked Questions (FAQ)

**Can an agent use multiple tools?**

> Yes, you can add multiple tools to the tools array.

**How are tools invoked?**

> The agent calls the tool during a task using the format TOOL(toolName, { param }).

**Are tool parameters required?**

> Parameters may be required or optional depending on the tool's function. They are specified in the parameters property.

---

### [⬅ Back to README](../../README.md)
