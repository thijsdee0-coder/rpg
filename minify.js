// Simple minifier script (runs with Node.js)
// Usage: node minify.js

const fs = require('fs');
const path = require('path');

// Read the original script
const scriptPath = path.join(__dirname, 'web', 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Simple minification (remove comments, extra whitespace, etc.)
function simpleMinify(code) {
    // Remove single-line comments (but keep URLs and important comments)
    code = code.replace(/\/\/.*$/gm, '');
    
    // Remove multi-line comments (but be careful with regex)
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove extra whitespace
    code = code.replace(/\s+/g, ' ');
    
    // Remove whitespace around operators and brackets
    code = code.replace(/\s*([{}();,=+\-*/%<>!&|?:])\s*/g, '$1');
    
    // Remove whitespace at start/end of lines
    code = code.replace(/^\s+|\s+$/gm, '');
    
    // Remove multiple consecutive spaces
    code = code.replace(/\s{2,}/g, ' ');
    
    // Remove whitespace before semicolons
    code = code.replace(/\s*;/g, ';');
    
    // Remove whitespace after opening brackets and before closing brackets
    code = code.replace(/\s*{\s*/g, '{');
    code = code.replace(/\s*}\s*/g, '}');
    code = code.replace(/\s*\(\s*/g, '(');
    code = code.replace(/\s*\)\s*/g, ')');
    
    return code.trim();
}

// Obfuscate variable names (simple approach - just shorten common patterns)
function obfuscate(code) {
    // This is a very basic obfuscation - for better results use a proper tool
    // But it makes the code harder to read
    
    // Replace common patterns with shorter names
    const replacements = {
        'gameState': 'g',
        'this.gameState': 'this.g',
        'allParties': 'p',
        'budgetSubjects': 'b',
        'currentDay': 'd',
        'partyControlPercentage': 'pc',
        'socialValue': 'sv',
        'economicValue': 'ev'
    };
    
    // Only replace in safe contexts (not in strings)
    let obfuscated = code;
    for (const [original, replacement] of Object.entries(replacements)) {
        // Replace whole word matches only
        const regex = new RegExp(`\\b${original}\\b`, 'g');
        obfuscated = obfuscated.replace(regex, replacement);
    }
    
    return obfuscated;
}

// Minify the code
console.log('Minifying script.js...');
const minified = simpleMinify(scriptContent);

// Optional: Add basic obfuscation
console.log('Adding basic obfuscation...');
const obfuscated = obfuscate(minified);

// Write minified version
const outputPath = path.join(__dirname, 'web', 'script.min.js');
fs.writeFileSync(outputPath, obfuscated, 'utf8');

console.log(`✓ Minified script written to: ${outputPath}`);
console.log(`  Original size: ${scriptContent.length} bytes`);
console.log(`  Minified size: ${obfuscated.length} bytes`);
console.log(`  Reduction: ${((1 - obfuscated.length / scriptContent.length) * 100).toFixed(1)}%`);

