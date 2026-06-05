const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return;

  const dir = path.dirname(filePath);
  const name = path.basename(filePath, ext);
  const outputPath = path.join(dir, `${name}.webp`);

  try {
    await sharp(filePath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    fs.unlinkSync(filePath);

    const relativePath = filePath.replace(/\\/g, '/');
    const newRelativePath = path.join(dir, `${name}.webp`).replace(/\\/g, '/');
    return { original: relativePath, compressed: newRelativePath };
  } catch (err) {
    console.error('Error comprimiendo imagen:', err.message);
    return null;
  }
}

module.exports = { compressImage };
