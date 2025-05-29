import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
dotenv.config();

export class GithubReadTool extends Tool {
  id = "github_read_tool";
  name = "GitHub Read Tool";
  description =
    "Reads the content of a specific file from a public GitHub repository.";
  category = "file";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      repo: {
        type: "string",
        description: "Full name of the repository (owner/repo).",
        example: "vercel/next.js",
      },
      path: {
        type: "string",
        description: "Path to the file in the repository.",
        example: "README.md",
      },
      ref: {
        type: "string",
        description: "The name of the commit/branch/tag (default: main).",
        example: "main",
      },
    },
    required: ["repo", "path"],
  };
  examples = [
    "Read README.md from vercel/next.js",
    "Get src/index.ts from owner/repo on branch develop",
  ];

  async handler(args: {
    repo: string;
    path: string;
    ref?: string;
  }): Promise<string> {
    try {
      const [owner, repo] = args.repo.split("/");
      // Read GitHub API token from environment variable for authenticated requests
      const token = process.env.GITHUB_TOKEN;
      const octokit = new Octokit(token ? { auth: token } : {});
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: args.path,
        ref: args.ref || "main",
      });

      if (Array.isArray(response.data)) {
        // If the specified path is a directory
        return "The specified path is a directory. Please provide a file path.";
      }
      // For single file/symlink/submodule:
      if (response.data.type === "file" && "content" in response.data) {
        // content is base64 encoded!
        const content = Buffer.from(response.data.content, "base64").toString();
        return (
          content.slice(0, 4000) +
          (content.length > 4000 ? "\n\n...(truncated)" : "")
        );
      } else if (response.data.type === "symlink") {
        return "The specified path is a symlink. Symlinks are not supported.";
      } else if (response.data.type === "submodule") {
        return "The specified path is a submodule. Submodules are not supported.";
      } else {
        return "File not found or unsupported content type.";
      }
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `GitHub read error: ${err.message}`;
    }
  }
}
