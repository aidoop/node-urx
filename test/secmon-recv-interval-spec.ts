import { expect } from 'chai'
import { ROBOT_IP } from './settings'
import { UrSecondaryMonitor } from '../src/ur-secmon'
import { sleep } from '../src/util'

describe('UrSecondaryMonitorParser', function () {
  describe('#intervalReceive()', async function () {
    this.timeout(10000)

    it('should run without any error', async () => {
      var secMon = new UrSecondaryMonitor(ROBOT_IP)
      await secMon.connect()

      let exitCount = 0
      while (true) {
        if (exitCount > 1) {
          break
        }
        await sleep(1000)
        console.log('exitCount: ', exitCount)
        exitCount++
      }

      secMon.disconnect()
    })
  })
})
