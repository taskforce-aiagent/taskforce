export interface TrainingExample {
  initialOutput: string;
  humanFeedback: string;
  improvedOutput: string;
}

export interface AgentTrainingResult {
  suggestions: string[];
  quality: number;
  final_summary: string;
}
