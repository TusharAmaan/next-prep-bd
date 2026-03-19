const fs = require('fs');
const path = require('path');

const adminPath = 'components/admin';
const sharedPath = 'components/shared';

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Backgrounds
    content = content.replace(/\bbg-white\b(?! dark:)/g, 'bg-white dark:bg-slate-900');
    content = content.replace(/\bbg-slate-50\b(?! dark:)/g, 'bg-slate-50 dark:bg-slate-800/50');
    content = content.replace(/\bbg-slate-100\b(?! dark:)/g, 'bg-slate-100 dark:bg-slate-800');
    
    // Text
    content = content.replace(/\btext-slate-900\b(?! dark:)/g, 'text-slate-900 dark:text-white');
    content = content.replace(/\btext-slate-800\b(?! dark:)/g, 'text-slate-800 dark:text-slate-100');
    content = content.replace(/\btext-slate-700\b(?! dark:)/g, 'text-slate-700 dark:text-slate-300');
    content = content.replace(/\btext-slate-600\b(?! dark:)/g, 'text-slate-600 dark:text-slate-400');
    content = content.replace(/\btext-slate-500\b(?! dark:)/g, 'text-slate-500 dark:text-slate-400');
    content = content.replace(/\btext-slate-400\b(?! dark:)/g, 'text-slate-400 dark:text-slate-500');

    // Borders
    content = content.replace(/\bborder-slate-100\b(?! dark:)/g, 'border-slate-100 dark:border-slate-800');
    content = content.replace(/\bborder-slate-200\b(?! dark:)/g, 'border-slate-200 dark:border-slate-700');
    content = content.replace(/\bborder-slate-300\b(?! dark:)/g, 'border-slate-300 dark:border-slate-600');
    
    // Dividers/Dividing lines represented as divs with bg
    content = content.replace(/\bbg-slate-200\b(?! dark:)/g, 'bg-slate-200 dark:bg-slate-700');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated ${filePath}`);
    }
}

console.log('--- STARTING DARK MODE AUDIT ---');
processDirectory(adminPath);
processDirectory(sharedPath);
// Also include UserManagement index if it's in components root
const umPath = 'components/UserManagement.tsx';
if (fs.existsSync(umPath)) processFile(umPath);

console.log('--- DARK MODE AUDIT COMPLETE ---');
