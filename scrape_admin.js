const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeAdminNode() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set a large viewport so the sidebar is not collapsed
    await page.setViewport({ width: 1440, height: 900 });

    console.log("Navigating to http://localhost:3000/admin...");
    // Wait until network is idle so the initial Dashboard is fully loaded
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    
    // Wait for the main container
    await page.waitForSelector('.flex-1.p-4.sm\\:p-6.w-full');

    // 1) Capture the base HTML layout NOW before we click any tabs and risk crashing React
    console.log("Capturing base layout...");
    const baseHTML = await page.evaluate(() => {
        // We'll return the full outerHTML so we can parse it in Node
        return document.documentElement.outerHTML;
    });

    const tabs = [];
    const sectionsHTML = {};

    // We need to find all the buttons in the sidebar navigation groups
    const sidebarButtons = await page.$$('aside button');
    
    for (let i = 0; i < sidebarButtons.length; i++) {
        const tabInfo = await page.evaluate((btn) => {
            const span = btn.querySelector('span.text-sm');
            return {
                label: span ? span.innerText.trim() : 'Unknown',
                id: (span ? span.innerText.trim() : 'Unknown').toLowerCase().replace(/\s+/g, '_')
            };
        }, sidebarButtons[i]);
        
        // Skip things like the theme toggle or collapse menu that don't have text-sm spans
        if (tabInfo.label === 'Unknown' || tabInfo.id === '') continue;
        
        // Skip duplicate clicks
        if (tabs.find(t => t.id === tabInfo.id)) continue;

        tabs.push(tabInfo);
        
        console.log(`Clicking tab: ${tabInfo.label}...`);
        await page.evaluate((btn) => btn.click(), sidebarButtons[i]);
        
        // Wait for React to render the new component
        await new Promise(r => setTimeout(r, 1200));

        const contentHTML = await page.evaluate(() => {
            // The main content area
            const container = document.querySelector('.flex-1.p-4.sm\\:p-6.w-full');
            return container ? container.innerHTML : '';
        });
        
        sectionsHTML[tabInfo.id] = contentHTML;
    }

    console.log("Closing browser...");
    await browser.close();

    // 2) Now process the base HTML using DOMParser in Node
    // We strip all script tags using Regex so React doesn't try to hydrate in the new page
    console.log("Processing final HTML...");
    const safeBaseHTML = baseHTML.replace(new RegExp('<script\\\\b[\\\\s\\\\S]*?</script>', 'gi'), '');
    require('fs').writeFileSync('public/safe-base.html', safeBaseHTML, 'utf8');

    const processorBrowser = await puppeteer.launch({ headless: 'new' });
    const processorPage = await processorBrowser.newPage();
    
    // Inject the base HTML and the scraped contents into the processor page
    await processorPage.setContent(safeBaseHTML, { waitUntil: 'domcontentloaded' });
    
    const finalHTML = await processorPage.evaluate((tabs, sectionsHTML) => {
        // 1. Find the main content container
        const container = document.querySelector('.flex-1.p-4.sm\\:p-6.w-full') || document.querySelector('.w-full.relative.flex-1');
        
        if (container) {
            container.innerHTML = ''; // clear original dashboard content
            
            tabs.forEach((tab, idx) => {
                const div = document.createElement('div');
                div.id = 'section-' + tab.id;
                div.className = 'tab-content';
                if (idx !== 0) {
                    div.style.display = 'none';
                    div.classList.remove('active');
                } else {
                    div.classList.add('active');
                }
                div.innerHTML = sectionsHTML[tab.id];
                container.appendChild(div);
            });
        }
        
        // 2. Inject CSS and JS for tabs
        const style = document.createElement('style');
        style.innerHTML = `
            .tab-content { display: none; }
            .tab-content.active { display: block; animation: fadeIn 0.4s ease-in-out; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `;
        document.head.appendChild(style);
        
        const script = document.createElement('script');
        script.innerHTML = `
            function switchTab(id) {
                document.querySelectorAll('.tab-content').forEach(el => {
                    el.style.display = 'none';
                    el.classList.remove('active');
                });
                const target = document.getElementById('section-' + id);
                if (target) {
                    target.style.display = 'block';
                    target.classList.add('active');
                }
            }
        `;
        document.head.appendChild(script);
        
        // 3. Rewrite sidebar buttons to trigger switchTab
        const sidebarButtons = document.querySelectorAll('aside button');
        sidebarButtons.forEach(btn => {
            const span = btn.querySelector('span.text-sm');
            if (span) {
                const id = span.innerText.trim().toLowerCase().replace(/\\s+/g, '_');
                btn.setAttribute('onclick', "switchTab('" + id + "')");
                // Remove Next.js onClick handlers if they exist (they won't work in static HTML anyway)
                btn.removeAttribute('href');
            }
        });

        // 4. Strip Next.js scripts so they don't hydrate and crash our static HTML
        document.querySelectorAll('script').forEach(s => {
            if (s.src.includes('_next') || s.innerHTML.includes('__NEXT_DATA__') || s.innerHTML.includes('self.__next_f') || s.innerHTML.includes('_vercel') || s.src.includes('vercel')) {
                s.remove();
            }
        });

        return document.documentElement.outerHTML;
    }, tabs, sectionsHTML);

    await processorBrowser.close();

    fs.writeFileSync('public/ui-mockup.html', '<!DOCTYPE html>\\n' + finalHTML, 'utf8');
    console.log('Successfully wrote to public/ui-mockup.html!');
}

scrapeAdminNode().catch(console.error);
