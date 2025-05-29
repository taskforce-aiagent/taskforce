# What is SmartManagerAgent?

SmartManagerAgent is a high-level manager that coordinates multiple agents and tasks, manages workflow, and acts as a decision-maker when necessary. It is especially useful in complex, multi-stage, or hierarchical workflows, optimizing communication and task distribution between agents.

> **Note:** SmartManagerAgent is not used directly and does not have a `runWorkflow` function. It is only created automatically in the background when TaskForce is started with either `hierarchical` or `AiDriven` executionMode. It takes on decision-making roles such as task assignment, planning, and evaluation. Users do not interact with SmartManagerAgent directly; they only work with TaskForce.

---

## Key Features and Properties

| Property        | Type             | Description                                               | Required |
| --------------- | ---------------- | --------------------------------------------------------- | -------- |
| name            | `string`         | Name of the SmartManagerAgent.                            | ✔️       |
| role            | `string`         | The manager's role (e.g., "Manager", "Coordinator").      | ✔️       |
| model           | `SupportedModel` | LLM model to use.                                         |          |
| agents          | `Agent[]`        | List of agents to manage.                                 | ✔️       |
| tasks           | `Task[]`         | List of tasks to manage.                                  | ✔️       |
| executionMode   | `ExecutionMode`  | Workflow execution mode (Sequential, Hierarchical, etc.). |          |
| allowDelegation | `boolean`        | Whether tasks can be delegated between agents.            |          |
| managerModel    | `SupportedModel` | (Optional) Custom LLM model for the manager.              |          |
| verbose         | `boolean`        | Detailed logging and output.                              |          |

---

## Conceptual Overview

SmartManagerAgent acts as the "brain" of a TaskForce or workflow. It manages the workflow between agents and tasks, assigns tasks to the appropriate agent, collects outputs, and makes decisions when necessary. It is used in workflows with multiple agents and tasks, especially in hierarchical or parallel execution modes.

- **Coordination:** Manages task distribution and communication between agents.
- **Decision Making:** Decides which agent should take on which task.
- **Workflow Management:** Supports sequential, hierarchical, or parallel task management.
- **AI-driven Workflow:** In AiDriven mode, SmartManagerAgent uses an LLM to dynamically generate the task plan, assign agents, and select the optimal execution strategy (parallel, hierarchical, or sequential) based on the given input and available agents.

---

## Property Descriptions

- **name:** Unique name of the SmartManagerAgent in the system.
- **role:** The functional role of the manager.
- **model:** LLM model to use (if any).
- **agents:** List of agents to manage.
- **tasks:** List of tasks to manage.
- **executionMode:** Workflow execution mode (Sequential, Hierarchical, etc.).
- **allowDelegation:** Whether tasks can be delegated between agents.
- **managerModel:** (Optional) Custom LLM model for the manager.
- **verbose:** Detailed logging and output.

---

## Advanced: Using SmartManagerAgent

- **Hierarchical Workflow:** Can manage agents and tasks at different levels.
- **Dynamic Task Assignment:** Can assign tasks dynamically based on agent capabilities and previous outputs.
- **Automatic Delegation:** Can automatically delegate tasks to another agent if not completed.
- **Advanced Logging:** Track workflow and decisions step by step with verbose mode.

---

## Notes

- SmartManagerAgent provides centralized management in large and complex workflows.
- It can be considered the "brain" of a TaskForce or workflow.
- Especially recommended for projects with multiple agents and tasks.
- SmartManagerAgent is automatically used in the background for both hierarchical and AI-driven (dynamic planning) workflows.
- You never instantiate or call SmartManagerAgent directly.

---

## Frequently Asked Questions (FAQ)

**What is the difference between SmartManagerAgent and TaskForce?**

> TaskForce is the general workflow and agent/task manager. SmartManagerAgent only acts as a manager and decision-maker in the background when hierarchical or AI-driven mode is enabled.

**Is SmartManagerAgent used in AI-driven (automatic planning) mode?**

> Yes, whenever you use `ExecutionMode.AiDriven` in TaskForce, a SmartManagerAgent is created in the background to generate, assign, and evaluate tasks dynamically.

**Are multiple executionModes supported?**

> Yes, modes like Sequential, Hierarchical, Parallel, and AI-driven are supported.

**Can the workflow run without SmartManagerAgent?**

> Yes, but centralized management is recommended for complex workflows with multiple agents/tasks, and SmartManagerAgent is always required for hierarchical or AI-driven workflows.

---

### [⬅ Back to README](../../README.md)
