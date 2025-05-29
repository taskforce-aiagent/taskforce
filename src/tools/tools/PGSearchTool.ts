import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

export class PGSearchTool extends Tool {
  id = "pg_search_tool";
  name = "PG Search Tool";
  description =
    "Executes a SELECT query on a PostgreSQL database table. For security, connectionString should be provided via env (PG_CONNECTION_STRING), but can be overridden as a parameter.";
  category = "database";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      connectionString: {
        type: "string",
        description:
          "(Optional) PostgreSQL connection string. If not provided, PG_CONNECTION_STRING env variable will be used.",
        example: "postgres://user:password@localhost:5432/mydb",
      },
      query: {
        type: "string",
        description: "SQL SELECT query to execute.",
        example: "SELECT * FROM users WHERE name ILIKE '%john%'",
      },
    },
    required: ["query"], // Only query required.
  };
  examples = [
    "Find users named John: SELECT * FROM users WHERE name ILIKE '%john%'",
  ];

  async handler(args: {
    connectionString?: string;
    query: string;
  }): Promise<string> {
    const connectionString =
      args.connectionString || process.env.PG_CONNECTION_STRING;
    if (!connectionString) {
      return "PostgreSQL connection string must be provided via env (PG_CONNECTION_STRING) or as a parameter.";
    }
    const client = new Client({ connectionString });
    try {
      await client.connect();
      const res = await client.query(args.query);
      return JSON.stringify(res.rows, null, 2);
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error running PG query: ${err.message}`;
    } finally {
      await client.end();
    }
  }
}
