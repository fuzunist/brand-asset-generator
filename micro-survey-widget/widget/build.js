const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

async function buildWidget() {
    console.log('Building BrandOS Survey Widget...');
    
    try {
        // Read the source file
        const sourcePath = path.join(__dirname, 'widget.js');
        const sourceCode = fs.readFileSync(sourcePath, 'utf8');
        
        // Minify the code
        const result = await minify(sourceCode, {
            compress: {
                drop_console: false, // Keep console for debugging
                drop_debugger: true,
                passes: 2
            },
            mangle: {
                toplevel: true
            },
            format: {
                comments: false
            }
        });
        
        if (result.error) {
            throw result.error;
        }
        
        // Write minified version
        const outputPath = path.join(__dirname, 'widget.min.js');
        fs.writeFileSync(outputPath, result.code);
        
        // Calculate sizes
        const originalSize = Buffer.byteLength(sourceCode, 'utf8');
        const minifiedSize = Buffer.byteLength(result.code, 'utf8');
        const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
        
        console.log(`✓ Widget built successfully!`);
        console.log(`  Original size: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`  Minified size: ${(minifiedSize / 1024).toFixed(2)} KB`);
        console.log(`  Size reduction: ${reduction}%`);
        
        // Create a versioned copy for CDN deployment
        const version = '1.0.0';
        const versionedPath = path.join(__dirname, `widget-${version}.min.js`);
        fs.copyFileSync(outputPath, versionedPath);
        console.log(`✓ Created versioned file: widget-${version}.min.js`);
        
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

// Run the build
buildWidget();