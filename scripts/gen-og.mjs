import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const b64 = (p) => readFileSync(resolve(root, p)).toString('base64');
const frauncesSemiBold = b64('node_modules/@fontsource/fraunces/files/fraunces-latin-600-normal.woff');
const dmSansMedium     = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff');

const rawSvg = readFileSync(resolve(root, 'src/assets/logo-hexagon.svg'), 'utf8');
const innerElements = rawSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '').trim();

const C = { ground: '#080501', ink: '#E8E3DD', muted: '#757069', amber: '#DA9500' };

const fontFaces = `
  @font-face { font-family: 'Fraunces'; font-weight: 600; font-style: normal;
    src: url('data:font/woff;base64,${frauncesSemiBold}'); }
  @font-face { font-family: 'DM Sans'; font-weight: 500; font-style: normal;
    src: url('data:font/woff;base64,${dmSansMedium}'); }
`;

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <style>${fontFaces}</style>
  <rect width="1200" height="630" fill="${C.ground}"/>
  <g transform="translate(100,195) scale(2.4)">${innerElements}</g>
  <text x="460" y="262" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="58" fill="${C.ink}">Randall LaPoint, Jr.</text>
  <text x="462" y="320" font-family="DM Sans, Arial, sans-serif" font-weight="500" font-size="24" letter-spacing="3" fill="${C.muted}">INTERACTIVE LEARNING DESIGNER</text>
  <text x="460" y="412" font-family="DM Sans, Arial, sans-serif" font-weight="500" font-size="22" fill="${C.amber}">randalllapointjr.dev</text>
</svg>`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
  <rect width="180" height="180" fill="${C.ground}"/>
  <g transform="translate(15,15) scale(1.5)">${innerElements}</g>
</svg>`;

await sharp(Buffer.from(ogSvg)).png().toFile(resolve(root, 'public/og-image.png'));
console.log('\u2713 public/og-image.png');
await sharp(Buffer.from(iconSvg)).png().toFile(resolve(root, 'public/apple-touch-icon.png'));
console.log('\u2713 public/apple-touch-icon.png');
