import { expect } from 'chai'
import { ROBOT_IP } from './settings'
import { UrSecondaryMonitor } from '../src/ur-secmon'

describe('UrSecondaryMonitor', function () {
  describe('Receive', function () {
    this.timeout(10000)

    it('should wait for valid data to apply robot application', async () => {
      let secMon = new UrSecondaryMonitor(ROBOT_IP)
      await secMon.connect()

      console.log(await secMon.getCatesianData(true))

      secMon.disconnect()
    })
  })
})
