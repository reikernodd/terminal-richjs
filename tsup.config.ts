import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    logging: 'src/logging/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  external: [
    'chalk',
    'terminal-size',
    'string-width',
    'strip-ansi',
    'ansi-escapes',
    'wrap-ansi',
    'cli-boxes',
    'marked',
    'marked-terminal',
    'highlight.js',
    'cli-spinners',
    'log-symbols',
    'node-emoji',
  ],
});
