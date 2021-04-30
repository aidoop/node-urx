import { expect } from 'chai'
import { ROBOT_IP } from './settings'
import { UrRobot } from '../src/ur-robot'
import { sleep } from '../src/util'

describe('UrRobot Test', function () {
  describe('UrRobotTest IO Tests', function () {
    this.timeout(60000)

    it('should operate (Discrete Outputs All Set) without any issue', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()

      for (let ii = 0; ii < 8; ii++) {
        console.info(`testing discrete out #${ii}`)
        await ur.setDigitalOutput(ii, true)
        await sleep(500)
        expect(await ur.getDigitalOutput(ii, true)).to.equal(true)
      }

      ur.disconnect()
    })

    it('should operate (Discrete Outpus All Reset) without any issue', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()

      for (let ii = 0; ii < 8; ii++) {
        console.info(`testing discrete out #${ii}`)
        await ur.setDigitalOutput(ii, false)
        await sleep(500)
        expect(await ur.getDigitalOutput(ii, true)).to.equal(false)
      }

      ur.disconnect()
    })

    it('should operate (Discrete Input Check) without any issue', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()

      expect(await ur.getDigitalInBits()).to.equal(0)
      for (let ii = 0; ii < 9; ii++) {
        expect(await ur.getDigitalIn(ii)).to.equal(false)
      }

      ur.disconnect()
    })

    it('should operate (Analog Input Check) without any issue', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()

      expect(await ur.getAnalogInput(0)).equal(0)
      expect(await ur.getAnalogInput(1)).equal(0)

      ur.disconnect()
    })
  })
})
