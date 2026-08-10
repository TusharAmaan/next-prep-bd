const puppeteer = require('puppeteer');

async function test() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('about:blank');
    
    await page.evaluate(() => {
        document.body.innerHTML = '<div class="sm:p-6">Hello</div>';
    });

    try {
        await page.waitForSelector('.sm\\:p-6', {timeout: 1000});
        console.log("waitForSelector (\\) WORKED");
    } catch(e) { console.error("waitForSelector (\\) FAILED:", e.message); }

    try {
        await page.waitForSelector('.sm\\\\:p-6', {timeout: 1000});
        console.log("waitForSelector (\\\\) WORKED");
    } catch(e) { console.error("waitForSelector (\\\\) FAILED:", e.message); }

    await browser.close();
}
test();
