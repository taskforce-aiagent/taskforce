import fs from "fs";
import path from "path";
import { AgentTrainingResult, TrainingExample } from "./agentTraining.types.js";
import { Agent } from "../agents/agent.js";

const DEFAULT_TRAINED_AGENT_DIR = "trainings";

export function defaultTrainingPath(agentName: string): string {
  return path.join(
    process.cwd(),
    DEFAULT_TRAINED_AGENT_DIR,
    `${agentName.replace(/\s+/g, "_").toLowerCase()}_trained.json`
  );
}

export async function trainAgent(
  agent: Agent,
  trainingExamples: TrainingExample[],
  outputPath?: string
): Promise<void> {
  const suggestions = trainingExamples.flatMap((e) =>
    e.humanFeedback ? [`Improve based on: ${e.humanFeedback}`] : []
  );
  const quality = 8.5; // Placeholder for actual evaluation logic
  const final_summary = `Trained on ${trainingExamples.length} feedback examples.`;

  const trainingResult: AgentTrainingResult = {
    suggestions,
    quality,
    final_summary,
  };
  const outPath = outputPath || defaultTrainingPath(agent.name);
  fs.writeFileSync(outPath, JSON.stringify(trainingResult, null, 2), "utf-8");
  console.log(`✅ Trained data saved for agent ${agent.name} → ${outPath}`);
}

export function loadTraining(agentName: string): AgentTrainingResult | null {
  const pathToFile = defaultTrainingPath(agentName);
  if (!fs.existsSync(pathToFile)) return null;
  const raw = fs.readFileSync(pathToFile, "utf-8");
  return JSON.parse(raw);
}
