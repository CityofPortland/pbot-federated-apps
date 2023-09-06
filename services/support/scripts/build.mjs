// copy pages to dist
import { copyFile, mkdir, readdir } from 'fs/promises';
import { dirname } from 'path';

const files = await readdir('src/pages', { recursive: true });

for (const file of files) {
  await mkdir(dirname(`dist/pages/${file}`), { recursive: true });
  copyFile(`src/pages/${file}`, `dist/pages/${file}`);
}
