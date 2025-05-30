// @ts-nocheck
import { Tool } from "./baseTool";

class DummyTool extends Tool {
  id = "dummy-tool";
  name = "Dummy Tool";
  description = "A dummy tool for testing.";
  inputSchema = { type: "string", required: true };
  async handler(input: any) {
    return "dummy output";
  }
}

import { ToolRegistry, ToolCategories } from "./toolRegistry";

describe("ToolRegistry", () => {
  let tool: DummyTool;

  beforeEach(() => {
    tool = new DummyTool();
    // Clear all tools before each test to isolate tests
    for (const key of [
      ...ToolRegistry.getAll().map((t) => t.id),
      ...ToolRegistry.getAll().map((t) => t.name),
    ]) {
      ToolRegistry.unregister(key);
    }
  });

  it("registers a tool by id and name", () => {
    ToolRegistry.register(tool, "custom", "test-source");
    const byId = ToolRegistry.getByKey(tool.id);
    const byName = ToolRegistry.getByKey(tool.name);
    expect(byId).toBeDefined();
    expect(byId?.id).toBe(tool.id);
    expect(byId?.name).toBe(tool.name);
    expect(byId?.category).toBe("custom");
    expect(byId?.source).toBe("test-source");
    expect(byId?.instance).toBe(tool);

    expect(byName).toBeDefined();
    expect(byName).toEqual(byId);
  });

  it("does not register the same tool twice", () => {
    ToolRegistry.register(tool);
    ToolRegistry.register(tool); // second registration ignored
    const allTools = ToolRegistry.getAll();
    // Should contain exactly one unique tool (id based)
    expect(allTools.filter((t) => t.id === tool.id).length).toBe(1);
  });

  it("unregister removes tool by id and name", () => {
    ToolRegistry.register(tool);
    ToolRegistry.unregister(tool.id);
    expect(ToolRegistry.getByKey(tool.id)).toBeUndefined();
    expect(ToolRegistry.getByKey(tool.name)).toBeDefined();

    ToolRegistry.unregister(tool.name);
    expect(ToolRegistry.getByKey(tool.name)).toBeUndefined();
  });
  it("getAll returns unique tools and filters by category and source", () => {
    const tool1 = new DummyTool();
    tool1.id = "id1";
    tool1.name = "name1";
    tool1.category = "custom";
    tool1.source = "source1";
    const tool2 = new DummyTool();
    tool2.id = "id2";
    tool2.name = "name2";
    tool2.category = "search";
    tool2.source = "source2";

    ToolRegistry.register(tool1, tool1.category, tool1.source);
    ToolRegistry.register(tool2, tool2.category, tool2.source);

    // No filter
    const allTools = ToolRegistry.getAll();
    expect(allTools.length).toBe(2);

    // Filter by category
    const customTools = ToolRegistry.getAll({ category: "custom" });
    expect(customTools.length).toBe(1);
    expect(customTools[0].id).toBe("id1");

    // Filter by source
    const source2Tools = ToolRegistry.getAll({ source: "source2" });
    expect(source2Tools.length).toBe(1);
    expect(source2Tools[0].id).toBe("id2");
  });

  it("update replaces an existing tool", () => {
    ToolRegistry.register(tool);
    const newTool = new DummyTool();
    newTool.id = tool.id;
    newTool.name = tool.name;
    newTool.description = "Updated description";
    ToolRegistry.update(newTool, "updated-category", "updated-source");

    const retrieved = ToolRegistry.getByKey(tool.id);
    expect(retrieved?.instance.description).toBe("Updated description");
    expect(retrieved?.category).toBe("updated-category");
    expect(retrieved?.source).toBe("updated-source");
  });

  it("registerBatch registers multiple tools with default external source", () => {
    const tool1 = new DummyTool();
    tool1.id = "batch1";
    tool1.name = "Batch Tool 1";
    const tool2 = new DummyTool();
    tool2.id = "batch2";
    tool2.name = "Batch Tool 2";

    ToolRegistry.registerBatch([tool1, tool2]);

    expect(ToolRegistry.getByKey("batch1")?.source).toBe("external");
    expect(ToolRegistry.getByKey("batch2")?.source).toBe("external");
  });

  it("listToolSummaries returns summary info of all tools", () => {
    ToolRegistry.register(tool, "custom", "test-source");

    const summaries = ToolRegistry.listToolSummaries();

    expect(Array.isArray(summaries)).toBe(true);
    const summary = summaries.find((s) => s.id === tool.id);
    expect(summary).toMatchObject({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: "custom",
      source: "test-source",
      cacheable: tool.cacheable,
    });
    expect(summary.examples).toBeUndefined();
  });
});
