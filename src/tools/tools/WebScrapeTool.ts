import { Readability } from "@mozilla/readability";
import puppeteer from "puppeteer";
import { JSDOM } from "jsdom";
import { InputSchema, LLMToolParameter, Tool } from "../base/baseTool.js";

export class WebScrapeTool extends Tool {
  id = "web_scrape_tool";
  name = "Web Scrape Tool";
  description =
    "Extracts clean and readable article text from a given URL using a headless browser. Ideal for summarizing or analyzing webpage content without ads, sidebars, or navigation clutter. Commonly used after search tools like 'braveSearchTool' or 'serpSearchTool' to extract full content from selected URLs.";
  inputSchema = { type: "object", required: true } as InputSchema;
  parameters = {
    type: "object",
    properties: {
      url: {
        type: "string",
        description:
          "The full URL of the web page to fetch and extract content from.",
        example: "https://en.wikipedia.org/wiki/Artificial_intelligence",
      },
    },
    required: ["url"],
  } as LLMToolParameter;
  examples = [
    "Extract the main content from: https://www.bbc.com/news/world-us-canada-66226967",
  ];
  category = "file";
  source = "custom";

  async handler(args: { url: string }): Promise<string> {
    return await webScrapeTool(args.url);
  }
}
export async function webScrapeTool(url: string): Promise<string> {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    const blockedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".zip",
      ".rar",
      ".exe",
      ".dmg",
    ];

    let isDownload = false;

    page.on("request", (request) => {
      const resourceType = request.resourceType();
      const requestUrl = request.url().toLowerCase();

      if (
        blockedExtensions.some((ext) =>
          requestUrl.split(/[?#]/)[0].endsWith(ext)
        )
      ) {
        isDownload = true;
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    if (!response) {
      console.warn(`[webScrapeTool] No response for ${url}`);
      return "";
    }

    const contentType = response.headers()["content-type"] || "";
    if (!contentType.includes("text/html") || isDownload) {
      console.warn(
        `[webScrapeTool] Skipping non-HTML or download content for ${url}`
      );
      return "";
    }

    const html = await page.content();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.content) return "";

    const contentDOM = new JSDOM(article.content);
    const paragraphs =
      contentDOM.window.document.querySelectorAll("p, h1, h2, h3");

    const cleanedText = Array.from(paragraphs)
      .map((el) => (el as Element).textContent?.trim())
      .filter((txt) => txt && txt.length > 0)
      .join("\n\n");

    return cleanedText;
  } catch (err) {
    console.error("browse error:", err);
    return "";
  } finally {
    if (browser) await browser.close();
  }
}
