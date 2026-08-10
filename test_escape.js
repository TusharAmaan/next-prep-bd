const puppeteer = require('puppeteer');

async function test() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('about:blank');
    
    await page.evaluate(() => {
        document.body.innerHTML = '<div class="sm:p-6">Hello</div>';
    });

    try {
        const result1 = await page.evaluate(() => document.querySelector('.sm\\:p-6').innerHTML);
        console.log("Result 1 (\\):", result1);
    } catch(e) { console.error("Error 1:", e.message); }

    try {
        const result2 = await page.evaluate(() => document.querySelector('.sm\\\\:p-6').innerHTML);
        console.log("Result 2 (\\\\):", result2);
    } catch(e) { console.error("Error 2:", e.message); }

    await browser.close();
}
test();
