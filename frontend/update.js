const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/hasin/OneDrive/Desktop/foodlink-ai-main/frontend';
const stylePath = path.join(dir, 'style.css');

if (fs.existsSync(stylePath)) {
  let styleContent = fs.readFileSync(stylePath, 'utf8');

  styleContent = styleContent.replace(/:root\s*\{[\s\S]*?\}/, `:root {
  --primary: #2563EB;
  --secondary: #F59E0B;
  --background: #F8FAFC;
  --surface: #FFFFFF;
  --text-main: #0F172A;
  --text-muted: #64748B;
  --border: rgba(15, 23, 42, 0.1);
  
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  --transition: all 0.2s ease-in-out;
  --font-serif: var(--font-sans);
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}`);

  styleContent = styleContent.replace(/background:\s*rgba\(251,\s*247,\s*240,\s*0\.85\);/, 'background: rgba(248, 250, 252, 0.85);');
  
  styleContent = styleContent.replace(/padding:\s*0\.75rem\s*1\.5rem;/, 'padding: 0.6rem 1.2rem;');
  styleContent = styleContent.replace(/border-radius:\s*var\(--radius-full\);\n\s*font-weight:\s*600;/g, 'border-radius: var(--radius-md);\n  font-weight: 500;');
  
  styleContent = styleContent.replace(/box-shadow:\s*0\s*4px\s*14px\s*rgba\(45,\s*90,\s*74,\s*0\.2\);/, 'box-shadow: var(--shadow-sm);');
  styleContent = styleContent.replace(/background:\s*#204035;\n\s*transform:\s*translateY\(-2px\);\n\s*box-shadow:\s*0\s*6px\s*20px\s*rgba\(45,\s*90,\s*74,\s*0\.3\);/, 'background: #1D4ED8;\n  transform: translateY(-1px);\n  box-shadow: var(--shadow-md);');
  
  styleContent = styleContent.replace(/box-shadow:\s*0\s*4px\s*14px\s*rgba\(232,\s*112,\s*74,\s*0\.2\);/, 'box-shadow: var(--shadow-sm);');
  styleContent = styleContent.replace(/background:\s*#cf623f;\n\s*transform:\s*translateY\(-2px\);/, 'background: #D97706;\n  transform: translateY(-1px);\n  box-shadow: var(--shadow-md);');
  
  styleContent = styleContent.replace(/background:\s*rgba\(45,\s*90,\s*74,\s*0\.05\);/g, 'background: rgba(37, 99, 235, 0.05);');
  styleContent = styleContent.replace(/border:\s*1\.5px\s*solid\s*var\(--primary\);/, 'border: 1px solid var(--primary);');
  
  styleContent = styleContent.replace(/border:\s*1\.5px\s*solid\s*var\(--border\);/, 'border: 1px solid var(--border);');
  styleContent = styleContent.replace(/border-color:\s*var\(--secondary\);\n\s*box-shadow:\s*0\s*0\s*0\s*3px\s*rgba\(232,\s*112,\s*74,\s*0\.1\);/, 'border-color: var(--primary);\n  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);');
  
  styleContent = styleContent.replace(/background:\s*rgba\(45,\s*90,\s*74,\s*0\.08\);/g, 'background: rgba(37, 99, 235, 0.08);');
  styleContent = styleContent.replace(/background:\s*rgba\(45,\s*90,\s*74,\s*0\.15\);/g, 'background: rgba(37, 99, 235, 0.15);');
  
  styleContent = styleContent.replace(/linear-gradient\(to right, rgba\(251, 247, 240, 0\.95\) 0%, rgba\(251, 247, 240, 0\.7\) 100%\)/, 'linear-gradient(to right, rgba(248, 250, 252, 0.95) 0%, rgba(248, 250, 252, 0.7) 100%)');
  
  styleContent = styleContent.replace(/\.choice-icon\s*\{[\s\S]*?border-radius:\s*50%;/g, (match) => match.replace('border-radius: 50%;', 'border-radius: var(--radius-md);'));
  styleContent = styleContent.replace(/\.metric-icon\s*\{[\s\S]*?border-radius:\s*50%;/g, (match) => match.replace('border-radius: 50%;', 'border-radius: var(--radius-md);'));
  
  styleContent = styleContent.replace(/background:\s*rgba\(45,\s*90,\s*74,\s*0\.1\);/g, 'background: rgba(37, 99, 235, 0.1);');
  styleContent = styleContent.replace(/background:\s*rgba\(45,\s*90,\s*74,\s*0\.03\);/, 'background: rgba(15, 23, 42, 0.03);');

  fs.writeFileSync(stylePath, styleContent);
  console.log('Updated style.css');
}

const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  const filePath = path.join(dir, file);
  let htmlContent = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  if (htmlContent.includes('45, 90, 74') || htmlContent.includes('45,90,74')) {
    htmlContent = htmlContent.replace(/rgba\(\s*45\s*,\s*90\s*,\s*74\s*,/g, 'rgba(37, 99, 235,');
    changed = true;
  }
  
  if (htmlContent.includes('#2D5A4A') || htmlContent.includes('#2d5a4a')) {
    htmlContent = htmlContent.replace(/#2D5A4A/gi, '#2563EB');
    changed = true;
  }
  
  if (htmlContent.includes('#E8704A') || htmlContent.includes('#e8704a')) {
    htmlContent = htmlContent.replace(/#E8704A/gi, '#F59E0B');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, htmlContent);
    console.log(`Updated inline styles in ${file}`);
  }
}
