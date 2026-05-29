import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const source = join(root, 'public/icon/icon-source.svg');
const outDir = join(root, 'public/icon');
const sizes = [16, 32, 48, 96, 128];

const svg = await readFile(source);
await mkdir(outDir, { recursive: true });

for (const size of sizes) {
  const png = await sharp(svg).resize(size, size).png().toBuffer();
  await writeFile(join(outDir, `${size}.png`), png);
  console.log(`Generated icon/${size}.png`);
}
