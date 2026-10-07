import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('node_modules/@ffmpeg/core/dist/umd');
const destination = resolve('public/vendor/ffmpeg');

await mkdir(destination, { recursive: true });
await Promise.all(
  ['ffmpeg-core.js', 'ffmpeg-core.wasm'].map((file) =>
    copyFile(resolve(source, file), resolve(destination, file))
  )
);
