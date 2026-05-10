import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const fontPath = resolve(root, 'node_modules/@fontsource/inter/files/inter-latin-600-normal.woff');
const fontB64 = readFileSync(fontPath).toString('base64');

const rawSvg = readFileSync(resolve(root, 'src/assets/logo-hexagon.svg'), 'utf8');
const innerElements = rawSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '').trim();

// OG image: 1200x630, hexagon left-third, text right two-thirds
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <style>
    @font-face {
      font-family: 'Inter';
      font-weight: 600;
      src: url('data:font/woff;base64,${fontB64}');
    }
  </style>
  <rect width="1200" height="630" fill="#0a0a0f"/>
  <g transform="translate(140,215) scale(2)">${innerElements}</g>
  <text x="460" y="270" font-family="Inter, Liberation Sans, DejaVu Sans, Arial, Helvetica, sans-serif" font-weight="600" font-size="52" fill="#f0ece4">Randall LaPoint, Jr.</text>
  <text x="460" y="330" font-family="Inter, Liberation Sans, DejaVu Sans, Arial, Helvetica, sans-serif" font-weight="600" font-size="28" fill="#a89e90">Interactive Learning Designer</text>
  <text x="460" y="410" font-family="Inter, Liberation Sans, DejaVu Sans, Arial, Helvetica, sans-serif" font-weight="600" font-size="22" fill="#d4962a">randalllapointjr.dev</text>
</svg>`;

// Apple touch icon: 180x180, hexagon centered
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
  <rect width="180" height="180" fill="#0a0a0f"/>
  <g transform="translate(30,30) scale(1.2)">${innerElements}</g>
</svg>`;

await sharp(Buffer.from(ogSvg)).png().toFile(resolve(root, 'public/og-image.png'));
console.log('✓ public/og-image.png');

await sharp(Buffer.from(iconSvg)).png().toFile(resolve(root, 'public/apple-touch-icon.png'));
console.log('✓ public/apple-touch-icon.png');
