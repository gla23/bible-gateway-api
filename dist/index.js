"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BibleGatewayAPI = void 0;
const axios_1 = require("axios");
class BibleGatewayAPI {
    constructor() {
        this.parse = null;
        if (typeof DOMParser !== "undefined") {
            this.parse = (content) => new DOMParser().parseFromString(content, "text/html");
        }
        else {
            this.parse = (content) => {
                const { JSDOM } = require("jsdom");
                const { document } = new JSDOM(content).window;
                return document;
            };
        }
    }
    search(query = "John 3:16", version = "ESV") {
        return __awaiter(this, void 0, void 0, function* () {
            const encodedSearch = encodeURIComponent(query);
            const encodedVersion = encodeURIComponent(version);
            const url = `https://classic.biblegateway.com/passage?search=${encodedSearch}&version=${encodedVersion}`;
            const result = yield axios_1.default.get(url);
            const document = this.parse(result.data);
            const verseSelectorFor = (verse) => {
                const verseClassPrefix = document
                    .querySelector(".text")
                    .getAttribute("class")
                    .slice(0, -1);
                const classes = verseClassPrefix.split(" ");
                let selector = classes[classes.length - 1] + verse;
                // Get around selectors not being valid if starting with a digit e.g. 1John...
                return (".text." +
                    "\\" +
                    selector.codePointAt(0).toString(16).padStart(6, "0") +
                    selector.slice(1));
            };
            const verseTextOf = (verse) => {
                const verseElems = Array.from(document.querySelectorAll(verseSelectorFor(verse))).reverse();
                const element = verseElems[0];
                return element ? element.textContent : null;
            };
            const content = [];
            for (let i = 0; i < 200; i++) {
                const text = verseTextOf(i + 1);
                if (text)
                    content.push(text);
            }
            const verse = document.querySelector(".bcv").textContent;
            return Promise.resolve({ verse, content });
        });
    }
}
exports.BibleGatewayAPI = BibleGatewayAPI;
exports.default = BibleGatewayAPI;
