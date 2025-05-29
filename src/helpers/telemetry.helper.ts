import fs from "fs";
import path from "path";
import { logDir } from "./log.helper.js";

const TELEMETRY_PATH = path.join(logDir, "telemetry.json");

type AgentTelemetry = {
  callCount: number;
  totalTokens: number;
  totalTimeMs: number;
  lastCall?: {
    timestamp: string;
    model: string;
    totalTokens: number;
    durationMs: number;
  };
  models?: {
    model: string;
    totalTokens: number;
    durationMs: number;
  }[];
};

const telemetry: Record<string, AgentTelemetry> = {};

export function recordLLMCall(
  agent: string,
  tokens: number,
  durationMs: number,
  modelName: string
) {
  const current = telemetry[agent] || {
    callCount: 0,
    totalTokens: 0,
    totalTimeMs: 0,
    lastCall: null,
    models: [] as {
      model: string;
      totalTokens: number;
      durationMs: number;
    }[],
  };

  current.models = current.models || [];

  let modelEntry = current.models.find((m) => m.model === modelName);
  if (!modelEntry) {
    modelEntry = { model: modelName, totalTokens: 0, durationMs: 0 };
    current.models.push(modelEntry);
  }

  modelEntry.totalTokens += tokens;
  modelEntry.durationMs += durationMs;

  telemetry[agent] = {
    callCount: current.callCount + 1,
    totalTokens: current.totalTokens + tokens,
    totalTimeMs: current.totalTimeMs + durationMs,
    lastCall: {
      timestamp: new Date().toISOString(),
      model: modelName,
      totalTokens: tokens,
      durationMs,
    },
    models: current.models,
  };

  if (process.env.TELEMETRY_MODE !== "none") {
    saveTelemetryToFile();
  }
}

export function exportTelemetry(): Record<string, AgentTelemetry> {
  return telemetry;
}

export function resetTelemetry() {
  for (const key in telemetry) delete telemetry[key];
}

export function saveTelemetryToFile(): void {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  let existing: Record<string, AgentTelemetry> = {};
  const mode = process.env.TELEMETRY_MODE || "append";

  if (mode === "append" && fs.existsSync(TELEMETRY_PATH)) {
    try {
      const raw = fs.readFileSync(TELEMETRY_PATH, "utf-8");
      existing = JSON.parse(raw);
    } catch (err) {
      console.warn("⚠️ Failed to read existing telemetry. Overwriting.");
    }
  }

  for (const agent of Object.keys(telemetry)) {
    const current = telemetry[agent];
    const previous = existing[agent];

    if (!previous || mode === "overwrite") {
      existing[agent] = current;
      continue;
    }

    previous.callCount += current.callCount;
    previous.totalTokens += current.totalTokens;
    previous.totalTimeMs += current.totalTimeMs;
    previous.lastCall = current.lastCall;

    const modelMap: Record<string, any> = {};
    for (const entry of previous.models || []) {
      modelMap[entry.model] = entry;
    }
    for (const entry of current.models || []) {
      if (modelMap[entry.model]) {
        modelMap[entry.model].totalTokens += entry.totalTokens;
        modelMap[entry.model].durationMs += entry.durationMs;
      } else {
        modelMap[entry.model] = { ...entry };
      }
    }
    previous.models = Object.values(modelMap);
    existing[agent] = previous;
  }

  fs.writeFileSync(TELEMETRY_PATH, JSON.stringify(existing, null, 2), "utf-8");
}
