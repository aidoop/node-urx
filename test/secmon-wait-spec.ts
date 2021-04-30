import { expect } from 'chai'
import { ROBOT_IP } from './settings'
import { UrSecondaryMonitor } from '../src/ur-secmon'
import { sleep } from '../src/util'

describe('UrSecondaryMonitor', function () {
  describe('Wait Event', function () {
    this.timeout(5000)
    it('should happen timeout of (wait) without any event', async () => {
      var secMon = new UrSecondaryMonitor(ROBOT_IP)
      let timeout = false
      try {
        await secMon.wait(3000)
      } catch (error) {
        console.log(error)
        timeout = true
      }
      expect(timeout).to.equal(true)
    })

    it('should not happen timeout of (wait) with any event', async () => {
      var secMon = new UrSecondaryMonitor(ROBOT_IP)
      setTimeout(() => secMon.emitReceivedEvent(), 2000)

      let timeout = false
      try {
        await secMon.wait(3000)
      } catch (error) {
        timeout = true
      }
      expect(timeout).to.equal(false)
    })
  })
})
