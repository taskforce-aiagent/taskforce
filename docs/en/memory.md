# What is Memory?

Memory is the structure that allows an agent to store and reuse its past outputs, summaries, or dialogues. It enables agents to behave more contextually, consistently, and "learn" from experience.

---

## Key Features and Properties

| Property           | Type                   | Description                                                  | Required |
| ------------------ | ---------------------- | ------------------------------------------------------------ | -------- |
| memoryScope        | `MemoryScope`          | Memory scope: None, Short, Long, Session, etc.               |          |
| memoryProvider     | `VectorMemoryProvider` | Memory provider (local, Chroma, Pinecone, Supabase, etc.)    |          |
| loadRelevantMemory | `function`             | (Agent/Provider) Retrieves relevant past memory for a query. |          |
| saveMemory         | `function`             | (Agent/Provider) Saves a new output to memory.               |          |

---

## Conceptual Overview

Memory stores information from an agent's past tasks, dialogues, or summaries and reuses it when needed. This allows the agent to "learn" from previous outputs and generate more contextual and personalized responses.

- **Internal Memory:** The agent's own local memory (vector DB, JSON, session, etc.)
- **External Memory:** External vector databases (Chroma, Pinecone, Supabase, etc.)

---

## Usage Example

```typescript
import { MemoryProvider } from "../memory/memoryFactory";
import {
  MemoryScope,
  MemoryMode,
  VectorMemoryProviderType,
} from "../configs/enum";

const memory = MemoryProvider(
  "AgentName",
  MemoryScope.Long,
  MemoryMode.Same,
  VectorMemoryProviderType.Local
);

const relevant = await memory.loadRelevantMemory("example query");
await memory.saveMemory("new output");
```

---

## Property Descriptions

- **memoryScope:** The scope of memory (None, Short, Long, Session). Determines how much history is retained.
- **memoryProvider:** The memory provider. Can be local or an external vector DB.
- **loadRelevantMemory:** Retrieves relevant past memory for a query.
- **saveMemory:** Saves a new output to memory.

---

## Advanced: Memory Usage and Retrieval

- **Short/Long Memory:** Supports different modes such as session (short-term) and long-term memory.
- **Vector DB Integration:** Can work with external vector databases like Chroma, Pinecone, Supabase, etc.
- **Hybrid with Retrieval:** Enables hybrid knowledge enrichment by combining internal memory and external retrieval.
- **Semantic Search:** Memory can return the most relevant past information using semantic search.

---

## Notes

- Memory enables agents to behave more contextually and "learn" from experience.
- Memory management allows agents to benefit from past outputs and generate more consistent responses.
- Memory providers are flexible and extensible.
- When using TaskForce in AI-driven mode, all agent memory features remain fully functional—agents automatically leverage their assigned memory providers as in manual mode.

---

## Frequently Asked Questions (FAQ)

**Is memory required for an agent?**

> No, if memoryScope is set to None, the agent does not use memory.

**Can multiple memoryProviders be used?**

> Typically, a single provider is assigned per agent, but hybrid scenarios are possible.

**What is the difference between memory and retrieval?**

> Memory relates to the agent's own history. Retrieval fetches data from external knowledge sources.

---

### [⬅ Back to README](../../README.md)
