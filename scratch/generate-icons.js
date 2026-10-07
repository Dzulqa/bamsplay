/**
 * generate-icons.js
 * Generates all PWA + APK icon sizes from bamsplay-icon.svg using sharp.
 *
 * Run: node scratch/generate-icons.js
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SVG_PATH = path.join(__dirname, "../public/bamsplay-icon.svg");
const ICONS_DIR = path.join(__dirname, "../public/icons");

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
  console.log("Created /public/icons directory");
}

const svgBuffer = fs.readFileSync(SVG_PATH);

// ──────────────────────────────────────────────────────────────
// Icon sizes needed:
//  PWA:        72, 96, 128, 144, 152, 192, 384, 512
//  Apple PWA:  120, 152, 167, 180
//  APK/TWA:    48, 72, 96, 144, 192, 512, 1024
//  Favicon:    16, 32, 48
// ──────────────────────────────────────────────────────────────
const SIZES = [16, 32, 48, 72, 96, 120, 128, 144, 152, 167, 180, 192, 384, 512, 1024];

async function generateIcons() {
  console.log("🎨 Generating Bamsplay icons...\n");

  const tasks = SIZES.map(async (size) => {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(svgBuffer, { density: 300 })
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✅ icon-${size}x${size}.png`);
    return outputPath;
  });

  await Promise.all(tasks);

  // Also generate maskable icon (padded ~20% for safe zone)
  const maskableSizes = [192, 512];
  for (const size of maskableSizes) {
    const safeSize = Math.round(size * 0.8);
    const pad = Math.round((size - safeSize) / 2);
    const outputPath = path.join(ICONS_DIR, `maskable-${size}x${size}.png`);

    // Render icon smaller (80%), center on solid purple background
    const iconBuf = await sharp(svgBuffer, { density: 300 })
      .resize(safeSize, safeSize)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 43, g: 0, b: 128, alpha: 1 }, // #2b0080
      },
    })
      .composite([{ input: iconBuf, top: pad, left: pad }])
      .png()
      .toFile(outputPath);

    console.log(`  ✅ maskable-${size}x${size}.png`);
  }

  // Generate favicon.ico-equivalent PNGs
  const faviconPath = path.join(__dirname, "../public/favicon.png");
  await sharp(svgBuffer, { density: 300 }).resize(32, 32).png().toFile(faviconPath);
  console.log(`  ✅ favicon.png (32x32)`);

  // Generate splash logo density assets
  const logoSource = path.join(__dirname, "../public/bamsplay-logo-circle.png");
  if (fs.existsSync(logoSource)) {
    const splashDensities = [
      { folder: "drawable-mdpi", size: 128 },
      { folder: "drawable-hdpi", size: 192 },
      { folder: "drawable-xhdpi", size: 256 },
      { folder: "drawable-xxhdpi", size: 384 },
      { folder: "drawable-xxxhdpi", size: 512 },
      { folder: "drawable", size: 128 },
    ];
    for (const d of splashDensities) {
      const outDir = path.join(__dirname, `../android/app/src/main/res/${d.folder}`);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      await sharp(logoSource)
        .resize(d.size, d.size, { fit: "contain" })
        .png()
        .toFile(path.join(outDir, "splash_logo.png"));
      console.log(`  ✅ splash_logo.png (${d.size}x${d.size}) -> ${d.folder}`);
    }
  }

  console.log(`\n✨ All icons and splash assets generated!`);
  console.log(`   Total: ${SIZES.length + maskableSizes.length + 1} files`);
}

generateIcons().catch((err) => {
  console.error("❌ Error generating icons:", err);
  process.exit(1);
});
