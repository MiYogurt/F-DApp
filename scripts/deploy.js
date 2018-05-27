const path = require('path')
const Web3 = require('web3')
const fse = require('fs-extra')
const HDWalletProvider = require('truffle-hdwallet-provider')
const olog = require('ololog').configure({
  stringify: { print: require('q-i').stringify, precision: 2 }
})

// const contractPath = path.resolve(__dirname, '../compiled/Car.json')
const contractPath = path.resolve(__dirname, '../compiled/ProjectList.json')
const { interface, bytecode } = require(contractPath)

const provider = new HDWalletProvider(
  'lock noodle salad gain reflect mobile suspect olympic bright lawsuit script release',
  'https://rinkeby.infura.io/f9KichluPeLf9li3YNgg'
)

const web3 = new Web3(provider)

async function main() {
  const accounts = await web3.eth.getAccounts()
  olog(accounts[0])
  console.time('contract-deploy')
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })
  console.timeEnd('contract-deploy')
  olog(result.options.address)

  const contractAddress = result.options.address

  console.log('合约部署成功:', contractAddress)
  console.log(
    '合约查看地址:',
    `https://rinkeby.etherscan.io/address/${contractAddress}`
  )

  // 6. 合约地址写入文件系统
  const addressFile = path.resolve(__dirname, '../address.json')
  fs.writeFileSync(addressFile, JSON.stringify(contractAddress))
  console.log('地址写入成功:', addressFile)

  process.exit()
}

main().catch(olog.bright.red.error.noLocate)
