const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  const svgPath = path.join(__dirname, '../public/favicon.svg');
  const icoPath = path.join(__dirname, '../public/favicon.ico');
  const pngPath = path.join(__dirname, '../public/favicon-temp.png');

  try {
    console.log('📦 Reading SVG file...');
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate PNG at 32x32 (standard favicon size)
    console.log('🔄 Converting SVG to PNG (32x32)...');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(pngPath);

    // For ICO, we need to use the PNG as base
    // Sharp doesn't directly support ICO, so we'll create a 32x32 PNG
    // and rename it with proper ICO structure
    console.log('🔄 Converting PNG to ICO format...');
    const pngBuffer = fs.readFileSync(pngPath);

    // ICO header for single image
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);  // Reserved
    header.writeUInt16LE(1, 2);  // Type: 1 = ICO
    header.writeUInt16LE(1, 4);  // Number of images

    // ICO directory entry
    const dirEntry = Buffer.alloc(16);
    dirEntry.writeUInt8(32, 0);   // Width
    dirEntry.writeUInt8(32, 1);   // Height
    dirEntry.writeUInt8(0, 2);    // Color palette
    dirEntry.writeUInt8(0, 3);    // Reserved
    dirEntry.writeUInt16LE(1, 4); // Color planes
    dirEntry.writeUInt16LE(32, 6); // Bits per pixel
    dirEntry.writeUInt32LE(pngBuffer.length, 8); // Size of image data
    dirEntry.writeUInt32LE(22, 12); // Offset of image data

    // Combine header, directory, and PNG data
    const icoBuffer = Buffer.concat([header, dirEntry, pngBuffer]);
    fs.writeFileSync(icoPath, icoBuffer);

    // Clean up temp PNG
    fs.unlinkSync(pngPath);

    console.log('✅ favicon.ico generated successfully!');
    console.log(`   Location: ${icoPath}`);

  } catch (error) {
    console.error('❌ Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
