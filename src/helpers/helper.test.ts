// @ts-nocheck
import {
  interpolateTemplate,
  normalizeOutput,
  checkDelegate,
  checkTool,
  cleanMarkdownJson,
  parseCSV,
  cleanFinalContext,
  getSafeReplacer,
  normalizeInput,
  parseXML,
} from "./helper";

describe("normalizeInput", () => {
  it("should flatten a JSON string to key: value pairs", () => {
    expect(normalizeInput('{"foo":"bar","num":1}')).toBe("foo: bar, num: 1");
  });

  it("should clean up curly-brace content in normal string", () => {
    expect(normalizeInput("foo {removeMe} bar")).toBe("foo bar");
  });
});

describe("interpolateTemplate", () => {
  it("should interpolate variable in braces", () => {
    expect(interpolateTemplate("Hi, {user}!", { user: "Taskforce" })).toBe(
      "Hi, Taskforce!"
    );
  });

  it("should keep unknown keys as is", () => {
    expect(interpolateTemplate("Hello {foo}", {})).toBe("Hello {foo}");
  });
});

describe("checkDelegate", () => {
  it("should detect DELEGATE syntax", () => {
    expect(checkDelegate('DELEGATE(Agent1, "Do something")')).toBe(true);
    expect(checkDelegate("not a delegate")).toBe(false);
  });
});

describe("checkTool", () => {
  it("should detect TOOL syntax", () => {
    expect(checkTool('TOOL(SearchTool, {"query": "test"})')).toBe(true);
    expect(checkTool("TOOL()")).toBe(false);
    expect(checkTool("no tool here")).toBe(false);
  });
});

describe("cleanMarkdownJson", () => {
  it("should clean markdown JSON block", () => {
    expect(cleanMarkdownJson('```json\n{"foo":1}\n```')).toBe('{"foo":1}');
    expect(cleanMarkdownJson('```json{"foo":1}```')).toBe('{"foo":1}');
  });
});

describe("parseCSV", () => {
  it("should parse CSV into objects", () => {
    const csv = "a,b\n1,2\n3,4";
    expect(parseCSV(csv)).toEqual([
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ]);
  });
});

describe("cleanFinalContext", () => {
  it("should remove special fields", () => {
    const input = { foo: 1, __replanReason__: "x", __replanCount__: 2 };
    expect(cleanFinalContext(input)).toEqual({ foo: 1 });
  });
});

describe("getSafeReplacer", () => {
  it("should stringify objects with circular refs safely", () => {
    const obj: any = { foo: "bar" };
    obj.self = obj;
    expect(JSON.stringify(obj, getSafeReplacer())).toContain("[Circular]");
  });
});

describe("parseXML", () => {
  it("should handle error and return input string", () => {
    expect(parseXML("<broken>")).toBe("<broken>");
  });
});
