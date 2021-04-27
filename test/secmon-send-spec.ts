import { expect } from 'chai'
import { ROBOT_IP } from './settings'
import { UrSecondaryMonitor } from '../src/ur-secmon'
import { sleep } from '../src/util'

describe('UrSecondaryMonitor', function () {
  describe('#send()', async function () {
    this.timeout(10000)

    it('should send data without any error', async () => {
      var secMon = new UrSecondaryMonitor(ROBOT_IP)
      await secMon.connect()

      console.log(
        'sendMessage: ',
        await secMon.sendMessage('movel(p[0.356, -0.093, 0.365, 1.995, -2.508, 0.091], a=1.2, v=0.25, t=0, r=0)\r\n')
      )

      secMon.disconnect()
    })
  })
})
