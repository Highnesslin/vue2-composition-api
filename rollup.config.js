import typescript from 'rollup-plugin-typescript'
import { uglify } from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel'
import dts from "rollup-plugin-dts"

export default[
  {
    input: './src/index.ts',
    output: {
      file: "./dist/bundle.js",
      format: "es"
    },
    external: ['vue'],
    globals: {
      vue: 'Vue'
    },
    plugins: [
      typescript(),
      babel({
        babelrc: false,
        exclude: "node_modules/**",
        presets: [
          ['@babel/preset-env', { modules: false }]
        ]
      }),
      uglify(),
    ]
  },
  {
    input: './src/index.ts',
    output: {
      file: "./dist/type.d.ts",
      format: "es"
    },
    external: ['vue'],
    globals: {
      vue: 'Vue'
    },
    plugins: [
      typescript(),
      // dts(),
    ]
  }
]
