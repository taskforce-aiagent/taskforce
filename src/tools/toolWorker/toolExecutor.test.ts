// @ts-nocheck
import { ToolExecutor } from "./toolExecutor";
import { Tool } from "../base/baseTool";

class DummyTool extends Tool {
  id = "dummy-tool";
  name = "Dummy Tool";
  description = "A dummy tool for testing.";
  inputSchema = { type: "string", required: true };
  parameters = {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "A test parameter",
        example: "example value",
      },
    },
    required: ["param1"],
  };
  cacheable = true;
  async handler(input: any) {
    if (typeof input !== "string") throw new Error("Invalid input");
    return `Handled: ${input}`;
  }
}

describe("ToolExecutor", () => {
  let tool: DummyTool;
  let executor: ToolExecutor;

  beforeEach(() => {
    tool = new DummyTool();
    executor = new ToolExecutor([tool]);
  });

  it("should get tools", () => {
    expect(executor.getTools()).toContain(tool);
  });

  it("should get tool name by id or fallback", () => {
    expect(executor.getToolNameById(tool.id)).toBe(tool.name);
    expect(executor.getToolNameById("unknown")).toBe("unknown");
  });

  it("should build tool usage examples string", () => {
    const usage = executor.buildToolUsageExamples([tool]);
    expect(usage).toContain(tool.id);
    expect(usage).toContain(tool.description);
    expect(usage).toContain("param1");
    expect(usage).toContain("Example Dummy Tool Usage");
  });

  it("should validate input correctly", () => {
    expect(
      executor.isValidInput("test", { type: "string", required: true })
    ).toBe(true);
    expect(executor.isValidInput(123, { type: "string", required: true })).toBe(
      false
    );
    expect(executor.isValidInput(123, { type: "number", required: true })).toBe(
      true
    );
    expect(
      executor.isValidInput(null, { type: "object", required: true })
    ).toBe(false);
    expect(executor.isValidInput({}, { type: "object", required: true })).toBe(
      true
    );
    expect(
      executor.isValidInput("anything", { type: "string", required: false })
    ).toBe(true);
  });

  it("should execute tool and return result", async () => {
    const result = await executor.executeToolById(tool.id, "input string");
    expect(result).toBe("Handled: input string");
  });

  it("should return warning if tool not found", async () => {
    const result = await executor.executeToolById("non-existent-tool", "input");
    expect(result).toMatch(/not found/);
  });

  it("should return warning on invalid input", async () => {
    const result = await executor.executeToolById(tool.id, 123);
    expect(result).toMatch(/Invalid input/);
  });

  it("should cache results if tool is cacheable", async () => {
    // first call, no cache
    const result1 = await executor.executeToolById(tool.id, "cache-test");
    expect(result1).toBe("Handled: cache-test");
    // second call, should hit cache and return cached value prefix
    const result2 = await executor.executeToolById(tool.id, "cache-test");
    expect(result2).toContain("tool cached");
  });

  it("should respect cacheFunction override", async () => {
    tool.cacheFunction = jest.fn(() => false); // never cache
    const result1 = await executor.executeToolById(tool.id, "input");
    expect(tool.cacheFunction).toHaveBeenCalled();
    const result2 = await executor.executeToolById(tool.id, "input");
    // Second call should not hit cache since cacheFunction returns false
    expect(result2).toBe("Handled: input");
  });

  it("should use errorHandler if tool handler throws", async () => {
    const errorTool = new DummyTool();
    errorTool.handler = jest.fn(() => {
      throw new Error("fail");
    });
    errorTool.errorHandler = jest.fn(() => "Handled error");
    const exec = new ToolExecutor([errorTool]);
    const result = await exec.executeToolById(errorTool.id, "input");
    expect(result).toBe("Handled error");
    expect(errorTool.errorHandler).toHaveBeenCalled();
  });

  it("should return error message if handler throws and no errorHandler", async () => {
    const errorTool = new DummyTool();
    errorTool.handler = jest.fn(() => {
      throw new Error("fail");
    });
    errorTool.errorHandler = undefined;
    const exec = new ToolExecutor([errorTool]);
    const result = await exec.executeToolById(errorTool.id, "input");
    expect(result).toMatch(/execution error: fail/i);
  });

  it("should emit step event when EMITTING=true", async () => {
    process.env.EMITTING = "true";
    const taskForceMock = {
      emitStep: jest.fn(),
    };
    const exec = new ToolExecutor([tool], taskForceMock as any, "agent1");
    await exec.executeToolById(tool.id, "emit test");

    expect(taskForceMock.emitStep).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "tool_executed",
        agent: "agent1",
        tool: tool.id,
        toolPayload: "emit test",
      })
    );

    process.env.EMITTING = undefined;
  });
});
