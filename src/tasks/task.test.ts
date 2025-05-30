// @ts-nocheck
import { Task } from "./task";
import { OutputFormat } from "../configs/enum";

// MOCK helpers
jest.mock("../helpers/helper", () => ({
  cleanMarkdownJson: (s: string) => s.replace(/```json|\n|```/g, ""),
  parseCSV: (csv: string) => [{ mock: "csv", input: csv }],
  parseXML: (xml: string) => ({ mock: "xml", input: xml }),
}));

describe("Task", () => {
  it("should create task with correct fields", () => {
    const task = new Task({
      id: "t1",
      name: "TestTask",
      description: "desc",
      agent: "TestAgent",
      outputFormat: "text",
    });
    expect(task.id).toBe("t1");
    expect(task.outputFormat).toBe("text");
    expect(task.inputMapper).toBeUndefined();
  });

  it("should auto-detect json inputMapper", () => {
    const task = new Task({
      id: "t2",
      name: "jsonTask",
      description: "desc",
      agent: "Agent",
      outputFormat: OutputFormat.json,
      inputFromTask: "t1",
    });
    // JSON parse success
    expect(task.inputMapper('{"foo":1}')).toEqual({ foo: 1 });
    // JSON parse fail (returns original string)
    expect(task.inputMapper("notjson")).toBe("notjson");
  });

  it("should auto-detect csv inputMapper", () => {
    const task = new Task({
      id: "t3",
      name: "csvTask",
      description: "desc",
      agent: "Agent",
      outputFormat: OutputFormat.csv,
      inputFromTask: "t1",
    });
    expect(task.inputMapper("csv data")).toEqual([
      { mock: "csv", input: "csv data" },
    ]);
  });

  it("should auto-detect xml inputMapper", () => {
    const task = new Task({
      id: "t4",
      name: "xmlTask",
      description: "desc",
      agent: "Agent",
      outputFormat: OutputFormat.xml,
      inputFromTask: "t1",
    });
    expect(task.inputMapper("<xml>test</xml>")).toEqual({
      mock: "xml",
      input: "<xml>test</xml>",
    });
  });

  it("should NOT set inputMapper for text/markdown", () => {
    const task = new Task({
      id: "t5",
      name: "textTask",
      description: "desc",
      agent: "Agent",
      outputFormat: OutputFormat.text,
      inputFromTask: "t1",
    });
    expect(task.inputMapper).toBeUndefined();

    const mdTask = new Task({
      id: "t6",
      name: "mdTask",
      description: "desc",
      agent: "Agent",
      outputFormat: OutputFormat.markdown,
      inputFromTask: "t1",
    });
    expect(mdTask.inputMapper).toBeUndefined();
  });
});
