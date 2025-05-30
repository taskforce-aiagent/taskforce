// @ts-nocheck
import { toAIToolSchema } from "./toolAdapter"; // dosya yolunu projenize göre düzeltin
import { Tool } from "../../index.js";

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

class DummyTool extends Tool {
  id = "dummy-tool";
  name = "Dummy Tool";
  description = "A dummy tool for testing.";
  inputSchema = { type: "string", required: true };
  parameters = {
    type: "object",
    properties: {
      exampleParam: {
        type: "string",
        description: "An example parameter",
        example: "example",
      },
    },
    required: ["exampleParam"],
  };

  async handler(input: any) {
    return "dummy output";
  }
}

describe("toAIToolSchema", () => {
  it("returns undefined for unsupported providers", () => {
    const model = { provider: "unknown" };
    const result = toAIToolSchema(model, []);
    expect(result).toBeUndefined();
  });

  it("converts tools to OpenAI function schema with binding", () => {
    const model = { provider: "openai" };
    const tool = new DummyTool();
    const result = toAIToolSchema(model, [tool]);
    expect(Array.isArray(result)).toBe(true);
    expect(result?.length).toBe(1);
    const schema = result![0];
    expect(schema.type).toBe("function");
    expect(schema.function.name).toBe(tool.id);
    expect(schema.function.description).toBe(tool.description);
    expect(schema.function.parameters).toEqual(tool.parameters);

    // __originalTool__ property'sinin orijinal tool örneğine referans verdiğini kontrol et
    expect(schema.__originalTool__).toBe(tool);
  });

  it("provides default empty parameters object if none defined", () => {
    const model = { provider: "openai" };
    const tool = new DummyTool();
    delete tool.parameters;
    const result = toAIToolSchema(model, [tool]);
    const schema = result![0];
    expect(schema.function.parameters).toEqual({
      type: "object",
      properties: {},
    });
  });
});
