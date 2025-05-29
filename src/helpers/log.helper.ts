import chalk, { ChalkInstance } from "chalk";
import * as fs from "fs";
import * as path from "path";

export const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

let activeLogFile: string | null = null;

export function initializeTaskforceLogFile() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-") // Windows uyumluluğu
    .replace("T", "_")
    .split("Z")[0];

  const fileName = `taskforce-${timestamp}.log`;
  const filePath = path.join(logDir, fileName);

  activeLogFile = filePath;
}

export function TFLog(message: string, chalk?: ChalkInstance) {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}\n`;
  // Terminale yaz
  if (chalk) {
    console.log(chalk(message));
  } else {
    console.log(message);
  }

  // Dosyaya yaz
  if (activeLogFile) {
    fs.appendFileSync(activeLogFile, fullMessage);
  }
}

export function logTaskChaining(
  fromTask: string,
  toTask: string,
  inputPreview?: string
) {
  const timestamp = new Date().toISOString();
  const preview = inputPreview
    ? inputPreview.slice(0, 200).replace(/\n/g, " ")
    : "N/A";
  const message = `🔗 [Chaining] '${toTask}' uses output from '${fromTask}' → Input Preview: ${preview}`;

  // Terminal
  console.log(chalk.cyan(message));

  // Dosya
  if (activeLogFile) {
    fs.appendFileSync(activeLogFile, `[${timestamp}] ${message}\n`);
  }
}
