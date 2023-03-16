const { UrRobot } = require('@things-factory/node-urx')

;(async function () {
  var ur = new UrRobot('192.168.103.135')
  await ur.connect()
  console.log(await ur.getStatus())
  let inputPose = await ur.getl(true)
  console.log('inputPose: ', inputPose)
  inputPose[2] += 0.1
  await ur.movel(inputPose, 0.1, 0.1, true, false)
  // inputPose[2] -= 0.1
  // await ur.movel(inputPose, 0.1, 0.1, true, false)
  ur.disconnect()
  console.log('done')
})()
