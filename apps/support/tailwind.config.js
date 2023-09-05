const defaultConfig = require('../../tailwind.config');

module.exports = {
  ...defaultConfig,
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx,md}',
    './docs/**/*.{vue,ts,md}',
    '../../packages/components/src/**/*.{vue,js,ts,jsx,tsx,md}',
    '../../services/support/src/**/*.{vue,js,ts,jsx,tsx,md}',
  ],
};
