import { Tool, InputSchema, LLMToolParameter } from "../base/baseTool.js";
import puppeteer from "puppeteer";

export class ScrapeElementFromWebsiteTool extends Tool {
  id = "scrape_element_tool";
  name = "Scrape Element From Website Tool";
  description =
    "Scrapes a specific HTML element from a website using a CSS selector.";
  category = "web";
  inputSchema: InputSchema = { type: "object", required: true };
  parameters: LLMToolParameter = {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "URL of the website.",
        example: "https://en.wikipedia.org/wiki/Artificial_intelligence",
      },
      selector: {
        type: "string",
        description: "CSS selector for the element to scrape.",
        example: "h1",
      },
    },
    required: ["url", "selector"],
  };
  examples = [
    "Scrape the first <h1> from https://en.wikipedia.org/wiki/Artificial_intelligence",
  ];

  async handler(args: { url: string; selector: string }): Promise<string> {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(args.url, { waitUntil: "networkidle2", timeout: 30000 });
      const content = await page.$eval(args.selector, (el) => el.textContent);
      return content?.trim() || "No content found for selector.";
    } catch (err: any) {
      return this.errorHandler
        ? this.errorHandler(err)
        : `Error scraping element: ${err.message}`;
    } finally {
      if (browser) await browser.close();
    }
  }
}
