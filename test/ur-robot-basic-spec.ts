import { expect } from 'chai'
import { ROBOT_IP } from './settings'
import { UrRobot } from '../src/ur-robot'
import { sleep } from '../src/util'

describe('UrRobot Test', function () {
  describe('UrRobot Basic Tests', function () {
    this.timeout(60000)
    it('should set the robot flags using multiple functions', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()
      expect(await ur.isRunning()).equal(true)

      await ur.setFreeDrive(true)
      await sleep(3000)
      await ur.setFreeDrive(false)

      await ur.setSimulation(true)
      await sleep(3000)
      await ur.setSimulation(false)

      ur.disconnect()
    })
  })
})
