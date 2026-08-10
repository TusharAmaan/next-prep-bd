const puppeteer = require('puppeteer');

async function testScrape() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log("Navigating...");
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    
    // Log the HTML of the main container
    const html = await page.evaluate(() => {
        const el = document.querySelector('main') || document.body;
        return el.innerHTML.substring(0, 500);
    });
    
    console.log("HTML Start:", html);
    
    await browser.close();
}

testScrape().catch(console.error);
