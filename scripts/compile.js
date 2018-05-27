const fse = require('fs-extra')
const path = require('path')
const solc = require('solc')

const compiledDir = path.resolve(__dirname, '../compiled')
fse.removeSync(compiledDir)
fse.ensureDirSync(compiledDir)

const contractFiles = fse.readdirSync(path.resolve(__dirname, '../contracts'))

const compileFile = contractFile => {
  const contractPath = path.resolve(__dirname, '../contracts', contractFile)
  const contractSource = fse.readFileSync(contractPath, 'utf8')
  const result = solc.compile(contractSource, 1)
  console.log(`file compiled: ${contractFile}`)

  const PrettyError = require('pretty-error')
  const pe = new PrettyError()

  if (Array.isArray(result.errors) && result.errors.length) {
    console.log(pe.render(result.errors[0]))
  }

  Object.keys(result.contracts).forEach(name => {
    const contractName = name.replace(/^:/, '')
    const filePath = path.resolve(compiledDir, `${contractName}.json`)
    fse.outputJsonSync(filePath, result.contracts[name])
    console.log(
      `save compiled contract ${contractName} to ${filePath.replace(
        '/Users/Yugo/Desktop/ethereum-contract-workflow',
        ''
      )}`
    )
  })
}

contractFiles.forEach(compileFile)
