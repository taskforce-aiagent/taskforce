// @ts-nocheck
import fs from "fs";
import path from "path";
import {
  defaultTrainingPath,
  trainAgent,
  loadTraining,
} from "./agentTraining.helper.js";
import { Agent } from "../agents/agent.js";
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

jest.mock("fs");

describe("agentTraining.helper", () => {
  const mockAgent = new Agent({
    name: "Test Agent",
    role: "",
    goal: "",
    model: "gpt-4o-mini",
    backstory: "",
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("defaultTrainingPath", () => {
    it("should return correct path with normalized agent name", () => {
      const expectedPath = path.join(
        process.cwd(),
        "trainings",
        "test_agent_trained.json"
      );
      const actualPath = defaultTrainingPath("Test Agent");
      expect(actualPath).toBe(expectedPath);
    });
  });

  describe("trainAgent", () => {
    it("should write training result to file with proper format", async () => {
      const trainingExamples = [
        {
          initialOutput: "Output 1",
          humanFeedback: "Feedback 1",
          improvedOutput: "Improved 1",
        },
        {
          initialOutput: "Output 2",
          humanFeedback: "Feedback 2",
          improvedOutput: "Improved 2",
        },
      ];

      const writeFileSyncMock = jest
        .spyOn(fs, "writeFileSync")
        .mockImplementation(() => {});

      await trainAgent(mockAgent, trainingExamples, "some/path.json");

      expect(writeFileSyncMock).toHaveBeenCalledTimes(1);
      const [calledPath, content] = writeFileSyncMock.mock.calls[0];
      expect(calledPath).toBe("some/path.json");

      const parsedContent = JSON.parse(content);
      expect(parsedContent.suggestions).toEqual([
        "Improve based on: Feedback 1",
        "Improve based on: Feedback 2",
      ]);
      expect(parsedContent.quality).toBe(8.5);
      expect(parsedContent.final_summary).toBe(
        `Trained on ${trainingExamples.length} feedback examples.`
      );
    });
  });

  describe("loadTraining", () => {
    it("should return null if file does not exist", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = loadTraining("Nonexistent Agent");
      expect(result).toBeNull();
    });

    it("should read and parse the training data from file", () => {
      const trainingData = {
        suggestions: ["Improve something"],
        quality: 9,
        final_summary: "Summary",
      };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify(trainingData)
      );

      const result = loadTraining("Test Agent");
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(result).toEqual(trainingData);
    });
  });
});
