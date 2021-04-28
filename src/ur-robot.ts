import { Socket } from 'net'
import { PromiseSocket } from 'promise-socket'
import AwaitLock from 'await-lock'
import { UrSecondaryMonitor } from './ur-secmon'
import { UrSecondaryMonitorParser } from './ur-secmon-parser'

export class UrRobot {
  private _dictLock
  private _progQueueLock
  private _secmon: UrSecondaryMonitor
  private _maxFloatLength: number = 6

  constructor(serverIp) {
    this._dictLock = new AwaitLock()
    this._progQueueLock = new AwaitLock()

    this._secmon = new UrSecondaryMonitor(serverIp)
  }

  async isRunning() {
    return await this._secmon.isRunning(true)
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

  async waitForMove(target, threshold = 0, timeout = 5, joints = false) {
    let startDist = await this.getDist(target, joints)
    if (threshold === 0) {
      threshold = startDist * 0.8
      if (threshold < 0.001) {
        threshold = 0.001
      }
    }

    let count = 0
    let dist = 0
    while (true) {
      let running = await this.isRunning()
      if (!running) {
        throw new Error('Robot stopped')
      }
      dist = await this.getDist(target, joints)
      let prgramRunning = await this._secmon.isProgramRunning()
      if (!prgramRunning) {
        if (dist < threshold) {
          break
        }
        count += 1
        if (count > timeout * 10) {
          throw new Error(
            `Goal not reached but no program has been running for ${timeout} seconds. dist is ${dist}, threshold is ${threshold}, target is ${target}, current pose is ${await this.getLines()}`
          )
        } else {
          count = 0
        }
      }
    }
  }

  async speedl(vel, acc, min_time) {
    if (vel.length < 6) {
      throw new Error('invalid arguements')
    }
    var prog = `speedl([${vel[0]},${vel[1]},${vel[2]},${vel[3]},${vel[4]},${vel[5]}], ${acc}, ${min_time})`
    await this.sendMessage(prog)
  }

  async speedj(vel, acc, min_time) {
    if (vel.length < 6) {
      throw new Error('invalid arguements')
    }
    var prog = `speedj([${vel[0]},${vel[1]},${vel[2]},${vel[3]},${vel[4]},${vel[5]}], ${acc}, ${min_time})`
    await this.sendMessage(prog)
  }

  formatMove(command, tpose, acc, vel, radius = 0, prefix = '') {
    return `${command}(${prefix}[${tpose[0]},${tpose[1]},${tpose[2]},${tpose[3]},${tpose[4]},${tpose[5]}], a=${acc}, v=${vel}, r=${radius})`
  }

  async movej(joints, acc = 0.1, vel = 0.05, wait = true, relative = false, threshold = null) {
    if (joints.length < 6) {
      throw new Error('invalid arguements')
    }
    if (relative) {
      let currJoints = this.getJoints()
      for (let ii = 0; ii < 6; ii++) {
        joints[ii] += currJoints[ii]
      }
    }

    let prog = this.formatMove('movej', joints, acc, vel)
    await this.sendProgram(prog)
    if (wait) {
      await this.waitForMove(joints.slice(0, 6), threshold, 5, true)
    }
  }

  async movex(command, tpose, acc = 0.01, vel = 0.01, wait = true, relative = false, threshold = null) {
    if (tpose.length < 6) {
      throw new Error('invalid arguements')
    }
    if (relative) {
      let currLines = this.getLines()
      for (let ii = 0; ii < 6; ii++) {
        tpose[ii] += currLines[ii]
      }
    }
    let prog = this.formatMove(command, tpose, acc, vel, 0, 'p')
    await this.sendProgram(prog)
    if (wait) {
      await this.waitForMove(tpose.slice(0, 6), (threshold = threshold))
    }
  }

  async movel(tpose, acc = 0.01, vel = 0.01, wait = true, relative = false, threshold = null) {
    return await this.movex('movel', tpose, acc, vel, wait, relative, threshold)
  }

  async movep(tpose, acc = 0.01, vel = 0.01, wait = true, relative = false, threshold = null) {
    return await this.movex('movep', tpose, acc, vel, wait, relative, threshold)
  }

  async servoc(tpose, acc = 0.01, vel = 0.01, wait = true, relative = false, threshold = null) {
    return await this.movex('servoc', tpose, acc, vel, wait, relative, threshold)
  }

  async movec(poseVia, poseTo, acc = 0.01, vel = 0.01, wait = true, threshold = null) {
    let prog = `movec(p[${poseVia[0]}, ${poseVia[1]}, ${poseVia[2]}, ${poseVia[3]}, ${poseVia[4]}, ${poseVia[5]}], p[${poseTo[0]},${poseTo[1]}, ${poseTo[2]}, ${poseTo[3]}, ${poseTo[4]}, ${poseTo[5]}], a=${acc}, v=${vel}, r=0)`
    await this.sendProgram(prog)
    if (wait) {
      await this.waitForMove(poseTo, threshold, 5, true)
    }
  }

  async stopl(acc = 0.5) {
    await this.sendProgram(`stopl(${acc})`)
  }

  async stopj(acc = 1.5) {
    await this.sendProgram(`stopj(${acc})`)
  }

  async stop() {
    await this.stopj()
  }

  close() {
    this._secmon.disconnect()
  }

  async setFreeDive(val, timeout = 60) {
    if (val) {
      await this.sendProgram(`def myProg():\r\n\tfreedrive_mode()\r\n\tsleep(${timeout})\r\nend`)
    } else {
      await this.sendProgram(`def myProg():\n\tend_freedrive_mode()\nend`)
    }
  }

  async setSimulation(val) {
    if (val) {
      await this.sendProgram('set sim')
    } else {
      await this.sendProgram('set real')
    }
  }

  async translate(vect, acc = 0.01, vel = 0.01, wait = true, command = 'movel') {
    if (vect.length < 3) {
      throw new Error('invalid arguements')
    }
    let pose = this.getLines()
    for (let ii = 0; ii < 3; ii++) {
      pose[ii] += vect[ii]
    }
    await this.movex(command, pose, vel, acc, wait)
  }

  async up(z = 0.05, acc = 0.01, vel = 0.01) {
    let pose = this.getLines()
    pose[2] += z
    this.movel(pose, acc, vel)
  }

  async down(z = 0.05, acc = 0.01, vel = 0.01) {
    this.up(-z, acc, vel)
  }
}
