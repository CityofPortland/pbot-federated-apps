const resolveConfig = require('tailwindcss/resolveConfig');
const tailwindConfig = require('./tailwind.config.js');

const fullConfig = resolveConfig(tailwindConfig);

console.log(fullConfig.theme.width[4]);
// => '1rem'

console.log(fullConfig.theme.screens.md);
// => '768px'

console.log(fullConfig.theme.boxShadow['2xl']);
// => '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
