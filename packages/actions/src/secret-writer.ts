import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';

// most @actions toolkit packages have async methods
async function run() {
  try {
    const variables = core.getMultilineInput('variables');
    const output = core.getInput('output');

    fs.mkdirSync(output, { recursive: true });

    variables.forEach((input) => {
      let [p, d] = input.split('=');

      p = path.resolve(output, p);

      core.info(`Writing to ${p}...`);

      fs.writeFile(p, d, (err) => {
        if (err) throw err;
        core.info(`Succeeded writing to ${p}!`);
      });
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
