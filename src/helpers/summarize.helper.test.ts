// @ts-nocheck
import * as summarizeHelper from "./summarize.helper";
import * as systemAiHelper from "./systemAi.helper";

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

jest.mock("./systemAi.helper");

describe("summarize.helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateMemorySummary", () => {
    it("should return empty string for blank input", async () => {
      const result = await summarizeHelper.generateMemorySummary("   ");
      expect(result).toBe("");
      expect(systemAiHelper.callOpenAIFunction).not.toHaveBeenCalled();
    });

    it("should call callOpenAIFunction and return summary", async () => {
      systemAiHelper.callOpenAIFunction.mockResolvedValue("summary here");
      const result = await summarizeHelper.generateMemorySummary("test output");
      expect(systemAiHelper.callOpenAIFunction).toHaveBeenCalled();
      expect(result).toBe("summary here");
    });
  });

  describe("summarizeOldMessages", () => {
    it("should call callOpenAIFunction with chat history", async () => {
      systemAiHelper.callOpenAIFunction.mockResolvedValue("old summary");
      const messages = [
        { role: "user", content: "foo" },
        { role: "assistant", content: "bar" },
      ];
      const result = await summarizeHelper.summarizeOldMessages(messages);
      expect(systemAiHelper.callOpenAIFunction).toHaveBeenCalled();
      expect(result).toEqual({
        role: "system",
        content: expect.stringContaining("old summary"),
      });
    });
  });
});
