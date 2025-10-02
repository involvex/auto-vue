import * as fs from 'node:fs'
import * as path from 'node:path'
import { defineConfig, RolldownPlugin } from 'rolldown'
import license from 'rollup-plugin-license'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json')

const CORE_LICENSE = `MIT License

Copyright (c) 2025 involvex

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`

const cc0LicenseText = `

`.trim()

export default defineConfig({
  input: 'index.ts',
  output: {
    format: 'esm',
    file: 'bin/create-autovue.js',
    sourcemap: false,
    banner: `/*!
 * @involvex/autovue v${packageJson.version}
 * Full automated Vue Setup with 3 git branches: main, dev, github pages
 * 
 * Copyright (c) 2025 involvex
 * Licensed under MIT License
 * 
 * GitHub: https://github.com/involvex/auto-vue
 * NPM: https://www.npmjs.com/package/@involvex/auto-vue
 */`,
  },
  platform: 'node',
  plugins: [
    license({
      thirdParty: {
        includePrivate: false,
        output: {
          file: path.join(__dirname, 'LICENSE'),
          template(allDependencies) {
            // There's a bug in the plugin that it also includes the `create-vue` package itself
            const dependencies = allDependencies.filter((d) => d.name !== 'create-vue')
            const licenseText =
              `# @involvex/autovue core license\n\n` +
              `@involvex/autovue is released under the MIT license:\n\n` +
              CORE_LICENSE +
              `\n## Attribution\n\n` +
              `This project is based on create-vue, the official Vue.js project scaffolding tool.\n` +
              `create-vue is created by Evan You and the Vue.js team, and is licensed under the MIT license.\n` +
              `We acknowledge and thank the Vue.js team for their excellent work.\n\n` +
              `## License of the files in the directories template in create-vue\n\n` +
              `The files in the directories template in create-autovue and files\n` +
              `generated from those files are licensed under the CC0 1.0 Universal license:\n` +
              `\n${cc0LicenseText}\n` +
              `\n## Licenses of bundled dependencies\n\n` +
              `The published create-vautoue artifact additionally contains code with the following licenses:\n` +
              Array.from(new Set(dependencies.map((dependency) => dependency.license))).join(', ') +
              '\n\n' +
              `## Bundled dependencies\n\n` +
              dependencies
                .map((dependency) => {
                  return (
                    `## ${dependency.name}\n\n` +
                    `License: ${dependency.license}\n` +
                    `By: ${dependency.author?.name}\n` +
                    `Repository: ${
                      typeof dependency.repository === 'string'
                        ? dependency.repository
                        : dependency.repository?.url
                    }\n\n` +
                    dependency
                      .licenseText!.split('\n')
                      .map((line) => (line ? `> ${line}` : '>'))
                      .join('\n')
                  )
                })
                .join('\n\n')

            return licenseText
          },
        },
      },
    }) as RolldownPlugin,

    {
      name: '@vue/create-eslint-config fix',
      transform: {
        filter: {
          id: /@vue.create-eslint-config.renderEjsFile\.js$/,
        },
        handler(_code, id) {
          const pkgDir = path.dirname(id)
          const templatesDir = path.resolve(pkgDir, './templates')

          const allTemplateFileNames = fs.readdirSync(templatesDir)
          const templateFiles = Object.fromEntries(
            allTemplateFileNames.map((fileName) => {
              const content = fs.readFileSync(path.resolve(templatesDir, fileName), 'utf8')
              return [`./templates/${fileName}`, content]
            }),
          )

          return `
            import ejs from 'ejs'
            const templates = ${JSON.stringify(templateFiles)}
            export default function renderEjsFile(filePath, data) {
              return ejs.render(templates[filePath], data, {})
            }
          `
        },
      },
    },
  ],
})
