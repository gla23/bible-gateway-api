import axios from "axios";

export interface BibleGatewayResult {
  verse: string;
  content: Array<string>;
}

class BibleGatewayAPI {
  private parse: Function = null;

  constructor() {
    if (typeof DOMParser !== "undefined") {
      this.parse = (content: string) =>
        new DOMParser().parseFromString(content, "text/html");
    } else {
      this.parse = (content: string) => {
        const { JSDOM } = require("jsdom");
        const { document } = new JSDOM(content).window;
        return document;
      };
    }
  }
  private async parsePage(url: string): Promise<BibleGatewayResult> {
    const result = await axios.get(url);
    const document = this.parse(result.data);

    const aTextElem = document.querySelector(".text");
    if (!aTextElem) return { verse: "", content: [] };
    const verseClassPrefix = aTextElem.getAttribute("class").slice(0, -1);
    const classes = verseClassPrefix.split(" ");
    const selectorPrefixInvalid = classes[classes.length - 1];
    // Get around selectors not being valid if starting with a digit e.g. 1John...
    const selectorPrefix =
      ".text." +
      "\\" +
      selectorPrefixInvalid.codePointAt(0).toString(16).padStart(6, "0") +
      selectorPrefixInvalid.slice(1);

    const verseTextOf = (verse: number | null) => {
      const verseElems = Array.from(
        document.querySelectorAll(selectorPrefix + verse)
      ).reverse();
      const element = verseElems[0] as HTMLElement;
      return element ? element.textContent : null;
    };

    const content: Array<string | null> = [];

    for (let i = 0; i < 200; i++) {
      const text = verseTextOf(i + 1);
      if (text) content.push(text);
    }

    const verse =
      document.querySelector(".bcv")?.textContent || "No verse found";

    return { verse, content };
  }

  async search(
    query = "John 3:16",
    version = "ESV",
    useCors = false
  ): Promise<BibleGatewayResult> {
    const encodedSearch = encodeURIComponent(query);
    const encodedVersion = encodeURIComponent(version);
    const url = `https://classic.biblegateway.com/passage?search=${encodedSearch}&version=${encodedVersion}`;
    const corsPrefix = "http://allow-any-origin.appspot.com/";
    return this.parsePage(useCors ? corsPrefix + url : url);
  }
  async searchUrl(url: string) {
    return this.parsePage(url);
  }
}

export { BibleGatewayAPI };
export default BibleGatewayAPI;
