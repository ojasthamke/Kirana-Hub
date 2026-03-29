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
    if (content.includes('@/lib/')) {
        content = content.replace(/@\/lib\//g, '../../../../lib/');
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});

const componentsDir = path.join(process.cwd(), 'src', 'components');
const compFiles = walk(componentsDir).filter(f => f.endsWith('.tsx'));
compFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('@/lib/')) {
        // components/layout/Navbar.tsx -> 2 levels to src/
        content = content.replace(/@\/lib\//g, '../../lib/');
        fs.writeFileSync(file, content);
        console.log(`Updated component ${file}`);
    }
});

const appDir = path.join(process.cwd(), 'src', 'app');
const appFiles = fs.readdirSync(appDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
appFiles.forEach(file => {
    const filePath = path.join(appDir, file);
    if (!fs.statSync(filePath).isFile()) return;
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('@/context/')) {
        content = content.replace(/@\/context\//g, '../context/');
        fs.writeFileSync(filePath, content);
        console.log(`Updated app ${filePath}`);
    }
    if (content.includes('@/lib/')) {
        content = content.replace(/@\/lib\//g, '../lib/');
        fs.writeFileSync(filePath, content);
        console.log(`Updated app lib ${filePath}`);
    }
});
