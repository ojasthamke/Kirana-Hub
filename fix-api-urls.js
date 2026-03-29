const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const srcDir = path.join(process.cwd(), 'src', 'app');
const files = walk(srcDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    // Handle both fetch('/api/ and fetch("/api/
    content = content.replace(/fetch\(['"]\/api\//g, "fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/");
    
    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`Updated API URLs in ${file}`);
    }
});
