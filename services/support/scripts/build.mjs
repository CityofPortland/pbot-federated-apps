// copy pages to dist
import { copyFile, readdir } from 'fs/promises';

const files = await readdir('src/pages', { recursive: true });

for (const file of files) {
  copyFile(`src/pages/${file}`, `dist/pages/${file}`);
}
