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

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
const files = walk(apiDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    // Replace ../../../../lib/ with @/lib/
    content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/lib\//g, '@/lib/');
    // Also check for ../../../lib/ just in case
    content = content.replace(/\.\.\/\.\.\/\.\.\/lib\//g, '@/lib/');
    
    if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`Fixed imports in ${file}`);
    }
});
