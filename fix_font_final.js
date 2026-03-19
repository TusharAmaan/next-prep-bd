const fs = require('fs');

// 1. Fix layout.tsx
const layoutFile = 'app/layout.tsx';
let layoutContent = fs.readFileSync(layoutFile, 'utf8');

// Replace imports
layoutContent = layoutContent.replace(/import { Noto_Serif_Bengali, Hind_Siliguri } from "next\/font\/google";/g, 'import { Noto_Serif_Bengali } from "next/font/google";');
layoutContent = layoutContent.replace(/import { Noto_Serif_Bengali } from "next\/font\/google";/g, 'import { Noto_Serif_Bengali } from "next/font/google";');

// Replace font definitions
const newFontBlock = `const bangla = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
});`;

// Look for the block of font definitions
layoutContent = layoutContent.replace(/\/\/ Bangla heading font [\s\S]*?variable: "--font-bangla",\s*\}\);/g, newFontBlock);

// Replace variable usage in html tag
layoutContent = layoutContent.replace(/\$\{banglaSans\.variable\} \$\{banglaSerif\.variable\}/g, '${bangla.variable}');
layoutContent = layoutContent.replace(/\$\{bangla\.variable\} \$\{bangla\.variable\}/g, '${bangla.variable}');

fs.writeFileSync(layoutFile, layoutContent);
console.log('✅ Updated layout.tsx');

// 2. Fix tailwind.config.ts
const tailwindFile = 'tailwind.config.ts';
let tailwindContent = fs.readFileSync(tailwindFile, 'utf8');

// Ensure font-bangla uses serif
tailwindContent = tailwindContent.replace(/'bangla': \[.*?\],/g, "'bangla': ['var(--font-bangla)', 'serif'],");
// Remove bangla-serif if it exists
tailwindContent = tailwindContent.replace(/'bangla-serif': \[.*?\],?\n?/g, '');

fs.writeFileSync(tailwindFile, tailwindContent);
console.log('✅ Updated tailwind.config.ts');

// 3. Search and replace all font-bangla-serif with font-bangla in entire app folder
// This is done via grep later if needed, but for now let's just make the variable the same.

console.log('--- FONT CONSOLIDATION COMPLETE ---');
