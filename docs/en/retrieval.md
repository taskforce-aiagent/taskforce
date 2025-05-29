# What is Retrieval?

Retrieval is the mechanism that allows an agent to fetch data from external knowledge sources (vector databases, APIs, documents, PDFs, RAG, Chroma, Pinecone, etc.) using semantic search. It enables agents to access information beyond their own memory, including multi-source and domain-specific knowledge.

---

## Key Features and Properties

| Property  | Type        | Description                                                      | Required |
| --------- | ----------- | ---------------------------------------------------------------- | -------- |
| retriever | `Retriever` | The main object/interface managing retrieval operations.         | ✔️       |
| retrieve  | `function`  | Fetches semantic data from an external source for a given query. | ✔️       |
| sources   | `string[]`  | (Optional) List of connected external knowledge sources.         |          |
| type      | `string`    | (Optional) Retrieval type (Chroma, Pinecone, API, PDF, etc.).    |          |

---

## Conceptual Overview

Retrieval allows an agent to fetch data from external knowledge bases or multiple sources using semantic search, beyond its own history. It is especially useful in RAG (Retrieval-Augmented Generation), document-based chatbots, support bots, and domain knowledge scenarios.

- **Internal Memory**: Only the agent's own history (vector DB, session, JSON, etc.)
- **Retrieval**: External knowledge source (Chroma, Pinecone, Supabase, API, PDF, etc.)
- **Hybrid**: Both internal memory and retrieval can be used together.

---

## Usage Example

```typescript
import { Retriever } from "../memory/retrievals/retrieval.interface";

const retriever: Retriever = ... // Chroma, Pinecone, API, etc.
const results = await retriever.retrieve("example query");
```

To add retrieval to an agent:

```typescript
import { Agent } from "../agents/agent";

const agent = new Agent({
  ...,
  retriever: retriever,
});
```

---

## Property Descriptions

- **retriever:** The main object/interface managing retrieval operations.
- **retrieve:** Fetches semantic data from an external source for a given query.
- **sources:** (Optional) List of connected external knowledge sources.
- **type:** (Optional) Retrieval type (Chroma, Pinecone, API, PDF, etc.).

---

## Advanced: Using Retrieval

- **Multi-source:** Search multiple external sources (Chroma, Pinecone, API, PDF) simultaneously.
- **Hybrid Memory:** Combine internal memory and retrieval for hybrid knowledge enrichment.
- **Semantic Search:** Queries are searched semantically (embedding-based).
- **RAG:** Retrieval-Augmented Generation injects external knowledge into the LLM.

---

## Notes

- Retrieval enables agents to access information from the outside world or multiple sources.
- Especially useful for document-based chatbots, support bots, and domain knowledge scenarios.
- Internal memory and retrieval can be used together (hybrid).

---

## Frequently Asked Questions (FAQ)

**What is the difference between retrieval and memory?**

> Memory relates to the agent's own history. Retrieval fetches data from external knowledge sources.

**Can I add multiple retrieval sources?**

> Yes, multi-source retrieval allows searching across multiple sources.

**Can an agent work without retrieval?**

> Yes, but retrieval is recommended for scenarios requiring external knowledge.

---

### [⬅ Back to README](../../README.md)
