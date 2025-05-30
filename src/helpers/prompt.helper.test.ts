// @ts-nocheck
import fs from "fs";
import path from "path";
import { loadPromptFromFile } from "./prompt.helper";

// Jest'in fs modülünü mock'layalım:
jest.mock("fs");

describe("loadPromptFromFile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should load prompt content from absolute file path", () => {
    // Arrange
    const mockFilePath = "/absolute/mock/prompt.txt";
    const mockContent = "prompt content";
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(mockContent);

    // Act
    const result = loadPromptFromFile(mockFilePath);

    // Assert
    expect(fs.existsSync).toHaveBeenCalledWith(mockFilePath);
    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, "utf-8");
    expect(result).toBe(mockContent);
  });

  it("should load prompt content from relative file path", () => {
    const relPath = "mock/relative.txt";
    const absPath = path.join(process.cwd(), relPath);
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue("hello");

    const result = loadPromptFromFile(relPath);

    expect(fs.existsSync).toHaveBeenCalledWith(absPath);
    expect(fs.readFileSync).toHaveBeenCalledWith(absPath, "utf-8");
    expect(result).toBe("hello");
  });

  it("should throw if file does not exist", () => {
    fs.existsSync.mockReturnValue(false);

    expect(() => loadPromptFromFile("/does/not/exist.txt")).toThrow(
      "Prompt file not found"
    );
  });
});
