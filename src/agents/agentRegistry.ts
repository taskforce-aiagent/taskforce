import { Agent } from "./agent.js";

export class AgentRegistry {
  private static agents: Map<string, Agent> = new Map();

  static register(agent: Agent) {
    this.agents.set(agent.name, agent);
  }

  static getByName(name: string): Agent | undefined {
    return this.agents.get(name);
  }

  static getAll(): Agent[] {
    return Array.from(this.agents.values());
  }

  static clear() {
    this.agents.clear();
  }
}
