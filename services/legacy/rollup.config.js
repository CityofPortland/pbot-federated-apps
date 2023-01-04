import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json';

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/index.ts',
  plugins: [nodeResolve(), typescript()],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  output: {
    format: 'esm',
    dir: 'dist',
    exports: 'auto',
    sourcemap: process.env.NODE_ENV != 'production',
  },
};

export default config;
