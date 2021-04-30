import { expect } from 'chai'
import { ROBOT_IP } from './settings'
import { UrRobot } from '../src/ur-robot'
import { sleep } from '../src/util'

describe('UrRobot Test', function () {
  describe('UrRobotTest Move Tests', function () {
    this.timeout(60000)

    it('should operate (movel relative = false) without any issue', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()

      let inputPose = await ur.getl(true)
      inputPose[2] += 0.1
      await ur.movel(inputPose, 0.1, 0.1, true, false)
      inputPose[2] -= 0.1
      await ur.movel(inputPose, 0.1, 0.1, true, false)

      ur.disconnect()
    })

    it('should operate (movel relative = true) without any issue', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()

      let inputPose = [0.05, 0.0, 0.0, 0.0, 0.0, 0.0]
      await ur.movel(inputPose, 0.1, 0.1, true, true)
      inputPose = [-0.05, 0.0, 0.0, 0.0, 0.0, 0.0]
      await ur.movel(inputPose, 0.1, 0.1, true, true)

      ur.disconnect()
    })

    it('should operate (movej relative = false) without any issue', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()

      let firstJoints = await ur.getj()
      let targetJ = [0, 1.57, -1.57, 3.14, -1.57, 1.57]
      await ur.movej(targetJ, 1.4, 1.05, true, false)
      await ur.movej(firstJoints, 1.4, 1.05, true, false)

      ur.disconnect()
    })

    it('should operate (movej relative = true) without any issue', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()

      let firstJoints = await ur.getj()
      await ur.movej([Math.PI / 2, 0, 0, 0, 0, 0], 1.4, 1.05, true, true)
      await ur.movej([-Math.PI / 2, 0, 0, 0, 0, 0], 1.4, 1.05, true, true)

      ur.disconnect()
    })

    it('should operate (movep) without any issue', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()

      let firstPos = await ur.getl()
      let targetPos = [firstPos[0] + 0.01, firstPos[1] + 0.1, firstPos[2], firstPos[3], firstPos[4], firstPos[5]]
      await ur.movep(targetPos, 1.2, 0.25, 0.05)
      await ur.movel(firstPos, 0.1, 0.1, true, false)

      ur.disconnect()
    })

    it('should operate (servoc) without any issue', async () => {
      var ur = new UrRobot(ROBOT_IP)
      await ur.connect()

      let firstPos = await ur.getl()
      let targetPos = [firstPos[0] + 0.1, firstPos[1] + 0.1, firstPos[2] + 0.1, firstPos[3], firstPos[4], firstPos[5]]
      await ur.servoc(targetPos, 1.2, 0.25, 0.05)
      await ur.movel(firstPos, 0.1, 0.1, true, false)

      ur.disconnect()
    })

    // it('should operate (movec) without any issue', async () => {
    //   var ur = new UrRobot(ROBOT_IP)
    //   await ur.connect()
    //   await sleep(1000)

    //   let firstPos = await ur.getl()
    //   let viaPos = [firstPos[0], firstPos[1] + 0.3, firstPos[2], firstPos[3], firstPos[4], firstPos[5]]
    //   let targetPos = [firstPos[0] + 0.01, firstPos[1] + 0.01, firstPos[2], firstPos[3], firstPos[4], firstPos[5]]
    //   await ur.movec(viaPos, targetPos, 1.2, 0.25, 0.01, 1)
    //   await ur.movel(firstPos, 0.1, 0.1, true, false)

    //   ur.disconnect()
    // })
  })
})
