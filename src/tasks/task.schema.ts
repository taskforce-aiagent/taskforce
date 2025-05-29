import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const TaskOrderSchema = z.object({
  tasks: z.array(z.string()),
});

export const TaskOrderJsonSchema = zodToJsonSchema(TaskOrderSchema);
