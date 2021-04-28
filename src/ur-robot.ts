import { Socket } from 'net'
import { PromiseSocket } from 'promise-socket'
import AwaitLock from 'await-lock'
import { UrSecondaryMonitor } from './ur-secmon'
import { UrSecondaryMonitorParser } from './ur-secmon-parser'

export class UrRobot {
  private _dictLock
  private _progQueueLock
  private _secmon: UrSecondaryMonitor

  constructor(serverIp) {
    this._dictLock = new AwaitLock()
    this._progQueueLock = new AwaitLock()

    this._secmon = new UrSecondaryMonitor(serverIp)
  }

  isRunning() {
    return this._secmon.isRunning(true)
  }

  async sendProgram(program) {
    await this._secmon.sendProgram(program)
  }

  async setTcp(x, y, z, u, v, w) {
    var prog = `set_tcp(p[${x}, ${y}, ${z}, ${u}, ${v}, ${w}])`
    await this.sendProgram(prog)
  }

  async setPayload(weight, cog = undefined) {
    var prog =
      cog && cog.length >= 3 ? `set_payload(${weight}, (${cog[0]},${cog[1]},${cog[2]}))` : `set_payload(${weight})`
    await this.sendProgram(prog)
  }

  async setGravity(grv1, grv2, grv3) {
    var prog = `set_gravity([${grv1}, ${grv2}, ${grv3}])`
    await this.sendProgram(prog)
  }

  async sendMessage(message) {
    var prog = `textmsg(${message})`
    await this.sendProgram(prog)
  }

  async setDigitalOutput(port, val) {
    let convVal = val ? 'True' : 'False'
    var prog = `digital_out[${port}]=${convVal}`
    await this.sendProgram(prog)
  }

  async getAnalogInput(nb, wait = false) {
    return this._secmon.getAnalogIn(nb, wait)
  }

  async getDigitalInBits() {
    return this._secmon.getDigitalInBits()
  }

  async getDigitalIn(nb) {
    return this._secmon.getDigitialIn(nb)
  }

  async getDigitalOutput(val, wait = false) {
    return this._secmon.getDigitalOut(val, wait)
  }

  async getDigitalOutputBits(wait = false) {
    return this._secmon.getDigitalOutBits(wait)
  }

  async setAnalogOutput(output, val) {
    var prog = `set_analog_out(${output}, ${val})`
    await this.sendMessage(prog)
  }

  async setToolVoltage(val) {
    var prog = `set_tool_voltage(${val})`
    await this.sendMessage(prog)
  }

  async getDist(target, joints = false) {
    return joints ? await this.getJointsDist(target) : await this.getLinesDist(target)
  }

  async getJointsDist(target) {
    let joints = await this.getJoints(true)
    let dist = 0
    for (let ii = 0; ii < 6; ii++) {
      dist += (target[ii] - joints[ii]) ** 2
    }
    return dist ** 0.5
  }

  async getLinesDist(target) {
    let lines = await this.getLines(true)
    let dist = 0
    let ii = 0
    for (ii = 0; ii < 3; ii++) {
      dist += (target[ii] - lines[ii]) ** 2
      dist += ((target[ii + 3] - lines[ii + 3]) / 5) ** 2
    }
    return dist ** 0.5
  }

  async getJoints(wait = false) {
    var joints = await this._secmon.getJointData(wait)
    return [
      joints?.q_actual0,
      joints?.q_actual1,
      joints?.q_actual2,
      joints?.q_actual3,
      joints?.q_actual4,
      joints?.q_actual5
    ]
  }

  async getLines(wait = false) {
    var lines = await this._secmon.getCatesianData(wait)
    return [lines?.X, lines?.Y, lines?.Z, lines?.Rx, lines?.Ry, lines?.Rz]
  }

  // async movec(poseVia, poseTo, acc = 0.01, vel = 0.01, wait = true, threshold = null) {

  // }
}
