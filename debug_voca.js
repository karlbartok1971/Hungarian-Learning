const fs = require('fs');
const path = require('path');

console.log('--- DIAGNOSTIC START ---');
console.log('Current Work Dir (CWD):', process.cwd());

const possiblePaths = [
    path.join(process.cwd(), 'backend/src/data/vocabulary/a1.json'),
    path.join(process.cwd(), 'src/data/vocabulary/a1.json'),
    path.join(__dirname, 'backend/src/data/vocabulary/a1.json'),
];

let found = false;

possiblePaths.forEach(p => {
    console.log(`Checking path: ${p}`);
    if (fs.existsSync(p)) {
        console.log(`✅ FILE FOUND at: ${p}`);
        const content = fs.readFileSync(p, 'utf-8');
        console.log('File Content Preview:', content.substring(0, 50) + '...');
        found = true;
    } else {
        console.log(`❌ File NOT found at: ${p}`);
    }
});

if (!found) {
    console.error('🚨 TEST FAILED: Canvas file reading failed everywhere.');
} else {
    console.log('🎉 TEST SUCCESS: File is readable.');
}
console.log('--- DIAGNOSTIC END ---');
