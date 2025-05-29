# OpenAI Fine-Tuning Integration

This framework supports fine-tuning OpenAI models and registering them for use by agents. Fine-tuning allows you to adapt a base model to your specific data and use case, improving performance for your domain.

---

## Key Concepts

- **Fine-tuning**: Training a base OpenAI model (e.g., GPT-3.5, GPT-4) on your own dataset to create a custom model.
- **Model Registration**: After fine-tuning, the new model is registered in the system and can be referenced by agents.
- **FineTuneOptions**: The configuration object required to start a fine-tuning job.

---

## FineTuneOptions Properties

| Property   | Type   | Description                                                  | Required |
| ---------- | ------ | ------------------------------------------------------------ | -------- |
| agentName  | string | Name of the agent for which the model is being fine-tuned.   | ✔️       |
| modelKey   | string | Unique key to register and reference the fine-tuned model.   | ✔️       |
| baseModel  | string | The base OpenAI model to fine-tune (e.g., "gpt-3.5-turbo").  | ✔️       |
| source     | string | Path to the training data file (.jsonl) or a URL.            | ✔️       |
| validation | string | (Optional) Path to a validation data file (.jsonl) or a URL. |          |
| suffix     | string | (Optional) Suffix for the fine-tuned model name.             |          |

---

## Usage Example

```typescript
import { trainAndRegisterFineTunedModel } from "../fineTune/fineTuner";

await trainAndRegisterFineTunedModel({
  agentName: "ContentWriter",
  modelKey: "content_writer_v1",
  baseModel: "gpt-3.5-turbo",
  source: "./data/training_data.jsonl",
  validation: "./data/validation_data.jsonl", // optional
  suffix: "content-writer-v1", // optional
});
```

- The fine-tuned model will be registered and can be referenced by agents using the `modelKey`.
- If a model with the same `modelKey` already exists, an error will be thrown.

---

## Best Practices

- **Unique modelKey**: Always use a unique `modelKey` for each fine-tuned model.
- **Data format**: Training and validation files must be in OpenAI-compatible `.jsonl` format.
- **Model registration**: After fine-tuning, the model is saved in `fine-tuned/models.json` and can be used by agents.
- **Error handling**: If required fields are missing or the modelKey already exists, the process will fail with a clear error message.

---

## Notes

- Only OpenAI models are supported for fine-tuning in this framework.
- Fine-tuning jobs are started via the OpenAI API and may take some time to complete.
- The fine-tuned model can be referenced in agent definitions by setting the `model` property to the registered modelKey.
- Fine-tuned models can be used seamlessly in both manual and AI-driven TaskForce pipelines. When TaskForce is run in AiDriven mode, any agent referencing a fine-tuned model will be used for relevant dynamically generated tasks as needed.

---

## Frequently Asked Questions (FAQ)

**Can I fine-tune non-OpenAI models?**

> No, only OpenAI models are supported for fine-tuning in this framework.

**What happens if I use a duplicate modelKey?**

> The process will throw an error. Use a unique modelKey for each fine-tuned model.

**How do I use a fine-tuned model in an agent?**

> Set the agent's `model` property to the registered modelKey after fine-tuning and registration.

---

### [⬅ Back to README](../../README.md)
