// @ts-nocheck
import {
  checkDelegationValidity,
  updateDelegationChain,
  checkDelegationScore,
} from "./delegation.guard";
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

describe("delegation.guard", () => {
  let agent: Agent, task: Task;

  beforeEach(() => {
    agent = new Agent({
      name: "Alice",
      role: "Delegator",
      goal: "Delegate things",
      model: "gpt-4o-mini",
      backstory: "",
    });
    task = new Task({
      id: "t1",
      name: "Do something",
      description: "desc",
      agent: "Alice",
      outputFormat: "text",
    });
  });

  it("returns canDelegate true if chain is empty", () => {
    expect(checkDelegationValidity(agent, task)).toEqual({ canDelegate: true });
  });

  it("detects delegation cycle", () => {
    task.executionContext.delegationChain = ["Alice"];
    expect(checkDelegationValidity(agent, task)).toEqual({
      canDelegate: false,
      reason: "cycle_detected: Alice already in delegationChain",
    });
  });

  it("detects max delegation hops exceeded", () => {
    task.executionContext.delegationChain = ["A", "B", "C", "D", "E"]; // length 5
    expect(checkDelegationValidity(agent, task)).toEqual({
      canDelegate: false,
      reason: "max_delegation_hops_exceeded (5)",
    });
  });

  it("updates delegationChain on task", () => {
    updateDelegationChain(task, agent);
    expect(task.executionContext.delegationChain).toContain("Alice");
  });

  describe("checkDelegationScore", () => {
    it("returns weak if only DELEGATE present, short", () => {
      const res = checkDelegationScore('DELEGATE(Bob, "task")');
      expect(res.isWeak).toBe(true);
      expect(res.reason).toContain("only delegation");
      expect(res.score).toBe(3);
    });

    it("returns weak if DELEGATE present but lacks explanation", () => {
      const res = checkDelegationScore('This is something. DELEGATE(Bob, "x")');
      expect(res.isWeak).toBe(true);
      expect(res.reason).toContain("lacks reasoning");
      expect(res.score).toBe(5);
    });

    it("returns not weak for normal delegation output", () => {
      const res = checkDelegationScore(
        'I cannot complete this, therefore DELEGATE(Bob, "task") because Bob is the expert.'
      );
      expect(res.isWeak).toBe(false);
      expect(res.score).toBe(10);
    });
  });
});
