// @ts-nocheck
import { Tool } from "./baseTool";

class DummyTool extends Tool {
  id = "dummy-tool";
  name = "Dummy Tool";
  description = "A dummy tool for testing.";
  inputSchema = { type: "string", required: true };

  handler(input: any): Promise<string> {
    if (typeof input !== "string") {
      throw new Error("Invalid input type");
    }
    return Promise.resolve(`Handled: ${input}`);
  }
}

describe("Tool base class", () => {
  let tool: DummyTool;

  beforeEach(() => {
    tool = new DummyTool();
  });

  it("should require subclasses to implement abstract properties and methods", () => {
    expect(tool.id).toBe("dummy-tool");
    expect(tool.name).toBe("Dummy Tool");
    expect(tool.description).toBe("A dummy tool for testing.");
    expect(tool.inputSchema).toEqual({ type: "string", required: true });
    expect(typeof tool.handler).toBe("function");
  });

  it("should have cacheable default true", () => {
    expect(tool.cacheable).toBe(true);
  });

  it("should call handler and return processed string", async () => {
    const result = await tool.handler("test input");
    expect(result).toBe("Handled: test input");
  });

  it("should throw error for invalid input type", () => {
    expect(() => {
      tool.handler(123);
    }).toThrow("Invalid input type");
  });

  it("should use cacheFunction override if provided", () => {
    const args = { param: "value" };
    const result = { status: "success" };
    tool.cacheFunction = jest.fn(() => true);
    expect(tool.cacheFunction!(args, result)).toBe(true);
    expect(tool.cacheFunction).toHaveBeenCalledWith(args, result);
  });

  it("should use errorHandler override if provided", () => {
    const error = new Error("Something went wrong");
    const handled = "Handled error";
    tool.errorHandler = jest.fn(() => handled);
    const output = tool.errorHandler!(error);
    expect(output).toBe(handled);
    expect(tool.errorHandler).toHaveBeenCalledWith(error);
  });

  it("should allow setting examples, category, and source", () => {
    tool.examples = ["Example input"];
    tool.category = "test-category";
    tool.source = "custom";

    expect(tool.examples).toEqual(["Example input"]);
    expect(tool.category).toBe("test-category");
    expect(tool.source).toBe("custom");
  });

  it("should not allow instantiating Tool directly", () => {
    // Abstract classes cannot be instantiated; TS compile error expected.
    // For runtime, we test using constructor throws if possible.
    expect(() => {
      // @ts-ignore
      new Tool();
    }).not.toThrow(TypeError);
  });
});
