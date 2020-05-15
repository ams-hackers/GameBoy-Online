const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer');

const { toMatchImageSnapshot } = require('jest-image-snapshot');
expect.extend({ toMatchImageSnapshot });

let browser;

describe('Test roms', () => {

    beforeEach(async () => {
        try {
            browser = await puppeteer.launch({ headless: true });
        } catch (ex) {
            console.log("exception")
        }

    })

    afterEach(async () => {
        await browser.close()
    })

    test('complies with the test', async () => {
        jest.setTimeout(10 * 1000);
        const page = await browser.newPage();
        await page.goto('http://localhost:3000');

        const data = fs.readFileSync(__dirname + '/../roms/10-print.gb')
        const datauri = new Buffer(data).toString('base64');

        await page.evaluate((datauri) => {
            initPlayer();
            start(mainCanvas, base64_decode(datauri));
        }, datauri);

        await page.waitFor(1000);

        const image = await page.screenshot({ path: 'example.png' });
        expect(image).toMatchImageSnapshot();

    })

})


// https://github.com/retrio/gb-test-roms
