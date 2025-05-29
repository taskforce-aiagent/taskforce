# What is a Task?

A Task is a defined unit of work in the system, performed by an agent, with a specific purpose and output. Each task is associated with an agent and forms the building block of the workflow.

---

## Key Features and Properties

| Property      | Type     | Description                                                     | Required |
| ------------- | -------- | --------------------------------------------------------------- | -------- |
| id            | `string` | Unique key for the task.                                        | ✔️       |
| name          | `string` | Name of the task.                                               | ✔️       |
| description   | `string` | Description, purpose, or details of the work to be done.        | ✔️       |
| outputFormat  | `string` | Expected output format (e.g., text, markdown, json, csv, etc.). |          |
| agent         | `string` | Name of the agent that will perform the task.                   | ✔️       |
| expectedRole  | `string` | (Optional) Expected agent role.                                 |          |
| inputFromTask | `string` | (Optional) Use the output of a previous task as input.          |          |

---

## Conceptual Overview

A task is a clearly defined job performed by an agent in a workflow. Each task is paired with an agent and determines what will be done, by whom, and how at each step. Tasks make the workflow modular and reusable.

> **Note:** In AI-driven (dynamic) workflows, tasks can be generated automatically by the system based on input, agent capabilities, and workflow requirements. In this mode, task chaining and dependencies (using `inputFromTask`) are inferred and constructed by the LLM/SmartManagerAgent.

---

## Usage Example

```typescript
import { Task } from "../tasks/task";

export const writingTask = new Task({
  id: "writingTask",
  name: "writingTask",
  description: "Write a detailed blog post on a given topic.",
  outputFormat: "markdown",
  agent: "Writer",
});
```

---

## Property Descriptions

- **id:** Ensures the task is uniquely identified in the system.
- **name:** Short name of the task. Used as a reference in code and workflow.
- **description:** Purpose and details of the job. Used when generating prompts.
- **outputFormat:** Expected output format. Determines the structure of the LLM's response.
- **agent:** Name of the agent that will perform the task. Establishes the link between agent and task.
- **expectedRole:** (Optional) The role the agent is expected to assume. Useful in multi-role systems.
- **inputFromTask:** (Optional) Binds the output of a previous task as input to this task. Used for pipelines and dependent tasks.

---

## Advanced: Task Flow and Dependencies

- **Pipeline:** Tasks can be chained to run sequentially. The output of one task can be the input for another.
- **Parallel Tasks:** Multiple tasks can be executed simultaneously by different agents.
- **Dependent Tasks:** With inputFromTask, the output of one task can be automatically passed to another.
  > **Tip:** In AI-driven TaskForce workflows, you can leave the task list empty and let the system generate optimal tasks, agents, and dependency chains automatically, including correct usage of `inputFromTask` for pipelines.

---

## Notes

- Each task must be paired with an agent.
- Tasks increase the modularity and reusability of the workflow.
- outputFormat allows you to control the format of the LLM's response.

---

## Frequently Asked Questions (FAQ)

**Can a task be performed by multiple agents?**

> No, each task is paired with a single agent. However, the same agent can perform multiple tasks.

**How is data transferred between tasks?**

> With the inputFromTask property, the output of one task can be passed as input to another.

**Why is outputFormat important?**

> It determines the format of the LLM's response. Especially useful for structured outputs like json or markdown.

---

### [⬅ Back to README](../../README.md)
