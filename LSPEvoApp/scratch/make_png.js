const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Create a 1024x1024 PNG icon with a sleek dark gradient & rainbow spectrum stripe
const width = 1024;
const height = 1024;
const png = new PNG({ width, height });

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (width * y + x) << 2;
    
    // Dark background gradient
    let r = 11;
    let g = 11;
    let b = 14;

    // Rainbow wave stripe through center
    const cx = x / width;
    const cy = y / height;
    const waveY = 0.5 + 0.15 * Math.sin(cx * Math.PI * 2);
    const distToWave = Math.abs(cy - waveY);

    if (distToWave < 0.08) {
      const alpha = 1 - (distToWave / 0.08);
      // HSL to RGB along wave
      const hue = cx * 360;
      const [wr, wg, wb] = hslToRgb(hue / 360, 0.9, 0.55);
      r = Math.min(255, Math.round(r * (1 - alpha) + wr * alpha));
      g = Math.min(255, Math.round(g * (1 - alpha) + wg * alpha));
      b = Math.min(255, Math.round(b * (1 - alpha) + wb * alpha));
    }

    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = 255;
  }
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

const outputPath = path.join(__dirname, '..', 'assets', 'icon.png');
png.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
  console.log('Successfully created valid PNG at', outputPath);
});
