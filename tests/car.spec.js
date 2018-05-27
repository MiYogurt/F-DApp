const path = require('path')
const Web3 = require('web3')
const EventEmitter = require('events')
const ganache = require('ganache-cli')

const contractPath = path.resolve(__dirname, '../compiled/Car.json')

const { interface: I, bytecode } = require(contractPath)

const web3 = new Web3(ganache.provider())

let accounts
let contract
const initBrand = 'AUDI'

describe('contract', function() {
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    contract = await new web3.eth.Contract(JSON.parse(I))
      .deploy({ data: bytecode, arguments: [initBrand] })
      .send({ from: accounts[0], gas: '1000000' })
  })

  test('deploy a contract', () => {
    expect(contract.options.address).toBeTruthy()
  })

  test('has initial brand', async () => {
    const brand = await contract.methods.brand().call()
    expect(brand).toBe(initBrand)
  })

  test('can change the brand', async () => {
    const newBrand = 'BWM'
    await contract.methods.setBrand(newBrand).send({ from: accounts[0] })
    const brand = await contract.methods.brand().call()
    expect(brand).toBe(newBrand)
  })
})
