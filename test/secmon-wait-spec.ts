import { expect } from 'chai'
import { ROBOT_IP } from './settings'
import { UrSecondaryMonitor } from '../src/ur-secmon'
import { sleep } from '../src/util'

describe('UrSecondaryMonitor', function () {
  describe('#wait()', function () {
    this.timeout(10000)

    it('should return binary string', async () => {
      var secMon = new UrSecondaryMonitor(ROBOT_IP)
      await secMon.connect()

      await secMon.wait()

      secMon.disconnect()
    })
  })
})
