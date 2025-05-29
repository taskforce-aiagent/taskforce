import fs from "fs";
import path from "path";

export function loadPromptFromFile(filePath: string): string {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Prompt file not found: ${absolutePath}`);
  }

  return fs.readFileSync(absolutePath, "utf-8");
}
