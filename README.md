# node-urx
Universal Robot client module for nodejs

## Base code
python-urx: https://github.com/SintefManufacturing/python-urx


## Universal Robots
- Homepage: https://www.universal-robots.com/
- URSim(Simulator): https://www.universal-robots.com/download/software-e-series/simulator-linux/offline-simulator-e-series-ur-sim-for-linux-5100/


## Install

```bash
$ npm install @things-factory/node-urx --save
```

## Examples

Run the examples from the examples directory.

### Moving Robot Arm

```javascript
const { UrRobot, sleep } = require('@things-factory/node-urx')

;(async function () {
  var ur = new UrRobot('192.168.0.34')
  await ur.connect()

  let inputPose = await ur.getl()
  inputPose[2] += 0.1
  await ur.movel(inputPose, 0.1, 0.1, true, false)
  inputPose[2] -= 0.1
  await ur.movel(inputPose, 0.1, 0.1, true, false)
  ur.disconnect()
  console.log('done')
})()
```

## API Documentation
...


## Test

`npm test`.
