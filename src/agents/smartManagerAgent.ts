import { Agent } from "./agent.js";
import { Task } from "../tasks/task.js";
import { callAIModel } from "../llm/aiClient.js";
import { TaskOrderJsonSchema, TaskOrderSchema } from "../tasks/task.schema.js";
import { TFLog } from "../helpers/log.helper.js";
import chalk from "chalk";
import { cleanMarkdownJson } from "../helpers/helper.js";
export class SmartManagerAgent extends Agent {
  private taskEvaluationHistory: Map<string, Set<string>> = new Map();
  async planTasks(
    tasks: Task[],
    context: Record<string, any>
  ): Promise<Task[]> {
    const prompt = `User input:
    ${JSON.stringify(context, null, 2)}

    Which of the following tasks should be executed, and in what order?

    ${tasks
      .map((t, i) => `${i + 1}. ${t.id}: ${t.name} => ${t.description}`)
      .join("\n")}

    You will return a JSON object that follows this JSON schema:

    ${JSON.stringify(TaskOrderJsonSchema, null, 2)}

    ONLY return a valid JSON object matching the schema above.
    Do not wrap in markdown.
    Do not include explanation, comments, or extra keys.`;

    const raw = await callAIModel(
      "Manager Agent",
      this.model!,
      [
        { role: "system", content: "You are an intelligent project manager." },
        { role: "user", content: prompt },
      ],
      this.getVerbose()
    );

    TFLog(
      `[Manager Agent] Planning tasks with context:\n${JSON.stringify(
        context,
        null,
        2
      )}`,
      chalk.green
    );
    TFLog(`[Manager Agent] Model returned task order:\n${raw}`, chalk.green);

    const result = TaskOrderSchema.parse(JSON.parse(raw));
    return result.tasks
      .map((id) => tasks.find((t) => t.id === id))
      .filter((t): t is Task => !!t);
  }

  async decomposeTask(
    mainTask: Task,
    subAgents: Agent[],
    verbose: boolean
  ): Promise<
    { id: string; name: string; description: string; agent: string }[]
  > {
    const prompt = `
You are a task decomposition AI. Given the task below, break it down into a list of ordered subtasks with 'id', 'name', 'description', and assign each subtask to one of the agents provided.

Task:
${mainTask.description}

Available agents:
${subAgents.map((a) => `- ${a.name}: ${a.role} / ${a.goal}`).join("\n")}

Each agent is an expert in their role. Assign tasks considering their expertise.

Return only a valid JSON array, no markdown, no explanations.

Example:
[
  { "id": "collect_data", "name": "Collect data", "description": "Gather all relevant data", "agent": "Data Analyst" },
  { "id": "analyze_data", "name": "Analyze data", "description": "Perform statistical analysis", "agent": "Strategy Developer" }
]
`;

    const raw = await callAIModel(
      "Manager Agent",
      this.model!,
      [
        { role: "system", content: "You are an expert task planner." },
        { role: "user", content: prompt },
      ],
      verbose
    );

    const cleanedRaw = cleanMarkdownJson(raw);
    try {
      const parsed = JSON.parse(cleanedRaw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error("Parsed response is not an array");
    } catch (error) {
      if (verbose)
        console.error("Failed to parse decomposition response:", error);
      // Fallback: tek görev olarak dön
      return [
        {
          id: "main",
          name: mainTask.name,
          description: mainTask.description,
          agent: mainTask.agent,
        },
      ];
    }
  }

  async assignAgent(task: Task, agents: Agent[]): Promise<Agent> {
    if (task.agent) {
      const agent = agents.find((a) => a.name === task.agent);
      if (agent) return agent;
    }

    const prompt = `Task: ${task.name} - ${task.description} - task id: ${
      task.id
    }

    Available agents:
    ${agents.map((a) => `- ${a.name}: ${a.role} / ${a.goal}`).join("\n")}

    Which agent is the best fit for this task? Return the agent's name as a single string.`;

    const raw = await callAIModel(
      "Manager Agent",
      this.model!,
      [
        {
          role: "system",
          content: "You are responsible for assigning tasks to agents.",
        },
        { role: "user", content: prompt },
      ],
      this.getVerbose()
    );

    const selectedName = raw.trim().replace(/\"/g, "");

    TFLog(
      `[Manager Agent] Assigning agent for task '${task.name}':\nPrompt:\n${prompt}`,
      chalk.green
    );
    TFLog(`[Manager Agent] Assigned agent: ${selectedName}`, chalk.green);
    return agents.find((a) => a.name === selectedName) || agents[0];
  }

  async evaluateTaskOutput(
    task: Task,
    output: string,
    agents: Agent[]
  ): Promise<
    | { action: "accept" }
    | { action: "retry"; retryWith?: Agent; reason?: string }
    | { action: "delegate"; delegateTo: Agent; reason: string }
  > {
    const availableAgentList = agents.map((a) => `- ${a.name}`).join("\n");
    const prompt = `You are an autonomous project manager evaluating the output of a task completed by an agent.

    Evaluate whether the output sufficiently meets the task description, and decide how to proceed.

    ONLY respond with a **pure JSON object** matching one of the following formats — do NOT include markdown, text, code block syntax, or explanations.

    Valid formats:

    1. Accept the result:
    { "action": "accept" }

    2. Retry with the same or another agent (optional):
    { "action": "retry" }
    or
    { "action": "retry", "retryWith": "Agent Name", "reason": "Why retry is needed" }

    3. Delegate to another agent:
    { "action": "delegate", "delegateTo": "Agent Name", "reason": "Clear and concise reason for delegation" }

    ---

    Available agents:
    ${availableAgentList}

    ---

    Task:
    Task id: ${task.id} - Task Name: ${task.name} - Task Description: ${task.description}

    Output:
    ${output}`;

    const decisionRaw = await callAIModel(
      "Manager Agent",
      this.model!,
      [{ role: "user", content: prompt }],
      this.getVerbose()
    );

    try {
      const cleaned = cleanMarkdownJson(decisionRaw);
      const parsed = JSON.parse(cleaned);

      if (!this.taskEvaluationHistory.has(task.id)) {
        this.taskEvaluationHistory.set(task.id, new Set());
      }
      const history = this.taskEvaluationHistory.get(task.id)!;

      const retryName = parsed.retryWith;
      const delegateName = parsed.delegateTo;

      if (
        (retryName && history.has(retryName)) ||
        (delegateName && history.has(delegateName))
      ) {
        TFLog(
          `🛑 Evaluation loop detected for task '${task.name}'. Agent '${
            retryName || delegateName
          }' was already used.`,
          chalk.red
        );
        return { action: "accept" };
      }

      if (parsed.action === "accept") return { action: "accept" };

      if (parsed.action === "retry") {
        const retryAgent = agents.find((a) => a.name === parsed.retryWith);
        if (this.getVerbose()) {
          TFLog(
            `🔁 Retry requested with ${parsed.retryWith || "same agent"}${
              parsed.reason ? ` — Reason: ${parsed.reason}` : ""
            }`,
            chalk.red
          );
        }
        return {
          action: "retry",
          retryWith: retryAgent,
          reason: parsed.reason,
        };
      }

      if (parsed.action === "delegate") {
        const delegateAgent = agents.find((a) => a.name === parsed.delegateTo);
        if (!delegateAgent) throw new Error("Invalid agent name in delegateTo");
        if (this.getVerbose()) {
          TFLog(
            `📤 Delegating to ${delegateAgent.name} — Reason: ${parsed.reason}`,
            chalk.cyan
          );
        }
        return {
          action: "delegate",
          delegateTo: delegateAgent,
          reason: parsed.reason,
        };
      }
    } catch (err: any) {
      TFLog(
        `❌ Failed to parse evaluation decision: ${err.message}`,
        chalk.red
      );
    }

    return { action: "retry" };
  }

  async reviewFinalOutput(
    finalContext: Record<string, any>
  ): Promise<{ action: "accept" | "replan" | "abort"; reason?: string }> {
    const prompt = `
  Here is the final output of the task force execution:
  ${JSON.stringify(finalContext, null, 2)}
  
  As the manager agent, check if any task output appears invalid, empty, unresolved (like DELEGATE(...)), or asks for more user input (e.g. "please provide").
  
  If everything looks complete, respond with:
  { "action": "accept" }
  
  If outputs look incomplete or delegations failed, respond with:
  { "action": "replan", "reason": "..." }
  
  If critical errors or unsafe instructions are detected, respond with:
  { "action": "abort", "reason": "..." }
  `;

    const result = await callAIModel(
      "Manager Agent",
      this.model!,
      [{ role: "user", content: prompt }],
      this.getVerbose()
    );
    return JSON.parse(result);
  }
}
