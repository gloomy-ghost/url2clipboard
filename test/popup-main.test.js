/**
 * popup-main.test.js
 */
/* eslint-disable  max-nested-callbacks, no-await-in-loop, no-magic-numbers */

import {JSDOM} from "jsdom";
import {assert} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import sinon from "sinon";
import {browser} from "./mocha/setup.js";
import * as mjs from "../src/mjs/popup-main.js";
import formatData from "../src/mjs/format.js";
import {
  CONTENT_LINK, CONTENT_LINK_BBCODE, CONTENT_PAGE, CONTENT_PAGE_BBCODE,
  CONTEXT_INFO, COPY_ALL_TABS, COPY_LINK, COPY_PAGE, EXEC_COPY, EXEC_COPY_TABS,
  INCLUDE_TITLE_HTML, INCLUDE_TITLE_MARKDOWN, MIME_PLAIN, OUTPUT_HTML_HYPER,
  OUTPUT_HTML_PLAIN, OUTPUT_TEXT, OUTPUT_TEXT_AND_URL, OUTPUT_TEXT_TEXT,
  OUTPUT_TEXT_TEXT_URL, OUTPUT_TEXT_URL, OUTPUT_URL,
} from "../src/mjs/constant.js";
const OPTIONS_OPEN = "openOptions";

describe("popup-main", () => {
  /**
   * create jsdom
   * @returns {Object} - jsdom instance
   */
  const createJsdom = () => {
    const domstr = "<!DOCTYPE html><html><head></head><body></body></html>";
    const opt = {
      runScripts: "dangerously",
    };
    return new JSDOM(domstr, opt);
  };
  let window, document;
  beforeEach(() => {
    const dom = createJsdom();
    window = dom && dom.window;
    document = window && window.document;
    global.browser = browser;
    global.window = window;
    global.document = document;
  });
  afterEach(() => {
    window = null;
    document = null;
    delete global.browser;
    delete global.window;
    delete global.document;
  });

  it("should get browser object", () => {
    assert.isObject(browser, "browser");
  });

  describe("set format data", () => {
    const func = mjs.setFormatData;
    beforeEach(() => {
      const {formats} = mjs;
      formats.clear();
    });

    it("should set map", async () => {
      const {formats} = mjs;
      const items = Object.entries(formatData);
      await func();
      assert.strictEqual(formats.size, items.length, "size");
      for (const [key, value] of items) {
        const item = formats.get(key);
        assert.isTrue(formats.has(key), "key");
        assert.deepEqual(item, value, "value");
      }
    });
  });

  describe("get format item from menu item ID", () => {
    const func = mjs.getFormatItemFromId;
    beforeEach(() => {
      const {formats} = mjs;
      formats.clear();
    });

    it("should throw", async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should get null", async () => {
      await mjs.setFormatData();
      const res = await func("foo");
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      await mjs.setFormatData();
      const res = await func(`${COPY_ALL_TABS}foo`);
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      await mjs.setFormatData();
      const res = await func(`${COPY_LINK}foo`);
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      await mjs.setFormatData();
      const res = await func(`${COPY_PAGE}foo`);
      assert.isNull(res, "result");
    });

    it("should get value", async () => {
      const value = formatData.Text;
      await mjs.setFormatData();
      const res = await func(`${COPY_ALL_TABS}Text`);
      assert.deepEqual(res, value, "result");
    });

    it("should get value", async () => {
      const value = formatData.Text;
      await mjs.setFormatData();
      const res = await func(`${COPY_LINK}Text`);
      assert.deepEqual(res, value, "result");
    });

    it("should get value", async () => {
      const value = formatData.Text;
      await mjs.setFormatData();
      const res = await func(`${COPY_PAGE}Text`);
      assert.deepEqual(res, value, "result");
    });
  });

  describe("get format template", () => {
    const func = mjs.getFormatTemplate;
    beforeEach(() => {
      const {formats, vars} = mjs;
      formats.clear();
      vars.includeTitleHtml = false;
      vars.includeTitleMarkdown = false;
      vars.textOutput =  OUTPUT_TEXT_AND_URL;
    });

    it("should throw", async () => {
      await func().catch(e => {
        assert.strictEqual(e.message, "Expected String but got Undefined.",
                           "throw");
      });
    });

    it("should get null", async () => {
      await mjs.setFormatData();
      const res = await func("foo");
      assert.isNull(res, "result");
    });

    it("should get null", async () => {
      await mjs.setFormatData();
      const res = await func(`${COPY_PAGE}foo`);
      assert.isNull(res, "result");
    });

    it("should get value", async () => {
      await mjs.setFormatData();
      const res = await func(`${COPY_PAGE}Text`);
      assert.strictEqual(res, "%content% %url%", "result");
    });

    it("should get value", async () => {
      await mjs.setFormatData();
      mjs.vars.textOutput = OUTPUT_URL;
      const res = await func(`${COPY_PAGE}Text`);
      assert.strictEqual(res, "%url%", "result");
    });

    it("should get value", async () => {
      await mjs.setFormatData();
      mjs.vars.textOutput = OUTPUT_TEXT;
      const res = await func(`${COPY_PAGE}Text`);
      assert.strictEqual(res, "%content%", "result");
    });

    it("should get value", async () => {
      await mjs.setFormatData();
      const res = await func(`${COPY_PAGE}Markdown`);
      assert.strictEqual(res, "[%content%](%url%)", "result");
    });

    it("should get value", async () => {
      await mjs.setFormatData();
      mjs.vars.includeTitleMarkdown = true;
      const res = await func(`${COPY_PAGE}Markdown`);
      assert.strictEqual(res, "[%content%](%url% \"%title%\")", "result");
    });

    it("should get value", async () => {
      await mjs.setFormatData();
      const res = await func(`${COPY_PAGE}HTML`);
      assert.strictEqual(res, "<a href=\"%url%\">%content%</a>", "result");
    });

    it("should get value", async () => {
      await mjs.setFormatData();
      mjs.vars.includeTitleHtml = true;
      const res = await func(`${COPY_PAGE}HTML`);
      assert.strictEqual(
        res, "<a href=\"%url%\" title=\"%title%\">%content%</a>", "result"
      );
    });
  });

  describe("init tab info", () => {
    const func = mjs.initTabInfo;

    it("should init object", async () => {
      const {tabInfo} = mjs;
      tabInfo.id = "foo";
      tabInfo.title = "bar";
      tabInfo.url = "baz";
      const res = await func();
      assert.isNull(res.id, "id");
      assert.isNull(res.title, "title");
      assert.isNull(res.url, "url");
    });
  });

  describe("set tab info", () => {
    const func = mjs.setTabInfo;
    beforeEach(() => {
      const elm = document.createElement("input");
      const elm2 = document.createElement("input");
      const body = document.querySelector("body");
      elm.id = CONTENT_PAGE;
      elm2.id = CONTENT_PAGE_BBCODE;
      body.appendChild(elm);
      body.appendChild(elm2);
    });

    it("should not set value", async () => {
      const contentPage = document.getElementById(CONTENT_PAGE);
      const contentBBCode = document.getElementById(CONTENT_PAGE_BBCODE);
      await func();
      assert.strictEqual(contentPage.value, "", "page value");
      assert.strictEqual(contentBBCode.value, "", "BBCode value");
    });

    it("should set value", async () => {
      const {tabInfo} = mjs;
      const contentPage = document.getElementById(CONTENT_PAGE);
      const contentBBCode = document.getElementById(CONTENT_PAGE_BBCODE);
      const arg = {
        id: "foo",
        title: "bar",
        url: "baz",
      };
      await func(arg);
      assert.strictEqual(contentPage.value, "bar", "page value");
      assert.strictEqual(contentBBCode.value, "baz", "BBCode value");
      assert.strictEqual(tabInfo.id, "foo", "id");
      assert.strictEqual(tabInfo.title, "bar", "title");
      assert.strictEqual(tabInfo.url, "baz", "url");
    });
  });

  describe("init context info", () => {
    const func = mjs.initContextInfo;

    it("should init object", async () => {
      const {contextInfo} = mjs;
      contextInfo.isLink = true;
      contextInfo.content = "foo";
      contextInfo.title = "bar";
      contextInfo.url = "baz";
      contextInfo.canonicalUrl = "qux";
      const res = await func();
      assert.isFalse(res.isLink, "isLink");
      assert.isNull(res.content, "content");
      assert.isNull(res.title, "title");
      assert.isNull(res.url, "url");
      assert.isNull(res.canonicalUrl, "canonicalUrl");
    });
  });

  describe("get all tabs info", () => {
    const func = mjs.getAllTabsInfo;

    it("should get result", async () => {
      const i = browser.tabs.query.callCount;
      browser.tabs.query.withArgs({currentWindow: true}).resolves([
        {
          id: 1,
          title: "foo",
          url: "https://example.com",
        },
        {
          id: 2,
          title: "bar",
          url: "https://www.example.com",
        },
      ]);
      await mjs.setFormatData();
      const res = await func(`${COPY_PAGE}Text`);
      assert.strictEqual(browser.tabs.query.callCount, i + 1, "called");
      assert.deepEqual(res, [
        {
          id: 1,
          menuItemId: `${COPY_PAGE}Text`,
          mimeType: MIME_PLAIN,
          template: "%content% %url%",
          title: "foo",
          url: "https://example.com",
          content: "foo",
        },
        {
          id: 2,
          menuItemId: `${COPY_PAGE}Text`,
          mimeType: MIME_PLAIN,
          template: "%content% %url%",
          title: "bar",
          url: "https://www.example.com",
          content: "bar",
        },
      ], "result");
      browser.tabs.query.flush();
    });
  });

  describe("create copy data", () => {
    const func = mjs.createCopyData;
    beforeEach(() => {
      const {contextInfo, tabInfo, vars} = mjs;
      vars.includeTitleHtml = false;
      vars.includeTitleMarkdown = false;
      vars.mimeType = MIME_PLAIN;
      tabInfo.title = "foo";
      tabInfo.url = "https://www.example.com";
      contextInfo.canonicalUrl = "https://example.com";
      contextInfo.title = "bar";
      contextInfo.url = "https://www.example.com/baz";
      const elm = document.createElement("input");
      const elm2 = document.createElement("input");
      const elm3 = document.createElement("input");
      const elm4 = document.createElement("input");
      const body = document.querySelector("body");
      elm.id = CONTENT_LINK_BBCODE;
      elm2.id = CONTENT_LINK;
      elm3.id = CONTENT_PAGE_BBCODE;
      elm4.id = CONTENT_PAGE;
      body.appendChild(elm);
      body.appendChild(elm2);
      body.appendChild(elm3);
      body.appendChild(elm4);
    });

    it("should not call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const evt = {
        target: {
          id: "foo",
        },
      };
      await mjs.setFormatData();
      const res = await func(evt);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i,
                         "not called");
      assert.strictEqual(res.length, 1, "result");
      assert.deepEqual(res, [
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.getElementById(CONTENT_PAGE);
      elm.value = "qux";
      const evt = {
        target: {
          id: `${COPY_PAGE}Text`,
        },
      };
      browser.runtime.sendMessage.callsFake((...args) => args);
      await mjs.setFormatData();
      const res = await func(evt);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(res.length, 2, "result");
      assert.deepEqual(res, [
        [
          browser.runtime.id,
          {
            [EXEC_COPY]: {
              content: "qux",
              includeTitleHtml: false,
              includeTitleMarkdown: false,
              menuItemId: `${COPY_PAGE}Text`,
              mimeType: MIME_PLAIN,
              template: "%content% %url%",
              title: "foo",
              url: "https://example.com",
            },
          },
          null,
        ],
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
      browser.runtime.sendMessage.flush();
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.getElementById(CONTENT_PAGE);
      elm.value = "";
      const evt = {
        target: {
          id: `${COPY_PAGE}Text`,
        },
      };
      browser.runtime.sendMessage.callsFake((...args) => args);
      await mjs.setFormatData();
      mjs.contextInfo.canonicalUrl = null;
      const res = await func(evt);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(res.length, 2, "result");
      assert.deepEqual(res, [
        [
          browser.runtime.id,
          {
            [EXEC_COPY]: {
              content: "",
              includeTitleHtml: false,
              includeTitleMarkdown: false,
              menuItemId: `${COPY_PAGE}Text`,
              mimeType: MIME_PLAIN,
              template: "%content% %url%",
              title: "foo",
              url: "https://www.example.com",
            },
          },
          null,
        ],
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
      browser.runtime.sendMessage.flush();
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.getElementById(CONTENT_PAGE_BBCODE);
      elm.value = "https://www.example.com";
      const evt = {
        target: {
          id: `${COPY_PAGE}BBCodeURL`,
        },
      };
      browser.runtime.sendMessage.callsFake((...args) => args);
      await mjs.setFormatData();
      const res = await func(evt);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(res.length, 2, "result");
      assert.deepEqual(res, [
        [
          browser.runtime.id,
          {
            [EXEC_COPY]: {
              content: "https://www.example.com",
              includeTitleHtml: false,
              includeTitleMarkdown: false,
              menuItemId: `${COPY_PAGE}BBCodeURL`,
              mimeType: MIME_PLAIN,
              template: "[url]%content%[/url]",
              title: undefined,
              url: "https://example.com",
            },
          },
          null,
        ],
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
      browser.runtime.sendMessage.flush();
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.getElementById(CONTENT_PAGE_BBCODE);
      elm.value = "";
      const evt = {
        target: {
          id: `${COPY_PAGE}BBCodeURL`,
        },
      };
      browser.runtime.sendMessage.callsFake((...args) => args);
      await mjs.setFormatData();
      mjs.contextInfo.canonicalUrl = null;
      const res = await func(evt);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(res.length, 2, "result");
      assert.deepEqual(res, [
        [
          browser.runtime.id,
          {
            [EXEC_COPY]: {
              content: "",
              includeTitleHtml: false,
              includeTitleMarkdown: false,
              menuItemId: `${COPY_PAGE}BBCodeURL`,
              mimeType: MIME_PLAIN,
              template: "[url]%content%[/url]",
              title: undefined,
              url: "https://www.example.com",
            },
          },
          null,
        ],
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
      browser.runtime.sendMessage.flush();
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.getElementById(CONTENT_LINK);
      elm.value = "qux";
      const evt = {
        target: {
          id: `${COPY_LINK}Text`,
        },
      };
      browser.runtime.sendMessage.callsFake((...args) => args);
      await mjs.setFormatData();
      const res = await func(evt);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(res.length, 2, "result");
      assert.deepEqual(res, [
        [
          browser.runtime.id,
          {
            [EXEC_COPY]: {
              content: "qux",
              includeTitleHtml: false,
              includeTitleMarkdown: false,
              menuItemId: `${COPY_LINK}Text`,
              mimeType: MIME_PLAIN,
              template: "%content% %url%",
              title: "bar",
              url: "https://www.example.com/baz",
            },
          },
          null,
        ],
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
      browser.runtime.sendMessage.flush();
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.getElementById(CONTENT_LINK);
      elm.value = "";
      const evt = {
        target: {
          id: `${COPY_LINK}Text`,
        },
      };
      browser.runtime.sendMessage.callsFake((...args) => args);
      await mjs.setFormatData();
      const res = await func(evt);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(res.length, 2, "result");
      assert.deepEqual(res, [
        [
          browser.runtime.id,
          {
            [EXEC_COPY]: {
              content: "",
              includeTitleHtml: false,
              includeTitleMarkdown: false,
              menuItemId: `${COPY_LINK}Text`,
              mimeType: MIME_PLAIN,
              template: "%content% %url%",
              title: "bar",
              url: "https://www.example.com/baz",
            },
          },
          null,
        ],
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
      browser.runtime.sendMessage.flush();
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.getElementById(CONTENT_LINK_BBCODE);
      elm.value = "https://www.example.com/baz";
      const evt = {
        target: {
          id: `${COPY_LINK}BBCodeURL`,
        },
      };
      browser.runtime.sendMessage.callsFake((...args) => args);
      await mjs.setFormatData();
      const res = await func(evt);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(res.length, 2, "result");
      assert.deepEqual(res, [
        [
          browser.runtime.id,
          {
            [EXEC_COPY]: {
              content: "https://www.example.com/baz",
              includeTitleHtml: false,
              includeTitleMarkdown: false,
              menuItemId: `${COPY_LINK}BBCodeURL`,
              mimeType: MIME_PLAIN,
              template: "[url]%content%[/url]",
              title: undefined,
              url: "https://www.example.com/baz",
            },
          },
          null,
        ],
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
      browser.runtime.sendMessage.flush();
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const elm = document.getElementById(CONTENT_LINK_BBCODE);
      elm.value = "";
      const evt = {
        target: {
          id: `${COPY_LINK}BBCodeURL`,
        },
      };
      browser.runtime.sendMessage.callsFake((...args) => args);
      await mjs.setFormatData();
      const res = await func(evt);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(res.length, 2, "result");
      assert.deepEqual(res, [
        [
          browser.runtime.id,
          {
            [EXEC_COPY]: {
              content: "",
              includeTitleHtml: false,
              includeTitleMarkdown: false,
              menuItemId: `${COPY_LINK}BBCodeURL`,
              mimeType: MIME_PLAIN,
              template: "[url]%content%[/url]",
              title: undefined,
              url: "https://www.example.com/baz",
            },
          },
          null,
        ],
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
      browser.runtime.sendMessage.flush();
    });

    it("should call function", async () => {
      const i = browser.runtime.sendMessage.callCount;
      const j = browser.tabs.query.callCount;
      const evt = {
        target: {
          id: `${COPY_ALL_TABS}Text`,
        },
      };
      browser.runtime.sendMessage.callsFake((...args) => args);
      browser.tabs.query.withArgs({currentWindow: true}).resolves([
        {
          id: 1,
          title: "foo",
          url: "https://example.com",
        },
        {
          id: 2,
          title: "bar",
          url: "https://www.example.com",
        },
      ]);
      await mjs.setFormatData();
      const res = await func(evt);
      assert.strictEqual(browser.runtime.sendMessage.callCount, i + 1,
                         "called");
      assert.strictEqual(browser.tabs.query.callCount, j + 1, "called");
      assert.strictEqual(res.length, 2, "result");
      assert.deepEqual(res, [
        [
          browser.runtime.id,
          {
            [EXEC_COPY_TABS]: {
              allTabs: [
                {
                  content: "foo",
                  id: 1,
                  menuItemId: `${COPY_ALL_TABS}Text`,
                  mimeType: MIME_PLAIN,
                  template: "%content% %url%",
                  title: "foo",
                  url: "https://example.com",
                },
                {
                  content: "bar",
                  id: 2,
                  menuItemId: `${COPY_ALL_TABS}Text`,
                  mimeType: MIME_PLAIN,
                  template: "%content% %url%",
                  title: "bar",
                  url: "https://www.example.com",
                },
              ],
              includeTitleHtml: false,
              includeTitleMarkdown: false,
            },
          },
          null,
        ],
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
      browser.runtime.sendMessage.flush();
      browser.tabs.query.flush();
    });
  });

  describe("handle open options on click", () => {
    const func = mjs.openOptionsOnClick;

    it("should call function", async () => {
      const i = browser.runtime.openOptionsPage.callCount;
      await func();
      assert.strictEqual(browser.runtime.openOptionsPage.callCount, i + 1,
                         "called");
    });
  });

  describe("handle menu on click", () => {
    const func = mjs.menuOnClick;

    it("should get result", async () => {
      const evt = {
        target: {
          id: "foo",
        },
      };
      await mjs.setFormatData();
      const res = await func(evt);
      assert.strictEqual(res.length, 1, "result");
      assert.deepEqual(res, [
        {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: null,
          url: null,
        },
      ], "result");
    });
  });

  describe("add listener to menu", () => {
    const func = mjs.addListenerToMenu;

    it("should set listener", async () => {
      const elm = document.createElement("button");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      body.appendChild(elm);
      await func();
      assert.isTrue(spy.calledOnce, "result");
      elm.addEventListener.restore();
    });

    it("should set listener", async () => {
      const elm = document.createElement("button");
      const body = document.querySelector("body");
      const spy = sinon.spy(elm, "addEventListener");
      elm.id = OPTIONS_OPEN;
      body.appendChild(elm);
      await func();
      assert.isTrue(spy.calledOnce, "result");
      elm.addEventListener.restore();
    });
  });

  describe("update menu", () => {
    const func = mjs.updateMenu;
    beforeEach(() => {
      const div = document.createElement("div");
      const elm = document.createElement("button");
      const elm2 = document.createElement("button");
      const elm3 = document.createElement("input");
      const elm4 = document.createElement("input");
      const body = document.querySelector("body");
      div.id = "copyLinkDetails";
      div.appendChild(elm);
      div.appendChild(elm2);
      elm3.id = CONTENT_LINK;
      elm4.id = CONTENT_LINK_BBCODE;
      body.appendChild(div);
      body.appendChild(elm3);
      body.appendChild(elm4);
    });

    it("should not set attr", async () => {
      const items = document.querySelectorAll("button");
      await func();
      for (const item of items) {
        assert.isFalse(item.hasAttribute("disabled"), "attr");
      }
    });

    it("should set attr and value", async () => {
      const items = document.querySelectorAll("button");
      const contentLink = document.getElementById(CONTENT_LINK);
      const contentBBCode = document.getElementById(CONTENT_LINK_BBCODE);
      const data = {
        contextInfo: {
          canonicalUrl: null,
          content: "foo",
          isLink: false,
          title: "bar",
          url: "https://example.com",
        },
      };
      await func(data);
      for (const item of items) {
        assert.strictEqual(item.getAttribute("disabled"), "disabled", "attr");
      }
      assert.strictEqual(contentLink.value, "foo", "value link");
      assert.strictEqual(contentBBCode.value, "https://example.com",
                         "value link");
    });

    it("should set attr and value", async () => {
      const items = document.querySelectorAll("button");
      const contentLink = document.getElementById(CONTENT_LINK);
      const contentBBCode = document.getElementById(CONTENT_LINK_BBCODE);
      const data = {
        contextInfo: {
          canonicalUrl: null,
          content: null,
          isLink: false,
          title: "bar",
          url: null,
        },
      };
      await func(data);
      for (const item of items) {
        assert.strictEqual(item.getAttribute("disabled"), "disabled", "attr");
      }
      assert.strictEqual(contentLink.value, "", "value link");
      assert.strictEqual(contentBBCode.value, "", "value link");
    });

    it("should set attr and value", async () => {
      const items = document.querySelectorAll("button");
      const contentLink = document.getElementById(CONTENT_LINK);
      const contentBBCode = document.getElementById(CONTENT_LINK_BBCODE);
      const data = {
        contextInfo: {
          canonicalUrl: null,
          content: "foo",
          isLink: true,
          title: "bar",
          url: "https://example.com",
        },
      };
      for (const item of items) {
        item.setAttribute("disabled", "disabled");
      }
      await func(data);
      for (const item of items) {
        assert.isFalse(item.hasAttribute("disabled"), "attr");
      }
      assert.strictEqual(contentLink.value, "foo", "value link");
      assert.strictEqual(contentBBCode.value, "https://example.com",
                         "value link");
    });
  });

  describe("request context info", () => {
    const func = mjs.requestContextInfo;
    beforeEach(() => {
      const div = document.createElement("div");
      const elm = document.createElement("button");
      const elm2 = document.createElement("button");
      const elm3 = document.createElement("input");
      const elm4 = document.createElement("input");
      const body = document.querySelector("body");
      div.id = "copyLinkDetails";
      div.appendChild(elm);
      div.appendChild(elm2);
      elm3.id = CONTENT_LINK;
      elm4.id = CONTENT_LINK_BBCODE;
      body.appendChild(div);
      body.appendChild(elm3);
      body.appendChild(elm4);
    });

    it("should not call function", async () => {
      const i = browser.tabs.sendMessage.callCount;
      await func();
      assert.strictEqual(browser.tabs.sendMessage.callCount, i, "not called");
    });

    it("should not call function", async () => {
      const i = browser.tabs.sendMessage.callCount;
      await func({
        id: browser.tabs.TAB_ID_NONE,
      });
      assert.strictEqual(browser.tabs.sendMessage.callCount, i, "not called");
    });

    it("should call function", async () => {
      const i = browser.tabs.sendMessage.callCount;
      await func({
        id: 1,
      });
      assert.strictEqual(browser.tabs.sendMessage.callCount, i + 1, "called");
    });

    it("should call function", async () => {
      const stub = sinon.stub(console, "error");
      const i = browser.tabs.sendMessage.callCount;
      browser.tabs.sendMessage.rejects(new Error("error"));
      await func({
        id: 1,
      });
      const {calledOnce} = stub;
      stub.restore();
      assert.strictEqual(browser.tabs.sendMessage.callCount, i + 1,
                         "called sendMessage");
      assert.isTrue(calledOnce, "called console");
      browser.tabs.sendMessage.flush();
    });
  });

  describe("handle message", () => {
    const func = mjs.handleMsg;

    it("should get empty array if no arguments given", async () => {
      const res = await func();
      assert.deepEqual(res, [], "result");
    });

    it("should get empty array", async () => {
      const res = await func({foo: "bar"});
      assert.deepEqual(res, [], "result");
    });

    it("should get array", async () => {
      const res = await func({[CONTEXT_INFO]: {}});
      assert.deepEqual(res, [undefined], "result");
    });
  });

  describe("set variable", () => {
    const func = mjs.setVar;
    beforeEach(() => {
      const {vars} = mjs;
      vars.mimeType = MIME_PLAIN;
      vars.textOutput = OUTPUT_TEXT_AND_URL;
      vars.includeTitleHtml = false;
      vars.includeTitleMarkdown = false;
    });

    it("should not set variable", async () => {
      const {vars} = mjs;
      await func();
      assert.strictEqual(vars.mimeType, MIME_PLAIN, "mime");
      assert.strictEqual(vars.textOutput, OUTPUT_TEXT_AND_URL, "output");
      assert.isFalse(vars.includeTitleHtml, "html");
      assert.isFalse(vars.includeTitleMarkdown, "markdown");
    });

    it("should not set variable", async () => {
      const {vars} = mjs;
      await func("foo", {});
      assert.strictEqual(vars.mimeType, MIME_PLAIN, "mime");
      assert.strictEqual(vars.textOutput, OUTPUT_TEXT_AND_URL, "output");
      assert.isFalse(vars.includeTitleHtml, "html");
      assert.isFalse(vars.includeTitleMarkdown, "markdown");
    });

    it("should set variable", async () => {
      const {vars} = mjs;
      await func(OUTPUT_TEXT_TEXT, {
        checked: true,
        value: "foo",
      });
      assert.strictEqual(vars.textOutput, "foo", "variable");
    });

    it("should set variable", async () => {
      const {vars} = mjs;
      await func(OUTPUT_TEXT_TEXT_URL, {
        checked: true,
        value: "bar",
      });
      assert.strictEqual(vars.textOutput, "bar", "variable");
    });

    it("should set variable", async () => {
      const {vars} = mjs;
      await func(OUTPUT_TEXT_URL, {
        checked: true,
        value: "baz",
      });
      assert.strictEqual(vars.textOutput, "baz", "variable");
    });

    it("should not set variable", async () => {
      const {vars} = mjs;
      await func(OUTPUT_TEXT_TEXT, {
        checked: false,
        value: "foo",
      });
      assert.strictEqual(vars.textOutput, OUTPUT_TEXT_AND_URL, "variable");
    });

    it("should not set variable", async () => {
      const {vars} = mjs;
      await func(OUTPUT_TEXT_TEXT_URL, {
        checked: false,
        value: "bar",
      });
      assert.strictEqual(vars.textOutput, OUTPUT_TEXT_AND_URL, "variable");
    });

    it("should not set variable", async () => {
      const {vars} = mjs;
      await func(OUTPUT_TEXT_URL, {
        checked: false,
        value: "baz",
      });
      assert.strictEqual(vars.textOutput, OUTPUT_TEXT_AND_URL, "variable");
    });

    it("should set variable", async () => {
      const {vars} = mjs;
      await func(OUTPUT_HTML_HYPER, {
        checked: true,
        value: "foo",
      });
      assert.strictEqual(vars.mimeType, "foo", "variable");
    });

    it("should set variable", async () => {
      const {vars} = mjs;
      await func(OUTPUT_HTML_PLAIN, {
        checked: true,
        value: "bar",
      });
      assert.strictEqual(vars.mimeType, "bar", "variable");
    });

    it("should not set variable", async () => {
      const {vars} = mjs;
      await func(OUTPUT_HTML_HYPER, {
        checked: false,
        value: "foo",
      });
      assert.strictEqual(vars.mimeType, MIME_PLAIN, "variable");
    });

    it("should not set variable", async () => {
      const {vars} = mjs;
      await func(OUTPUT_HTML_PLAIN, {
        checked: false,
        value: "bar",
      });
      assert.strictEqual(vars.mimeType, MIME_PLAIN, "variable");
    });

    it("should set variable", async () => {
      const {vars} = mjs;
      await func(INCLUDE_TITLE_HTML, {
        checked: true,
      });
      assert.isTrue(vars.includeTitleHtml, "variable");
    });

    it("should set variable", async () => {
      const {vars} = mjs;
      await func(INCLUDE_TITLE_HTML, {
        checked: false,
      });
      assert.isFalse(vars.includeTitleHtml, "variable");
    });

    it("should set variable", async () => {
      const {vars} = mjs;
      await func(INCLUDE_TITLE_MARKDOWN, {
        checked: true,
      });
      assert.isTrue(vars.includeTitleMarkdown, "variable");
    });

    it("should set variable", async () => {
      const {vars} = mjs;
      await func(INCLUDE_TITLE_MARKDOWN, {
        checked: false,
      });
      assert.isFalse(vars.includeTitleMarkdown, "variable");
    });
  });

  describe("set variables", () => {
    const func = mjs.setVars;

    it("should not set variables", async () => {
      const res = await func();
      assert.deepEqual(res, [], "result");
    });

    it("should set variables", async () => {
      const res = await func({
        foo: {
          checked: true,
        },
      });
      assert.deepEqual(res, [undefined], "result");
    });
  });
});
