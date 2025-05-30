// @ts-nocheck

process.env.OPENAI_API_KEY = "dummy";

jest.mock("../helpers/log.helper", () => ({
  logDir: "/tmp/test-logs",
  TFLog: jest.fn(),
  initializeTaskforceLogFile: jest.fn(),
  logTaskChaining: jest.fn(),
}));

jest.mock("../llm/aiClient", () => ({
  callAIModel: jest.fn(),
}));

describe("SmartManagerAgent", () => {
  let SmartManagerAgent, Agent, Task, callAIModel;
  let manager, agentA, agentB;

  beforeEach(() => {
    jest.resetModules();
    ({ SmartManagerAgent } = require("./smartManagerAgent"));
    ({ Agent } = require("./agent"));
    ({ Task } = require("../tasks/task"));
    ({ callAIModel } = require("../llm/aiClient"));

    manager = new SmartManagerAgent({
      name: "SmartManager",
      role: "Manager",
      goal: "Manage tasks",
      model: "gpt-4o-mini",
      backstory: "AI manager.",
    });
    agentA = new Agent({
      name: "A",
      role: "RoleA",
      goal: "GoalA",
      model: "gpt-4o-mini",
      backstory: "",
    });
    agentB = new Agent({
      name: "B",
      role: "RoleB",
      goal: "GoalB",
      model: "gpt-4o-mini",
      backstory: "",
    });
  });

  it("planTasks returns correct order", async () => {
    callAIModel.mockResolvedValueOnce(JSON.stringify({ tasks: ["t1", "t2"] }));
    const t1 = new Task({
      id: "t1",
      name: "Task1",
      description: "desc1",
      outputFormat: "text",
      agent: "A",
    });
    const t2 = new Task({
      id: "t2",
      name: "Task2",
      description: "desc2",
      outputFormat: "text",
      agent: "B",
    });

    const result = await manager.planTasks([t1, t2], { foo: "bar" });
    expect(result.map((t) => t.id)).toEqual(["t1", "t2"]);
  });

  it("decomposeTask returns subtasks from AI", async () => {
    callAIModel.mockResolvedValueOnce(
      JSON.stringify([
        { id: "s1", name: "Subtask1", description: "desc", agent: "A" },
      ])
    );
    const mainTask = new Task({
      id: "main",
      name: "Main",
      description: "desc",
      outputFormat: "text",
      agent: "A",
    });
    const subtasks = await manager.decomposeTask(mainTask, [agentA], false);
    expect(subtasks.length).toBe(1);
    expect(subtasks[0].id).toBe("s1");
  });

  it("decomposeTask falls back to main task on invalid json", async () => {
    callAIModel.mockResolvedValueOnce("not json");
    const mainTask = new Task({
      id: "main",
      name: "Main",
      description: "desc",
      outputFormat: "text",
      agent: "A",
    });
    const subtasks = await manager.decomposeTask(mainTask, [agentA], false);
    expect(subtasks[0].id).toBe("main");
  });

  it("assignAgent returns matched agent", async () => {
    const t = new Task({
      id: "t",
      name: "n",
      description: "d",
      outputFormat: "text",
      agent: "A",
    });
    expect(await manager.assignAgent(t, [agentA, agentB])).toBe(agentA);
  });

  it("assignAgent uses AI for selection if no agent", async () => {
    const t = new Task({
      id: "t",
      name: "n",
      description: "d",
      outputFormat: "text",
      agent: "",
    });
    callAIModel.mockResolvedValueOnce('"B"');
    const res = await manager.assignAgent(t, [agentA, agentB]);
    expect(res).toBe(agentB);
  });

  it("evaluateTaskOutput returns accept", async () => {
    callAIModel.mockResolvedValueOnce(JSON.stringify({ action: "accept" }));
    const t = new Task({
      id: "t",
      name: "n",
      description: "d",
      outputFormat: "text",
      agent: "A",
    });
    const res = await manager.evaluateTaskOutput(t, "out", [agentA, agentB]);
    expect(res).toEqual({ action: "accept" });
  });

  it("reviewFinalOutput parses action", async () => {
    callAIModel.mockResolvedValueOnce(JSON.stringify({ action: "accept" }));
    const res = await manager.reviewFinalOutput({ foo: "bar" });
    expect(res.action).toBe("accept");
  });
});
