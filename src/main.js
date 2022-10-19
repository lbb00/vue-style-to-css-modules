import { program } from 'commander'
import glob from 'glob'
import fs from 'node:fs'

import transform from './transform'

program.option('-f,--file <file>')

program.parse()

const { file } = program.opts()

if (!file) {
  console.log('Please specify a file')
}

glob.sync(file).forEach((f) => {
  fs.writeFileSync(f, transform(fs.readFileSync(f, 'utf-8').toString()))
})
