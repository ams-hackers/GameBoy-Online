const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const { toMatchImageSnapshot } = require("jest-image-snapshot");
expect.extend({ toMatchImageSnapshot });

// Static server
const express = require("express");
const app = express();

app.use(express.static(path.resolve(__dirname, "..")));

let server;

beforeAll((done) => {
  server = app.listen(3000, () => done());
});

afterAll((done) => {
  server.close(() => done());
});

let browser;

describe("Test roms", () => {
  beforeEach(async () => {
    try {
      browser = await puppeteer.launch({
        headless:
          process.env.HEADLESS === "true" || process.env.HEADLESS === undefined,
      });
    } catch (ex) {
      console.log("exception");
    }
  });

  afterEach(async () => {
    await browser.close();
  });

  test("complies with the test", async () => {
    jest.setTimeout(60000);
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/index.xhtml");

    const data = fs.readFileSync(__dirname + "/../roms/10-print.gb");
    const datauri = new Buffer(data).toString("base64");

    await page.evaluate((datauri) => {
      initPlayer();
      start(mainCanvas, base64_decode(datauri));
    }, datauri);

    await page.waitFor(30000);

    const image = await page.screenshot({ path: "example.png" });
    expect(image).toMatchImageSnapshot();
  });
});

// https://github.com/retrio/gb-test-roms
