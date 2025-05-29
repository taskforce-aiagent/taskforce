import { Agent } from "./agent.js";
import { Task } from "../tasks/task.js";

export interface DelegationCheckResult {
  canDelegate: boolean;
  reason?: string;
}

const MAX_DELEGATION_HOPS = 5;

export function checkDelegationValidity(
  agent: Agent,
  task: Task
): DelegationCheckResult {
  const chain: string[] = task.executionContext?.delegationChain || [];

  if (chain.includes(agent.name)) {
    return {
      canDelegate: false,
      reason: `cycle_detected: ${agent.name} already in delegationChain`,
    };
  }

  if (chain.length >= MAX_DELEGATION_HOPS) {
    return {
      canDelegate: false,
      reason: `max_delegation_hops_exceeded (${MAX_DELEGATION_HOPS})`,
    };
  }

  return { canDelegate: true };
}

export function updateDelegationChain(task: Task, agent: Agent): void {
  if (!task.executionContext) task.executionContext = {};
  if (!Array.isArray(task.executionContext.delegationChain)) {
    task.executionContext.delegationChain = [];
  }
  task.executionContext.delegationChain.push(agent.name);
}

/**
Basic delegation quality assessment:
Outputs starting with DELEGATE(...) and lacking meaningful content are considered weak.
If weak, the score is reduced and retry is recommended. */

export interface DelegationScoreResult {
  isWeak: boolean;
  reason?: string;
  score?: number;
}

export function checkDelegationScore(output: string): DelegationScoreResult {
  const cleaned = output.trim().toLowerCase();
  let score = 10;

  if (cleaned.startsWith("delegate(") && cleaned.length < 100) {
    score = 3;
    return {
      isWeak: true,
      reason: "Output contains only delegation without elaboration.",
      score,
    };
  }

  if (
    cleaned.includes("delegate(") &&
    !cleaned.includes("because") &&
    !cleaned.includes("therefore") &&
    cleaned.length < 150
  ) {
    score = 5;
    return {
      isWeak: true,
      reason: "Delegation present but lacks reasoning or explanation.",
      score,
    };
  }

  return { isWeak: false, score };
}
