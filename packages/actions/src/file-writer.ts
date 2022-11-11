import * as core from '@actions/core';
import * as fs from 'fs';
import { dump, load } from 'js-yaml';
import * as path from 'path';

// most @actions toolkit packages have async methods
async function run() {
  try {
    const yaml = load(core.getMultilineInput('input').join('\n')) as {
      [path: string]: Array<string>;
    };

    const paths = Object.keys(yaml);

    paths.forEach(p => {
      fs.mkdirSync(path.dirname(path.resolve(p)), { recursive: true });

      fs.writeFileSync(path.resolve(p), yaml[p].join('\n'));
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
