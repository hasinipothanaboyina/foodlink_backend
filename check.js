const fs = require('fs');
const files = fs.readdirSync('frontend').filter(f => f.endsWith('.html'));
const missing = [];
files.forEach(f => {
  const txt = fs.readFileSync('frontend/' + f, 'utf8');
  const m = txt.match(/href=["']([^"']+\.html)["']/g);
  if (m) {
    m.forEach(l => {
      const name = l.replace(/href=["']/,'').replace(/["']/,'');
      if (!files.includes(name)) {
        missing.push({file: f, link: name});
      }
    });
  }
});
console.log(missing);
