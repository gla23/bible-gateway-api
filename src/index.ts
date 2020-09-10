import axios from "axios";

interface BibleGatewayResult {
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

  async search(
    query = "John 3:16",
    version: string = "ESV"
  ): Promise<BibleGatewayResult> {
    const encodedSearch = encodeURIComponent(query);
    const encodedVersion = encodeURIComponent(version);
    const url = `https://classic.biblegateway.com/passage?search=${encodedSearch}&version=${encodedVersion}`;

    const result = await axios.get(url);
    const document = this.parse(result.data);

    const verseSelectorFor = (verse: number) => {
      const verseClassPrefix = document
        .querySelector(".text")
        .getAttribute("class")
        .slice(0, -1);
      const classes = verseClassPrefix.split(" ");
      let selector = classes[classes.length - 1] + verse;
      // Get around selectors not being valid if starting with a digit e.g. 1John...
      return (
        ".text." +
        "\\" +
        selector.codePointAt(0).toString(16).padStart(6, "0") +
        selector.slice(1)
      );
    };
    const verseTextOf = (verse: number | null) => {
      const verseElems = Array.from(
        document.querySelectorAll(verseSelectorFor(verse))
      ).reverse();
      const element = verseElems[0] as HTMLElement;
      return element ? element.textContent : null;
    };

    const content: Array<string | null> = [];

    for (let i = 0; i < 200; i++) {
      const text = verseTextOf(i + 1);
      if (text) content.push(text);
    }

    const verse = document.querySelector(".bcv").textContent;

    return Promise.resolve({ verse, content });
  }
}

export { BibleGatewayAPI };
export default BibleGatewayAPI;
