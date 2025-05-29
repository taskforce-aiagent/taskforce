import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
dotenv.config();

export class GithubSearchTool extends Tool {
  id = "github_search_tool";
  name = "GitHub Search Tool";
  description =
    "Searches public GitHub repositories, code, issues, or users by keyword using the GitHub API. (For higher rate limits and private resources, set GITHUB_TOKEN in your environment.)";
  category = "rag";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query for GitHub. E.g. 'lang:typescript ai agent'",
        example: "lang:typescript ai agent",
      },
      type: {
        type: "string",
        description:
          "Type of search: 'repositories', 'code', 'issues', 'users'.",
        example: "repositories",
      },
    },
    required: ["query", "type"],
  };
  examples = [
    "Search repositories with 'ai agent' in TypeScript",
    "Search code for 'TaskForce' in repo",
  ];

  async handler(args: { query: string; type: string }): Promise<string> {
    try {
      const token = process.env.GITHUB_TOKEN;
      const octokit = new Octokit(token ? { auth: token } : {});

      let results;
      switch ((args.type || "").toLowerCase()) {
        case "repositories":
          results = await octokit.rest.search.repos({ q: args.query });
          return JSON.stringify(
            results.data.items.slice(0, 5).map((r) => ({
              name: r.full_name,
              url: r.html_url,
              description: r.description,
              stars: r.stargazers_count,
            })),
            null,
            2
          );
        case "code":
          results = await octokit.rest.search.code({ q: args.query });
          return JSON.stringify(
            results.data.items.slice(0, 5).map((r) => ({
              name: r.name,
              repo: r.repository.full_name,
              url: r.html_url,
              path: r.path,
            })),
            null,
            2
          );
        case "issues":
          results = await octokit.search.issuesAndPullRequests({
            q: args.query,
          });
          return JSON.stringify(
            results.data.items.slice(0, 5).map((r) => ({
              title: r.title,
              url: r.html_url,
              state: r.state,
              isPR: !!r.pull_request,
            })),
            null,
            2
          );
        case "users":
          results = await octokit.rest.search.users({ q: args.query });
          return JSON.stringify(
            results.data.items.slice(0, 5).map((r) => ({
              login: r.login,
              url: r.html_url,
              type: r.type,
            })),
            null,
            2
          );
        default:
          return "Invalid type. Use one of: repositories, code, issues, users.";
      }
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `GitHub search error: ${err.message}`;
    }
  }
}
