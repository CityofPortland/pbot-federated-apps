import { RollupOptions } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const config: RollupOptions = {
  input: ['src/secret-writer.ts', 'src/merge-values.ts'],
  output: {
    dir: 'out',
    format: 'esm',
    compact: true,
    sourcemap: false,
  },
  plugins: [
    terser(),
    commonjs(),
    nodeResolve({ preferBuiltins: true }),
    typescript({
      tsconfig: 'tsconfig.build.json',
    }),
  ],
};

export default config;
