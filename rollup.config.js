import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

import pkg from './package.json';


const plugins = [
  resolve(), // so Rollup can find `ms`
  commonjs(), // so Rollup can convert `ms` to an ES module
  eslint({
    include: [
      'src/**',
    ]
  }),
  babel({
    exclude: 'node_modules/**',
  })
];

export default [
  {
    input: 'src/index.js',
    output: {
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      ...plugins,
      (process.env.NODE_ENV === 'production' && uglify())
    ]
  },
  {
    input: 'src/index.js',
    plugins: [
      ...plugins,
    ],
    output: [
      {file: pkg.main, format: 'cjs'},
      {file: pkg.module, format: 'es'}
    ]
  }
]

