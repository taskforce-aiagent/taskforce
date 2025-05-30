// @ts-nocheck
import { Agent } from "./agent";
import { Tool } from "../tools/base/baseTool";
import { MemoryScope } from "../configs/enum";
import OpenAI from "openai";

// Log helper ve diğer mocklar aynı şekilde:
jest.mock("../helpers/log.helper", () => ({
  logDir: "/tmp/test-logs",
  TFLog: jest.fn(),
  initializeTaskforceLogFile: jest.fn(),
  logTaskChaining: jest.fn(),
}));

jest.mock("../helpers/telemetry.helper", () => ({
  recordLLMCall: jest.fn(),
  exportTelemetry: jest.fn(() => ({})),
  resetTelemetry: jest.fn(),
  saveTelemetryToFile: jest.fn(),
}));

jest.mock("../memory/memoryFactory", () => ({
  MemoryProvider: jest.fn().mockImplementation(() => ({
    getMemoryScope: () => MemoryScope.Long,
    storeMemory: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock("../memory/retrievals/retrieval.helper", () => ({
  retrieveAndEnrichPrompt: jest.fn().mockResolvedValue("memory-enriched"),
}));

jest.mock("../tools/base/toolRegistry", () => ({
  ToolRegistry: {
    register: jest.fn(),
  },
}));

jest.mock("../tools/toolWorker/toolExecutor", () => ({
  ToolExecutor: jest.fn().mockImplementation(() => ({
    getTools: jest.fn(() => []),
    buildToolUsageExamples: jest.fn(),
  })),
}));

jest.mock("openai", () => {
  const mockOpenAI = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "output" } }],
        }),
      },
    },
  }));
  return {
    __esModule: true,
    default: mockOpenAI,
    OpenAI: mockOpenAI,
  };
});

// *** ANA MOCK: LLM ***
jest.mock("../llm/aiClient", () => ({
  callAIModel: jest.fn(),
}));

describe("Agent", () => {
  let callAIModel;
  beforeEach(() => {
    jest.clearAllMocks(); // temiz başla
    // mock'u buradan eriş:
    callAIModel = require("../llm/aiClient").callAIModel;
    callAIModel.mockResolvedValue("AI output");
  });

  it("canUseTools returns true if tools exist", () => {
    const agent = new Agent({
      name: "ToolUser",
      role: "test",
      goal: "goal",
      model: "gpt-4o-mini",
      backstory: "test",
      tools: [
        class ToolA extends Tool {
          constructor() {
            super();
            this.name = "ToolA";
            this.id = "ToolA";
          }
        },
      ],
    });
    agent.toolExecutor.getTools = () => [new Tool()];
    expect(agent.canUseTools()).toBe(true);
  });

  it("canDelegate returns true/false based on limit", () => {
    const agent = new Agent({
      name: "Delegator",
      role: "test",
      goal: "goal",
      model: "gpt-4o-mini",
      backstory: "test",
      allowDelegation: true,
    });
    expect(agent.canDelegate()).toBe(true);
    agent.incrementDelegation();
    agent.incrementDelegation();
    agent.incrementDelegation();
    expect(agent.canDelegate()).toBe(false);
  });

  it("runTask returns output and calls memory on sequential", async () => {
    const agent = new Agent({
      name: "MemoryGuy",
      role: "test",
      goal: "goal",
      model: "gpt-4o-mini",
      backstory: "test",
      memoryScope: MemoryScope.Long,
      allowDelegation: false,
    });
    const out = await agent.runTask(
      { foo: "bar" },
      "Task description",
      "json",
      undefined,
      undefined,
      undefined,
      undefined,
      "sequential"
    );
    expect(out).toBe("AI output");
  });

  it("runTask handles verbose and logs", async () => {
    const agent = new Agent({
      name: "VerboseAgent",
      role: "test",
      goal: "goal",
      model: "gpt-4o-mini",
      backstory: "test",
    });
    agent.setVerbose(true);
    const out = await agent.runTask({ foo: "bar" }, "desc", "text");
    expect(out).toBe("AI output");
  });

  it("runTask returns delegation JSON if delegation triggered", async () => {
    jest
      .spyOn(require("../helpers/helper"), "checkDelegate")
      .mockReturnValue(true);
    jest.spyOn(require("./agent.helper"), "delegateTo").mockResolvedValue({
      delegateTo: "X",
      task: "Y",
    });
    const agent = new Agent({
      name: "DelAgent",
      role: "test",
      goal: "goal",
      model: "gpt-4o-mini",
      backstory: "test",
      allowDelegation: true,
    });
    const out = await agent.runTask({ foo: "bar" }, "desc", "text");
    expect(out).toContain("__delegate__");
  });

  it("runTask blocks delegation if getDelegationDisallowed is true", async () => {
    callAIModel.mockResolvedValue('DELEGATE(BlockedAgent, "task")');
    const agent = new Agent({
      name: "Blocker",
      role: "test",
      goal: "goal",
      model: "gpt-4o-mini",
      backstory: "test",
      allowDelegation: true,
    });
    jest.spyOn(agent, "getDelegationDisallowed").mockReturnValue(true);
    jest
      .spyOn(require("../helpers/helper"), "checkDelegate")
      .mockReturnValue(true);
    const out = await agent.runTask({ foo: "bar" }, "desc", "text");
    expect(out).toContain("Delegation blocked");
  });

  it("runTask injects memory if retriever is set", async () => {
    callAIModel.mockResolvedValue("AI output");
    const agent = new Agent({
      name: "RetrieverAgent",
      role: "test",
      goal: "goal",
      model: "gpt-4o-mini",
      backstory: "test",
      memoryScope: MemoryScope.Long,
      retriever: { search: jest.fn() },
    });
    const out = await agent.runTask({ foo: "bar" }, "desc", "text");
    expect(out).toBe("AI output");
  });

  it("runTask autoTruncateHistory uses truncation", async () => {
    callAIModel.mockResolvedValue("AI output");
    const agent = new Agent({
      name: "TruncateAgent",
      role: "test",
      goal: "goal",
      model: "gpt-4o-mini",
      backstory: "test",
      autoTruncateHistory: true,
    });
    const out = await agent.runTask({ foo: "bar" }, "desc", "text");
    expect(out).toBe("AI output");
  });

  it("runTask with tool support and TOOL call triggers recursiveToolWorker", async () => {
    callAIModel.mockResolvedValue("AI output");
    const agent = new Agent({
      name: "ToolAgent",
      role: "test",
      goal: "goal",
      model: "gpt-4o-mini",
      backstory: "test",
    });
    agent.toolExecutor.getTools = () => [new Tool()];
    agent.llmModel.supportsTools = false;
    jest.spyOn(require("../helpers/helper"), "checkTool").mockReturnValue(true);
    jest
      .spyOn(require("./agent.helper"), "recursiveToolWorker")
      .mockResolvedValue([{ role: "user", content: "enriched" }]);
    const out = await agent.runTask({ foo: "bar" }, "desc", "text");
    expect(out).toBe("AI output");
  });
});
