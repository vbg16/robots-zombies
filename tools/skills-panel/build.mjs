import { build } from 'esbuild';
await build({ entryPoints: ['main.tsx'], bundle: true, minify: true, outfile: 'panel.js', jsx: 'automatic', legalComments: 'eof', target: ['es2020'] });
