// @ts-nocheck
process.env.OPENAI_API_KEY = "dummy";

describe("callOpenAIFunction", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("calls OpenAI and returns the content", async () => {
    jest.doMock("openai", () => {
      return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
          chat: {
            completions: {
              create: jest.fn().mockResolvedValue({
                choices: [{ message: { content: "Mocked completion output" } }],
              }),
            },
          },
        })),
      };
    });
    const systemAiHelper = require("./systemAi.helper");
    const result = await systemAiHelper.callOpenAIFunction({
      model: "gpt-4o-mini",
      system: "sys prompt",
      user: "user prompt",
    });
    expect(result).toBe("Mocked completion output");
  });

  it("handles missing content gracefully", async () => {
    jest.doMock("openai", () => {
      return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
          chat: {
            completions: {
              create: jest.fn().mockResolvedValue({
                choices: [{ message: { content: "" } }],
              }),
            },
          },
        })),
      };
    });
    const systemAiHelper = require("./systemAi.helper");
    const result = await systemAiHelper.callOpenAIFunction({
      model: "gpt-4o-mini",
      system: "sys prompt",
      user: "user prompt",
    });
    expect(result).toBe("N/A");
  });

  it("supports messages param", async () => {
    jest.doMock("openai", () => {
      return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
          chat: {
            completions: {
              create: jest.fn().mockResolvedValue({
                choices: [{ message: { content: "Mocked completion output" } }],
              }),
            },
          },
        })),
      };
    });
    const systemAiHelper = require("./systemAi.helper");
    const result = await systemAiHelper.callOpenAIFunction({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "mesaj" },
        { role: "system", content: "sys" },
      ],
    });
    expect(result).toBe("Mocked completion output");
  });
});
