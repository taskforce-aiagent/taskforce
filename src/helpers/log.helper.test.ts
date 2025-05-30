// @ts-nocheck
import * as logHelper from "./log.helper";
import * as fs from "fs";
import chalk from "chalk";

jest.mock("fs");
const mockConsole = jest.spyOn(console, "log").mockImplementation(() => {});

describe("log.helper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializeTaskforceLogFile sets activeLogFile", () => {
    logHelper.initializeTaskforceLogFile();
    expect(logHelper.activeLogFile).toContain("taskforce-");
    expect(logHelper.activeLogFile).toContain(".log");
  });

  it("TFLog logs to console and file with chalk", () => {
    logHelper.activeLogFile = "mock-log-file.log";
    logHelper.TFLog("My Message", chalk.green);
    expect(mockConsole).toHaveBeenCalledWith(chalk.green("My Message"));
    expect(fs.appendFileSync).toHaveBeenCalled();
    const written = fs.appendFileSync.mock.calls[0][1];
    expect(written).toContain("My Message");
  });

  it("TFLog logs to console and file without chalk", () => {
    logHelper.activeLogFile = "mock-log-file.log";
    logHelper.TFLog("Plain Message");
    expect(mockConsole).toHaveBeenCalledWith("Plain Message");
    expect(fs.appendFileSync).toHaveBeenCalled();
    const written = fs.appendFileSync.mock.calls[0][1];
    expect(written).toContain("Plain Message");
  });

  it("logTaskChaining logs chaining info", () => {
    logHelper.activeLogFile = "mock-log-file.log";
    logHelper.logTaskChaining("TaskA", "TaskB", "preview input\nwith newline");
    expect(mockConsole).toHaveBeenCalled();
    expect(fs.appendFileSync).toHaveBeenCalled();
    expect(fs.appendFileSync.mock.calls[0][1]).toContain(
      "preview input with newline"
    );
    expect(fs.appendFileSync.mock.calls[0][1]).toContain(
      "uses output from 'TaskA'"
    );
    expect(fs.appendFileSync.mock.calls[0][1]).toContain("'TaskB'");
  });

  it("logTaskChaining logs chaining info even if inputPreview is missing", () => {
    logHelper.activeLogFile = "mock-log-file.log";
    logHelper.logTaskChaining("TaskX", "TaskY");
    expect(mockConsole).toHaveBeenCalled();
    expect(fs.appendFileSync).toHaveBeenCalled();
    expect(fs.appendFileSync.mock.calls[0][1]).toContain("N/A");
  });
});

afterAll(() => {
  mockConsole.mockRestore();
});
