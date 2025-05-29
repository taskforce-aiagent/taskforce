import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import puppeteer from "puppeteer";

export class BrowserbaseLoadTool extends Tool {
  id = "browserbase_load_tool";
  name = "Browserbase Load Tool";
  description =
    "Loads a webpage in a headless browser and returns the full HTML or a screenshot.";
  category = "web";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "URL of the webpage to load.",
        example: "https://example.com",
      },
      screenshot: {
        type: "boolean",
        description: "Whether to return a screenshot instead of HTML.",
        example: false,
      },
    },
    required: ["url"],
  };
  examples = ["Load https://example.com and return HTML."];

  async handler(args: { url: string; screenshot?: boolean }) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(args.url, { waitUntil: "networkidle2", timeout: 30000 });
      if (args.screenshot) {
        const buffer = (await page.screenshot({ fullPage: true })) as Buffer;
        return "data:image/png;base64," + buffer.toString("base64");
      } else {
        return await page.content();
      }
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error loading page: ${err.message}`;
    } finally {
      if (browser) await browser.close();
    }
  }
}
