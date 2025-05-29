import { OutputFormat } from "../configs/enum.js";
import { cleanMarkdownJson, parseCSV, parseXML } from "../helpers/helper.js";

export interface ExecutionContext {
  delegationChain?: string[];
  [key: string]: any;
}

export interface ITask {
  id: string;
  name: string;
  description: string;
  outputFormat: OutputFormat | string;
  agent: string;
  expectedRole?: string;
  inputFromTask?: string;
  __replanReasonUsed?: boolean;
  /**
   * (Internal use) Optional override for automatic output-to-input mapping.
   * Normally, this is handled by the framework and should not be set manually.
   */
  inputMapper?: (output: string, context?: Record<string, any>) => any;
  executionContext?: ExecutionContext;
}

export class Task {
  public id: string;
  public name: string;
  public description: string;
  public outputFormat: OutputFormat | string;
  public agent: string;
  public expectedRole?: string;
  public inputFromTask?: string;
  public inputMapper?: (output: string, context?: Record<string, any>) => any;
  executionContext?: ExecutionContext;
  __replanReasonUsed?: boolean;

  constructor(task: ITask) {
    this.name = task.name;
    this.description = task.description;
    this.outputFormat = task.outputFormat;
    this.agent = task.agent;
    this.expectedRole = task.expectedRole;
    this.id = task.id;
    this.inputFromTask = task.inputFromTask;
    this.inputMapper = task.inputMapper ?? this.autoDetectMapper();
    this.executionContext = (task as any).executionContext ?? {};
    // ✅ replan reason flag'ini taşı
    this.__replanReasonUsed = task.__replanReasonUsed ?? false;
  }

  private autoDetectMapper(): ((output: string) => any) | undefined {
    if (!this.inputFromTask) return undefined;

    switch (this.outputFormat) {
      case OutputFormat.json:
        return (output: string) => {
          try {
            const cleaned = cleanMarkdownJson(output);
            return JSON.parse(cleaned);
          } catch {
            return output;
          }
        };
      case OutputFormat.csv:
        return (output: string) => parseCSV(output);
      case OutputFormat.xml:
        return (output: string) => parseXML(output);
      case OutputFormat.markdown:
      case OutputFormat.text:
      default:
        return undefined; // Düz metin olarak bırak
    }
  }
}
