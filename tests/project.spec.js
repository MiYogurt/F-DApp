const path = require('path')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const BigNumber = require('bignumber.js')

const g = name => path.resolve(__dirname, '../compiled/', name)

const web3 = new Web3(ganache.provider())
const ProjectList = require(g('ProjectList.json'))
const Project = require(g('Project.json'))

let accounts
let projectList
let project

describe('Project Contract', () => {
  beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    projectList = await new web3.eth.Contract(JSON.parse(ProjectList.interface))
      .deploy({ data: ProjectList.bytecode })
      .send({ from: accounts[0], gas: '1000000' })

    await projectList.methods
      .createProject('Test DApp', 100, 10000, 100000)
      .send({
        from: accounts[0],
        gas: '1000000'
      })

    const [address] = await projectList.methods.getProjects().call()

    project = await new web3.eth.Contract(
      JSON.parse(Project.interface),
      address
    )
  })

  test('deploy all contract', async () => {
    expect(projectList.options.address).toBeTruthy()
    expect(project.options.address).toBeTruthy()
  })

  test('save correct project properties', async () => {
    const owner = await project.methods.owner().call()
    const description = await project.methods.description().call()
    const minInvest = await project.methods.minInvest().call()
    const maxInvest = await project.methods.maxInvest().call()
    const goal = await project.methods.goal().call()

    expect(owner).toBe(accounts[0])
    expect(description).toBe('Test DApp')
    expect(minInvest).toBe('100')
    expect(maxInvest).toBe('10000')
    expect(goal).toBe('100000')
  })

  test('allow investor to contribute', async () => {
    const investor = accounts[1]
    await project.methods.contribute().send({
      from: investor,
      value: '200'
    })

    const amount = await project.methods.investors(investor).call()
    expect(amount).toBe('200')
  })

  test('require minInvest', async () => {
    try {
      const investor = accounts[1]
      await project.methods.contribute().send({
        from: investor,
        value: '10'
      })
      expect().toBe(true)
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  test('require maxInvest', async () => {
    try {
      const investor = accounts[1]
      await project.methods.contribute().send({
        from: investor,
        value: '1000000'
      })
      expect().toBe(true)
    } catch (e) {
      expect(e).toBeDefined()
    }
  })

  test('allows investor to approve payments', async () => {
    const owner = accounts[0]
    const investor = accounts[1]
    const receiver = accounts[2]
    const oldBalance = new BigNumber(await web3.eth.getBalance(receiver))

    await project.methods.contribute().send({
      from: investor,
      value: '5000'
    })

    await project.methods.createPayment('Rent Office', 2000, receiver).send({
      from: owner,
      gas: '1000000'
    })

    await project.methods.approvePayment(0).send({
      from: investor,
      gas: '1000000'
    })

    await project.methods.doPayment(0).send({
      from: owner,
      gas: '1000000'
    })

    const payment = await project.methods.payments(0).call()
    expect(payment.completed).toBeTruthy()
    expect(payment.voterCount).toBe('1')

    const newBalance = new BigNumber(await web3.eth.getBalance(receiver))
    const balanceDiff = newBalance.minus(oldBalance)

    expect(balanceDiff.toNumber()).toBe(2000)
  })
})
