# What is TaskForce?

TaskForce is a high-level structure that brings together multiple agents and tasks, managing and coordinating the workflow. In large and modular workflows, it manages the relationships between agents and tasks, data flow, and execution mode.

> **Note:** If the executionMode is set to `Hierarchical`, SmartManagerAgent is automatically created in the background and takes on decision-making roles such as task assignment and evaluation. Users do not interact with SmartManagerAgent directly; they only work with TaskForce.

---

## Key Features and Properties

| Property               | Type             | Description                                                  | Required |
| ---------------------- | ---------------- | ------------------------------------------------------------ | -------- |
| agents                 | `Agent[]`        | List of agents included in the TaskForce.                    | ✔️       |
| tasks                  | `Task[]`         | List of tasks included in the TaskForce.                     | ✔️       |
| verbose                | `boolean`        | Detailed logging and output.                                 |          |
| memory                 | `boolean`        | Whether to automatically attach memory to agents.            |          |
| executionMode          | `ExecutionMode`  | Workflow execution mode (Sequential, Hierarchical, etc.).    |          |
| allowParallelProcesses | `boolean`        | Whether tasks are executed in parallel.                      |          |
| managerModel           | `SupportedModel` | (Optional) Manager LLM model used in hierarchical mode.      |          |
| maxRetryPerTask        | `number`         | Maximum retry attempts per task.                             |          |
| maxDelegatePerTask     | `number`         | Maximum delegation attempts per task.                        |          |
| enableReplanning       | `boolean`        | Whether to automatically replan if results are insufficient. |          |
| enableAIPlanning       | `boolean`        | Whether AI-based automatic task planning is enabled.         |          |
| retriever              | `Retriever`      | (Optional) Shared retrieval object for the entire TaskForce. |          |

---

## Conceptual Overview

TaskForce brings together multiple agents and tasks in a workflow, allowing them to operate sequentially, in parallel, or hierarchically. It manages data flow, task assignments, and the overall logic of the workflow. It is used to build modular and scalable workflows in large projects.

> **Note:** If you use `ExecutionMode.AiDriven` and leave `tasks` empty, TaskForce will use an LLM to generate tasks, assign agents, and determine the best execution mode (parallel, hierarchical, or sequential) automatically. No manual task definition is needed in this mode.

- **Coordination:** Manages the workflow between agents and tasks.
- **Execution Modes:** Supports Sequential, Hierarchical (with manager agent), and Parallel modes.
- **Memory and Retrieval:** Can automatically attach memory to agents and use shared retrieval.

---

## AI-Driven Dynamic Planning and Execution Mode Inference

TaskForce now supports _AI-driven_ workflows. If you set `executionMode: ExecutionMode.AiDriven` and leave `tasks: []`, the system will:

- Use an LLM (via SmartManagerAgent) to generate an optimal list of tasks and assign agents dynamically based on your input and the available agents.
- Analyze dependencies (`inputFromTask`) between generated tasks and automatically choose the best execution strategy:
  - **parallel:** if all tasks are independent
  - **hierarchical:** if tasks have dependencies
  - **sequential:** if only a single task exists or strictly linear flow is required
- Automatically instantiate and use a `SmartManagerAgent` in the background for planning, agent assignment, and final evaluation.

> **You only need to provide agents, not tasks.** All chaining, agent selection, and planning logic is handled automatically.

## Usage Example

### 1) Classic (Manual) Hierarchical/Sequential Workflow

```
import { TaskForce } from "../engine/taskForce";
import { plannerAgent, writerAgent, editorAgent } from "./agents";
import { planingTask, writingTask, editingTask } from "./tasks";

const taskForce = new TaskForce({
  agents: [plannerAgent, writerAgent, editorAgent],
  tasks: [planingTask, writingTask, editingTask],
  verbose: true,
  memory: true,
  executionMode: "Hierarchical", // or "Sequential", "AI-driven"
  managerModel: "gpt-4o-mini", // only needed for  hierarchical mode
});


await taskForce.run({ topic: "AI-powered content creation" });
```

### 2) Fully AI-Driven Workflow (No Manual Tasks)

```
const aiDrivenTaskForce = new TaskForce({
  agents: [plannerAgent, writerAgent, editorAgent],
  tasks: [],
  executionMode: ExecutionMode.AiDriven,
  managerModel: SupportedModel.GPT_4O_MINI,
  verbose: true,
});
await aiDrivenTaskForce.run({ topic: "AI-powered content creation" });
```

---

## Property Descriptions

- **agents:** List of agents included in the TaskForce.
- **tasks:** List of tasks included in the TaskForce.
- **verbose:** Detailed logging and output.
- **memory:** Whether to automatically attach memory to agents.
- **executionMode:** Workflow execution mode (Sequential, Hierarchical, AiDriven).
- **allowParallelProcesses:** Whether tasks can be executed in parallel.
- **managerModel:** (Optional) Manager LLM model used in hierarchical mode.
- **maxRetryPerTask:** Maximum retry attempts per task.
- **maxDelegatePerTask:** Maximum delegation attempts per task.
- **enableReplanning:** Whether to automatically replan if results are insufficient.
- **enableAIPlanning:** Whether AI-based automatic task planning is enabled.
- **retriever:** (Optional) Shared retrieval object for the entire TaskForce.

---

## Advanced: Using TaskForce

- **Hierarchical Mode:** Task assignment and evaluation with SmartManagerAgent (automatic in the background).
- **Automatic Planning:** AI-based task decomposition and planning.
- **Parallel Workflow:** Execute tasks simultaneously with allowParallelProcesses.
- **AI-Driven Mode:** When executionMode is set to AiDriven and tasks is left empty, TaskForce will generate and assign tasks dynamically and infer the correct execution mode (parallel, hierarchical, or sequential) based on LLM planning. This enables fully automatic agent pipeline construction.
- **Advanced Error Handling:** Flexible error tolerance with maxRetryPerTask and maxDelegatePerTask.

---

## Notes

- TaskForce provides centralized management in large and modular workflows.
- Manages data flow and workflow logic between agents and tasks.
- Offers flexibility with sequential, hierarchical, and parallel modes.
- SmartManagerAgent is only activated automatically in the background in hierarchical mode.
- For most use-cases, it is recommended to start with AiDriven mode and provide only agents.

---

## Frequently Asked Questions (FAQ)

**What is the difference between TaskForce and SmartManagerAgent?**

> TaskForce is the general workflow and agent/task manager. SmartManagerAgent only acts as a manager and decision-maker in the background when hierarchical or AI-driven mode is enabled.

**Are multiple executionModes supported?**

> Yes, modes like Sequential, Hierarchical and AiDriven are supported.

**What happens if I do not provide tasks?**

> In AiDriven mode, tasks are generated automatically using your agents and input. Manual task configuration is not needed.

**Can the system choose parallel/hierarchical execution automatically?**

> Yes. In AiDriven mode, execution strategy is selected dynamically based on the dependencies between generated tasks.

**Can I use agents and tasks without TaskForce?**

> For small projects, you can use agents and tasks directly, but TaskForce is recommended for large and modular workflows.

**Do I always need to specify a managerModel?**

> Only when using hierarchical or AiDriven mode, to control which LLM will be used for planning and decision-making.

---

### [⬅ Back to README](../../README.md)
