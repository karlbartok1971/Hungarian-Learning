const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/data/grammar-lessons-b2');

console.log(`Checking JSON files in: ${dir}`);

try {
    const files = fs.readdirSync(dir);
    let errorCount = 0;

    files.forEach(file => {
        if (file.endsWith('.json')) {
            const filePath = path.join(dir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                JSON.parse(content);
                // console.log(`✅ ${file} is valid`);
            } catch (e) {
                console.error(`❌ ERROR in ${file}:`);
                console.error(e.message);
                errorCount++;
            }
        }
    });

    if (errorCount === 0) {
        console.log('✨ All JSON files are valid!');
    } else {
        console.log(`\nFound ${errorCount} invalid JSON files.`);
    }

} catch (e) {
    console.error('Directory not found or error reading directory:', e);
}
