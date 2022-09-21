import typescript from 'rollup-plugin-typescript2'
import { uglify } from 'rollup-plugin-uglify';
import { babel } from '@rollup/plugin-babel'
import dts from "rollup-plugin-dts"

export default[
  {
    input: './src/index.ts',
    output: [
      {
        file: "./dist/bundle-esm.js",
        format: "es"
      },
      {
        file: "./dist/bundle-umd.js",
        format: "umd",
        name: 'vue2-composition-api'
      }
    ],
    external: ['vue'],
    globals: {
      vue: 'Vue'
    },
    plugins: [
      typescript({
        check: false
      }),
      babel({
        babelrc: false,
        exclude: "node_modules/**",
        presets: [
          [
              '@babel/preset-env',
              {
                  'corejs': 3,
                  'useBuiltIns': 'usage'
              }
          ]
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
      dts(),
    ]
  }
]
