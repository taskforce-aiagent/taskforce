# What is an Agent?

An Agent is an AI unit with a specific role and goal, capable of performing tasks, using tools and memory when needed, and delegating work to other agents if necessary.

---

## Key Features and Properties

| Property            | Type                                             | Description                                                                                               | Required |
| ------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | -------- |
| name                | `string`                                         | The agent's name. Used as a key in the system and for delegation.                                         | ✔️       |
| role                | `string`                                         | The agent's role (e.g., "Content Planner", "Editor").                                                     | ✔️       |
| goal                | `string`                                         | The agent's main goal or objective. Used in prompts.                                                      | ✔️       |
| backstory           | `string`                                         | The agent's background or character. Adds context to prompts.                                             | ✔️       |
| model               | `SupportedModel \| string`                       | The LLM model to use (e.g., GPT-4, GPT-3.5, custom).                                                      |          |
| modelOptions        | `GenerationOptions`                              | Generation settings like temperature, max_tokens, etc. Can override defaults per model or agent.          |          |
| tools               | `Tool[] \| (() => Tool)[] \| (new () => Tool)[]` | Tools the agent can use. Can be provided as functions, classes, or instances.                             |          |
| guardrails          | `string[]`                                       | Rules or constraints the agent must follow.                                                               |          |
| memoryScope         | `MemoryScope`                                    | Memory scope: None, Short, Long, Session, etc.                                                            |          |
| memoryProvider      | `VectorMemoryProvider`                           | The agent's memory provider (vector DB, local, Chroma, Pinecone, etc.).                                   |          |
| systemPrompt        | `string`                                         | Custom system prompt for the agent. Used at the start of prompts.                                         |          |
| allowDelegation     | `boolean`                                        | Whether the agent can delegate tasks to other agents.                                                     |          |
| retriever           | `Retriever`                                      | Retrieval object for accessing external knowledge sources.                                                |          |
| trained             | `AgentTrainingResult`                            | Information loaded from fine-tuning or custom training.                                                   |          |
| taskForce           | `TaskForce`                                      | Reference to the TaskForce the agent belongs to (optional, usually set automatically).                    |          |
| autoTruncateHistory | `boolean`                                        | If true, automatically truncates message history to fit within the model's token limit. Default is false. |          |

---

## Generation Options Compatibility

The `GenerationOptions` object allows you to customize the behavior of the LLM for each agent. However, not all models support all options. Below is a compatibility matrix:

| Option               | Description                                               | Supported Models                                       |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| `temperature`        | Controls randomness. Lower is more deterministic.         | ✅ All models                                          |
| `top_p`              | Nucleus sampling. Limits the token selection probability. | ✅ Most OpenAI models, Claude, Gemini Pro/Flash        |
| `max_tokens`         | Limits the number of output tokens.                       | ✅ All models                                          |
| `frequency_penalty`  | Reduces repetition of frequent tokens.                    | ✅ OpenAI models                                       |
| `presence_penalty`   | Encourages introducing new tokens.                        | ✅ OpenAI models                                       |
| `stop`               | Specifies stop sequences for early cutoff.                | ✅ All models except Claude (currently ignores `stop`) |
| `repetition_penalty` | Penalizes repeated phrases.                               | ✅ DeepSeek, LLaMA, Mixtral, open models               |
| `top_k`              | Token sampling from top-k probabilities.                  | ✅ Local models like Meta LLaMA, Mixtral               |

### Supported Models Summary

| Model                 | Notes                                                                                |
| --------------------- | ------------------------------------------------------------------------------------ |
| `gpt-4o`, `gpt-3.5`   | Fully supports all `GenerationOptions`                                               |
| `claude-3-sonnet`     | Supports `temperature`, `top_p`, but ignores `stop`, `presence_penalty`, etc.        |
| `claude-3-haiku`      | Same as above; lightweight version, slightly faster                                  |
| `gemini-1.5-pro`      | Supports `temperature`, `top_p`, `max_tokens`; some fine control may be undocumented |
| `gemini-1.5-flash`    | Same as above; faster, cheaper                                                       |
| `deepseek-chat`       | Supports `temperature`, `top_p`, `top_k`, `repetition_penalty`                       |
| `mixtral-8x7b`        | Best used with `top_k`, `repetition_penalty`, `temperature`                          |
| `local-meta-llama`    | Same as above                                                                        |
| `local-hermes-writer` | Supports `temperature`, `top_k`, `repetition_penalty`                                |

> ⚠️ Unsupported options are silently ignored by most APIs. For full control, prefer OpenAI or Claude models.

---

## Conceptual Overview

An agent is an AI unit configured to perform a task, with its own role, goal, memory, and tools. Each agent is uniquely identified in the system and can be associated with one or more tasks. Agents can delegate work to other agents and retrieve information from past outputs or external sources when needed. In AI-driven TaskForce workflows (executionMode: AiDriven), agents are dynamically assigned to tasks generated by the system, based on their role, goal, and suitability. You only need to provide agents; task assignment and planning are handled automatically.

---

## Usage Example

```typescript
import { Agent } from "../agents/agent";
import { BraveSearchTool } from "../tools";
import { MemoryProvider } from "../memory/memoryFactory";
import {
  MemoryScope,
  SupportedModel,
  VectorMemoryProviderType,
  MemoryMode,
} from "../configs/enum";

export const plannerAgent = new Agent({
  name: "Planner",
  role: "Content Planner",
  goal: "Create an SEO-focused content plan.",
  backstory: "You are an expert content planner.",
  model: SupportedModel.GPT_3_5_TURBO,
  modelOptions: {
    temperature: 0.7,
    max_tokens: 1000,
  },
  tools: [BraveSearchTool],
  guardrails: [
    "Respond only in English.",
    "Do not provide misleading information.",
  ],
  memoryScope: MemoryScope.Long,
  memoryProvider: MemoryProvider(
    undefined,
    MemoryScope.Long,
    MemoryMode.Same,
    VectorMemoryProviderType.Local
  ),
  allowDelegation: false,
  autoTruncateHistory: true,
});
```

---

## Property Descriptions

- **name:** Uniquely identifies the agent in the system. Used as a key for delegation and registry operations.
- **role:** The functional role of the agent. Used in prompts and system messages.
- **goal:** The agent's main objective. Provides context to the LLM when performing tasks.
- **backstory:** The agent's character or background. Especially useful for role-play or expertise scenarios.
- **model:** The LLM model used by the agent. Can be set globally or per agent.
- **modelOptions:** Overrides generation parameters such as temperature or top_p. If omitted, defaults from aiConfig are used.
- **tools:** Tools the agent can use. Can include external APIs, search engines, web scraping, etc.
- **guardrails:** Rules the agent must follow. Can include constraints like language or information accuracy.
- **memoryScope & memoryProvider:** The agent's memory management. Flexible options for short/long-term memory, local or external vector DBs.
- **systemPrompt:** Custom system prompt for the agent. Used at the start of prompts to shape behavior.
- **allowDelegation:** Whether the agent can delegate tasks to other agents.
- **retriever:** Retrieval object for accessing external knowledge sources.
- **trained:** Information loaded from fine-tuning or custom training. Customizes the agent's behavior and knowledge.
- **autoTruncateHistory:** If true, the agent will automatically truncate its message history to fit within the model's token limit. This helps prevent errors due to exceeding token limits. Default is false.

---

## Advanced: Delegation and Tool Usage

- **Delegation:** The agent can delegate tasks it cannot complete on its own to another agent. If `allowDelegation: true`, delegation instructions are automatically included in the system prompt.
- **Tool Usage:** The agent can use defined tools to access external information. Tools can be provided as instances, classes, or functions.

---

## Notes

- Agents are automatically registered and managed in the system via `AgentRegistry`.
- Each agent can be associated with one or more tasks.
- Memory and retrieval features enhance the agent's ability to enrich information and learn from the past.
- In AI-driven pipelines, you do not need to manually assign agents to tasks. The TaskForce framework selects the most appropriate agent for each generated task, based on agent definitions and system input.

---

## Frequently Asked Questions (FAQ)

**What is the relationship between an agent and a task?**

> Each agent can be associated with one or more tasks. A task is a specific job performed by the agent.

**Can an agent use multiple tools?**

> Yes, you can add multiple tools to the tools array.

**How does delegation work?**

> The agent can delegate a task it cannot complete to another agent. For this, `allowDelegation: true` must be set.

**How does the agent's memory work?**

> With memoryScope and memoryProvider, the agent can retrieve information from past outputs or external vector DBs.

**How are agents assigned to tasks in AI-driven mode?**

> In AI-driven TaskForce mode, the system automatically selects and assigns the most suitable agent for each generated task.

---

### [⬅ Back to README](../../README.md)
