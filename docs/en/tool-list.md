# 🛠️ TaskForce Built-in Tools

TaskForce, çok sayıda plug-and-play tool ile gelir. Her tool bir sınıftır ve herhangi bir agent’a atanabilir.
Aşağıdaki tabloda mevcut tüm tool’ları, kısa açıklamaları ve temel kullanım örnekleriyle bulabilirsiniz.

> **Not:**
> Tool’ları doğrudan import edebilir ve agent’lara parametre olarak verebilirsiniz.
> Daha fazla detay için [tool.md](./tool.md) veya örnek projelere bakabilirsiniz.

---

## Tool List

### Web & Search Tools

| Tool Name                        | Description                                                  | Example Use                          |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| **BraveSearchTool**              | Web search via Brave API                                     | `new BraveSearchTool()`              |
| **SerpSearchTool**               | Web search via SerpAPI                                       | `new SerpSearchTool()`               |
| **WebScrapeTool**                | Simple web page scraping (HTML/text)                         | `new WebScrapeTool()`                |
| **WebsiteSearchTool**            | Combined web search & content scraping                       | `new WebsiteSearchTool()`            |
| **FirecrawlSearchTool**          | Search/crawl via Firecrawl API                               | `new FirecrawlSearchTool()`          |
| **ScrapeElementFromWebsiteTool** | Scrapes a single HTML element using a CSS selector           | `new ScrapeElementFromWebsiteTool()` |
| **BrowserbaseLoadTool**          | Loads a page in headless browser, returns HTML or screenshot | `new BrowserbaseLoadTool()`          |
| **ApifyActorsTool**              | Run Apify actors for advanced scraping/automation            | `new ApifyActorsTool()`              |

---

### File & Document Tools

| Tool Name               | Description                                 | Example Use                 |
| ----------------------- | ------------------------------------------- | --------------------------- |
| **DirectoryReadTool**   | Lists files/folders in a directory          | `new DirectoryReadTool()`   |
| **DirectorySearchTool** | Search file/folder names in a directory     | `new DirectorySearchTool()` |
| **FileReadTool**        | Reads plain text, markdown, JSON, CSV, etc. | `new FileReadTool()`        |
| **TXTSearchTool**       | Searches for a keyword in a .txt file       | `new TXTSearchTool()`       |
| **CSVSearchTool**       | Search for keyword/value in a CSV file      | `new CSVSearchTool()`       |
| **JSONSearchTool**      | Searches key/value/array in a JSON file     | `new JSONSearchTool()`      |
| **MDXSearchTool**       | Search within .md/.mdx documentation files  | `new MDXSearchTool()`       |
| **PDFSearchTool**       | Keyword/paragraph search in PDF files       | `new PDFSearchTool()`       |
| **DOCXSearchTool**      | Search in DOCX/Word documents               | `new DOCXSearchTool()`      |
| **XMLSearchTool**       | Searches in XML files                       | `new XMLSearchTool()`       |

---

### Database, API & Vector Search

| Tool Name         | Description                                          | Example Use           |
| ----------------- | ---------------------------------------------------- | --------------------- |
| **PGSearchTool**  | Run SQL SELECT queries on PostgreSQL                 | `new PGSearchTool()`  |
| **EXASearchTool** | EXA API search (for RAG)                             | `new EXASearchTool()` |
| **RagTool**       | General semantic/vector search (Chroma, Pinecone...) | `new RagTool()`       |

---

### Vision & Generation

| Tool Name               | Description                              | Example Use                 |
| ----------------------- | ---------------------------------------- | --------------------------- |
| **DALLETool**           | Generate images via OpenAI DALL-E        | `new DALLETool()`           |
| **StableDiffusionTool** | Generate images via Stable Diffusion API | `new StableDiffusionTool()` |
| **VisionTool**          | Alias for visual generation tools        | `new VisionTool()`          |

---

### External Knowledge & Social

| Tool Name                    | Description                                       | Example Use                      |
| ---------------------------- | ------------------------------------------------- | -------------------------------- |
| **GithubSearchTool**         | Search repos/code/issues/users via GitHub API     | `new GithubSearchTool()`         |
| **GithubReadTool**           | Read file content from a public GitHub repository | `new GithubReadTool()`           |
| **YoutubeChannelSearchTool** | Search YouTube channels by keyword                | `new YoutubeChannelSearchTool()` |
| **YoutubeVideoSearchTool**   | Search YouTube videos by keyword                  | `new YoutubeVideoSearchTool()`   |
| **WikipediaSearchTool**      | Search and extract info from Wikipedia            | `new WikipediaSearchTool()`      |

---

## Example Usage

```typescript
import {
  BraveSearchTool,
  DirectoryReadTool,
  PDFSearchTool,
  GithubSearchTool,
  RagTool,
  DALLETool,
} from "taskforce-agent/tools";

// Assign to agent
const researcher = new Agent({
  name: "Researcher",
  tools: [
    new BraveSearchTool({ useScrapeLinksAfterSearch: true }),
    new PDFSearchTool(),
    new RagTool(),
  ],
});

// Use directly in a pipeline
const pdfTool = new PDFSearchTool();
const results = await pdfTool.handler({ file: "./contract.pdf", query: "AI" });
```

---

## Extending Tools

You can easily create custom tools by extending the `Tool` base class:

```typescript
import { Tool } from "taskforce-agent";
class MyCustomTool extends Tool {
  // ... implement handler()
}
```

Or, register your tool for global agent use:

```typescript
import { ToolRegistry } from "taskforce-agent";
ToolRegistry.register(new MyCustomTool(), "mycustom", "custom");
```

---

Kesinlikle, **bazı tool'larda gelişmiş/opsiyonel parametreler** ve “constructor” ile özellik konfigürasyonu destekleniyor.
Kullanıcıların bunları kolayca görebilmesi için tabloya ya da altına "Parameters / Options" veya "Advanced Usage" başlığı altında açıklama ve kod örneği eklenmeli.

Aşağıda en çok kullanılan ve parametre alan bazı tool’lara örnek gösteriyorum. Sonra genel öneri formatı veriyorum.

---

## Tool Options & Advanced Usage

### BraveSearchTool

- **Description:** Web search via Brave API.
- **Parameters:**

  - `useScrapeLinksAfterSearch` (boolean): If true, automatically scrape content from result links after searching (default: false).
  - `numResults` (number): How many results to return (default: 5).

```typescript
const braveTool = new BraveSearchTool({
  useScrapeLinksAfterSearch: true, // Also fetches HTML/text from result pages
  numResults: 10, // Get up to 10 search results
});
```

---

### RagTool

- **Description:** Semantic/vector search using a specified retriever (Chroma, Pinecone, JSON, etc.)
- **Parameters:**

  - `query` (string): The search query (required)
  - `retriever` (string): Retriever name/id to use (optional)
  - `topK` (number): Number of top results to return (optional, default: 3)

```typescript
const ragTool = new RagTool();
const results = await ragTool.handler({
  query: "LLM memory management",
  retriever: "chroma", // or "local", "taskforce", "langchain", etc.
  topK: 5,
});
```

---

### PDFSearchTool

- **Description:** Finds paragraphs in a PDF file containing a keyword
- **Parameters:**

  - `file` (string): Path to the PDF file
  - `query` (string): Keyword or phrase to search

```typescript
const pdfTool = new PDFSearchTool();
const results = await pdfTool.handler({
  file: "./docs/whitepaper.pdf",
  query: "autonomous agent",
});
```

---

### ScrapeElementFromWebsiteTool

- **Description:** Scrapes a specific HTML element from a web page via CSS selector
- **Parameters:**

  - `url` (string): Page URL
  - `selector` (string): CSS selector for the target element

```typescript
const scrapeTool = new ScrapeElementFromWebsiteTool();
const headline = await scrapeTool.handler({
  url: "https://en.wikipedia.org/wiki/LLM",
  selector: "h1",
});
```

---

### BraveSearchTool (Constructor Options Table)

| Option                    | Type    | Default | Description                                                 |
| ------------------------- | ------- | ------- | ----------------------------------------------------------- |
| useScrapeLinksAfterSearch | boolean | false   | Scrapes HTML/text content from result links after searching |
| numResults                | number  | 5       | Number of search results to return                          |

---

## 📋 Best Practice

> **Always check constructor and handler options for each tool** in the [tool source files](../tools/) or in this guide to use their full power.

- If unsure about a tool's available parameters, use `console.log(new Tool())` to inspect or check the [source code](../tools/).
- For advanced use-cases, combine tools in your agent's tool array and pass handler options as shown.

---

## 🧩 Adding Your Own Advanced Tool

You can design your custom tools to accept options in their constructor and/or handler method, just like built-ins!

```typescript
class MyApiTool extends Tool {
  constructor(options) {
    super();
    this.apiKey = options.apiKey || process.env.MY_API_KEY;
    // ...
  }
  async handler(args) {
    // Use this.apiKey, args.param, etc.
  }
}
```

---

> _Want to contribute a new tool or see more examples? Open an issue or pull request on GitHub!_

---

### [⬅ Back to README](../../README.md)
