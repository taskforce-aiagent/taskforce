// @ts-nocheck
import * as agentHelper from "./agent.helper";
import { Agent } from "./agent";
import { Task } from "../tasks/task";
import OpenAI from "openai";

jest.mock("openai", () => {
  const mockOpenAI = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest
          .fn()
          .mockResolvedValue({ choices: [{ message: { content: "{}" } }] }),
      },
    },
  }));
  return {
    __esModule: true,
    default: mockOpenAI,
    OpenAI: mockOpenAI,
  };
});

describe("agent.helper.ts core utilities", () => {
  it("buildUserMessage builds correct message", () => {
    const agent = new Agent({
      name: "TestAgent",
      role: "Writer",
      goal: "Write something great.",
      backstory: "You are the best writer.",
      model: "gpt-4o-mini",
    });
    const msg = agentHelper.buildUserMessage(
      { topic: "AI" },
      agent,
      "Write an article about {topic}.",
      "Last output",
      "Retry reason",
      "Delegate reason",
      "json"
    );
    expect(msg).toContain("Write an article about AI");
    expect(msg).toContain("Last output");
    expect(msg).toContain("Retry reason");
    expect(msg).toContain("Delegate reason");
    expect(msg).toContain("json format");
  });

  it("buildSystemMessage works for agent", () => {
    const agent = new Agent({
      name: "Sys",
      role: "Planner",
      goal: "Plan stuff.",
      backstory: "You are a planner.",
      model: "gpt-4o-mini",
    });
    const msg = agentHelper.buildSystemMessage({}, agent);
    expect(msg).toContain("You are a Planner");
    expect(msg).toContain("Plan stuff.");
    expect(msg).toContain("Date:");
  });

  it("delegateTo returns null if no delegate pattern", async () => {
    const agent = new Agent({
      name: "Delegator",
      role: "Test",
      goal: "",
      backstory: "",
      model: "gpt-4o-mini",
      allowDelegation: true,
    });
    const res = await agentHelper.delegateTo(agent, "no delegate", {}, 0);
    expect(res).toBeNull();
  });

  it("delegateTo returns delegate info on DELEGATE call", async () => {
    const agent = new Agent({
      name: "Delegator",
      role: "Test",
      goal: "",
      backstory: "",
      model: "gpt-4o-mini",
      allowDelegation: true,
    });
    const output = 'DELEGATE(OtherAgent, "Do this task")';
    const res = await agentHelper.delegateTo(agent, output, {}, 0);
    expect(res).toEqual({
      delegateTo: "OtherAgent",
      task: "Do this task",
    });
  });
});

describe("toolWorker", () => {
  it("calls tool and returns messages", async () => {
    const toolExecutor = {
      getTools: () => [{ id: "Tool1", name: "TestTool" }],
      buildToolUsageExamples: () => "Example",
      getToolNameById: () => "TestTool",
      executeToolById: jest.fn().mockResolvedValue("tool result"),
    };
    const agent = new Agent({
      name: "Tooly",
      role: "Tooler",
      goal: "Tools!",
      backstory: "test",
      model: "gpt-4o-mini",
    });
    agent.toolExecutor = toolExecutor;

    const output = 'TOOL(Tool1, {"query": "foo"})';
    const messages = await agentHelper.toolWorker(
      output,
      agent,
      "Do task",
      "json",
      {}
    );
    expect(messages[0].role).toBe("system");
    expect(messages[1].content).toContain("Tool Response for TestTool");
    expect(toolExecutor.executeToolById).toHaveBeenCalled();
  });
});

jest.mock("../llm/aiClient", () => ({
  callAIModel: jest.fn().mockResolvedValue(
    JSON.stringify({
      executionMode: "sequential",
      tasks: [{ id: "t1", name: "Task1", description: "desc", agent: "A" }],
    })
  ),
}));

describe("generateDynamicPlan", () => {
  it("returns parsed plan", async () => {
    const agentHelper = require("./agent.helper");
    const agents = [{ name: "A", role: "role", goal: "goal" }];
    const res = await agentHelper.generateDynamicPlan({
      inputs: { foo: "bar" },
      agents,
      model: "gpt-4o-mini",
      verbose: false,
    });
    expect(res.executionMode).toBe("sequential");
    expect(res.tasks.length).toBe(1);
    expect(res.agents[0].name).toBe("A");
  });
});

describe("truncateMessagesToFitModelLimit", () => {
  it("summarizes when over token limit", async () => {
    jest.resetModules();
    jest.doMock("../configs/aiConfig", () => ({
      getLLMRouteByModel: () => ({
        model: { maxContextTokens: 40 },
      }),
    }));
    const agentHelper = require("./agent.helper");

    const msgs = [
      { role: "system", content: "SysMsg" },
      ...Array(10).fill({
        role: "user",
        content:
          "longmsg longmsg longmsg longmsg longmsg longmsg longmsg longmsg",
      }),
    ];

    const result = await agentHelper.truncateMessagesToFitModelLimit(
      "gpt-4o-mini",
      msgs
    );
    expect(result.some((m) => m.content.includes("summary"))).toBe(true);
  });
});
