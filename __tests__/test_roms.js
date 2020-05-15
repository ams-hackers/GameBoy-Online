const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const { toMatchImageSnapshot } = require("jest-image-snapshot");
expect.extend({ toMatchImageSnapshot });

//
// Static web server
//
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

//
// Browser integration
//
let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless:
      process.env.HEADLESS === "true" || process.env.HEADLESS === undefined,
  });
});

afterAll(async () => {
  await browser.close();
});

beforeEach(async () => {
  page = await browser.newPage();
  await page.goto("http://localhost:3000/index.xhtml");
});

afterEach(async () => {
  page = undefined;
});

//
// Running ROMs
//
async function runROM(rom, wait) {
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/index.xhtml");

  const data = fs.readFileSync(path.resolve(__dirname, rom));
  const datauri = new Buffer(data).toString("base64");

  await page.evaluate((datauri) => {
    initPlayer();
    start(mainCanvas, base64_decode(datauri));
  }, datauri);

  await page.waitFor(wait);
  return await page.screenshot();
}

//
// Tests
//

jest.setTimeout(180 * 1000);

describe("Test roms", () => {
  test("cpu_instrs", async () => {
    const image = await runROM("roms/cpu_instrs/cpu_instrs.gb", 30000);
    expect(image).toMatchImageSnapshot();
  });
  test("instr_timing", async () => {
    const image = await runROM("roms/instr_timing/instr_timing.gb", 3000);
    expect(image).toMatchImageSnapshot();
  });
  test("mem_timing", async () => {
    const image = await runROM("roms/mem_timing/mem_timing.gb", 6000);
    expect(image).toMatchImageSnapshot();
  });
  test("mem_timing-2", async () => {
    const image = await runROM("roms/mem_timing-2/mem_timing.gb", 6000);
    expect(image).toMatchImageSnapshot();
  });
  test("interrupt_time", async () => {
    const image = await runROM("roms/interrupt_time/interrupt_time.gb", 6000);
    expect(image).toMatchImageSnapshot();
  });
});

// https://github.com/retrio/gb-test-roms
