import { getInput, info, setFailed } from '@actions/core';
import * as fs from 'fs';
import { dump, load } from 'js-yaml';

import { merge } from 'lodash';

// most @actions toolkit packages have async methods
async function run() {
  try {
    let values = load(fs.readFileSync(getInput('input'), 'utf8'));

    info(`Read values from '${getInput('input')}'!`);

    values = merge(values, load(getInput('values', { trimWhitespace: false })));

    info(`Writing merged values to '${getInput('output')}'...`);

    fs.writeFileSync(getInput('output'), dump(values));

    info(`Succeeded writing merged values to '${getInput('output')}'...`);
  } catch (error) {
    setFailed(error.message);
  }
}

run();
