// @ts-nocheck
import * as telemetryHelper from "./telemetry.helper";
import * as fs from "fs";
import path from "path";

// File system side-effect'lerini mockla
jest.mock("fs");

const TELEMETRY_PATH = path.join(process.cwd(), "logs", "telemetry.json");

describe("telemetry.helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    telemetryHelper.resetTelemetry();
    process.env.TELEMETRY_MODE = "append";
    // Mevcut dosya varsa mock'u sıfırla
    fs.existsSync.mockReturnValue(false);
    fs.readFileSync.mockReset();
    fs.writeFileSync.mockReset();
    fs.mkdirSync.mockReset();
  });

  it("should record LLM call and update telemetry", () => {
    telemetryHelper.recordLLMCall("agent1", 42, 1200, "gpt-4o-mini");
    const out = telemetryHelper.exportTelemetry();
    expect(out.agent1.callCount).toBe(1);
    expect(out.agent1.totalTokens).toBe(42);
    expect(out.agent1.totalTimeMs).toBe(1200);
    expect(out.agent1.lastCall.model).toBe("gpt-4o-mini");
    expect(out.agent1.models[0].model).toBe("gpt-4o-mini");
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it("should append stats for the same agent/model", () => {
    telemetryHelper.recordLLMCall("agent1", 42, 100, "gpt-4o-mini");
    telemetryHelper.recordLLMCall("agent1", 13, 300, "gpt-4o-mini");
    const out = telemetryHelper.exportTelemetry();
    expect(out.agent1.callCount).toBe(2);
    expect(out.agent1.totalTokens).toBe(55);
    expect(out.agent1.totalTimeMs).toBe(400);
    expect(out.agent1.models.length).toBe(1);
    expect(out.agent1.models[0].totalTokens).toBe(55);
    expect(out.agent1.models[0].durationMs).toBe(400);
  });

  it("should support multiple models per agent", () => {
    telemetryHelper.recordLLMCall("agent1", 5, 50, "gpt-4o-mini");
    telemetryHelper.recordLLMCall("agent1", 7, 10, "gpt-3.5-turbo");
    const out = telemetryHelper.exportTelemetry();
    expect(out.agent1.models.length).toBe(2);
    expect(out.agent1.models.map((m) => m.model)).toContain("gpt-4o-mini");
    expect(out.agent1.models.map((m) => m.model)).toContain("gpt-3.5-turbo");
  });

  it("should overwrite existing telemetry in overwrite mode", () => {
    process.env.TELEMETRY_MODE = "overwrite";
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(
      JSON.stringify({
        agent1: {
          callCount: 100,
          totalTokens: 1000,
          totalTimeMs: 5000,
          lastCall: null,
          models: [],
        },
      })
    );
    telemetryHelper.recordLLMCall("agent1", 5, 20, "gpt-4o-mini");
    // writeFileSync overwrite yapılır
    const outJson = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(outJson.agent1.callCount).toBe(1);
    expect(outJson.agent1.totalTokens).toBe(5);
    expect(outJson.agent1.totalTimeMs).toBe(20);
  });

  it("should append to existing telemetry in append mode", () => {
    process.env.TELEMETRY_MODE = "append";
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(
      JSON.stringify({
        agent1: {
          callCount: 1,
          totalTokens: 10,
          totalTimeMs: 50,
          lastCall: { model: "gpt-4o-mini", totalTokens: 10, durationMs: 50 },
          models: [{ model: "gpt-4o-mini", totalTokens: 10, durationMs: 50 }],
        },
      })
    );
    telemetryHelper.recordLLMCall("agent1", 7, 10, "gpt-4o-mini");
    // writeFileSync ile eski ile yeni birleşmiş olmalı
    const outJson = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
    expect(outJson.agent1.callCount).toBe(2);
    expect(outJson.agent1.totalTokens).toBe(17);
    expect(outJson.agent1.totalTimeMs).toBe(60);
    expect(outJson.agent1.models[0].totalTokens).toBe(17);
    expect(outJson.agent1.models[0].durationMs).toBe(60);
  });

  it("should reset telemetry", () => {
    telemetryHelper.recordLLMCall("agent1", 42, 100, "gpt-4o-mini");
    telemetryHelper.resetTelemetry();
    const out = telemetryHelper.exportTelemetry();
    expect(Object.keys(out)).toHaveLength(0);
  });

  it("should create logs dir if not exists", () => {
    fs.existsSync.mockReturnValue(false);
    telemetryHelper.saveTelemetryToFile();
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
  });
});
