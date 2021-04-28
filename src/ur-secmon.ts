import { Socket } from 'net'
import { PromiseSocket } from 'promise-socket'
import { UrSecondaryMonitorParser } from './ur-secmon-parser'
import { EventEmitter } from 'events'
import VersionCompare from 'semver-compare'
import pEvent = require('p-event')

export class UrSecondaryMonitor {
  public socket: PromiseSocket<Socket>

  private _secMonIp: string
  private _secMonPort: number
  private _parser: UrSecondaryMonitorParser
  private _eventReceive: EventEmitter
  private _running: boolean

  constructor(serverIp) {
    this._secMonIp = serverIp
    this._secMonPort = 30002
    this._running = false

    this._parser = new UrSecondaryMonitorParser()
    this._eventReceive = new EventEmitter()
  }

  async connect(): Promise<void> {
    var socket = new Socket()
    socket.setKeepAlive(true, 60000)
    socket.on('data', data => {
      this._parser.parse(data)
      this._eventReceive.emit('received')
    })

    this.socket = new PromiseSocket(socket)
    await this.socket.connect(this._secMonPort, this._secMonIp)

    console.log(`Connect: Server IP (${this._secMonIp})`)
  }

  disconnect(): void {
    this.socket && this.socket.destroy()
    this.socket = null
  }

  shutdown(): void {
    this.disconnect()
  }

  async sendMessage(buf, size?): Promise<void> {
    await this.socket.write(buf, size || buf.length)
  }

  // TODO: apply mutex and all functions with sendMessage should have an additional decorater like @urscript
  async sendProgram(program: string): Promise<void> {
    program += '\r\n'
    await this.sendMessage(program)
  }

  async recvMessage(chunkSize = 0): Promise<string | Buffer> {
    var message = chunkSize > 0 ? await this.socket.read(chunkSize) : await this.socket.read()
    if (!message) {
      throw new Error('socket closed')
    }
    return message
  }

  async wait(timeout: number = Infinity): Promise<void> {
    await pEvent(this._eventReceive, 'received', { timeout: timeout })
  }

  async getMonitoringData(wait: boolean = false): Promise<any> {
    wait && this.wait()
    return this._parser.getData()
  }

  async getJointData(wait: boolean = false): Promise<any> {
    wait && this.wait()
    let monitoringData = await this.getMonitoringData()
    return monitoringData?.JointData
  }

  async getCatesianData(wait: boolean = false): Promise<any> {
    wait && this.wait()
    let monitoringData = await this.getMonitoringData()
    return monitoringData?.CartesianInfo || {}
  }

  async getDigitalOut(nb: number, wait: boolean = false): Promise<boolean> {
    wait && this.wait()
    let monitoringData = await this.getMonitoringData()
    let discreteOutputs = monitoringData?.MasterBoardData?.digitalOutputBits || 0
    let mask = 1 << nb
    return (discreteOutputs & mask) === mask
  }

  async getDigitalOutBits(wait: boolean = false): Promise<any> {
    wait && this.wait()
    let monitoringData = await this.getMonitoringData()
    return monitoringData?.MasterBoardData?.digitalOutputBits || 0
  }

  async getDigitialIn(nb: number, wait: boolean = false): Promise<boolean> {
    wait && this.wait()
    let monitoringData = await this.getMonitoringData()
    let discreteInputs = monitoringData?.MasterBoardData?.digitalInputBits || 0
    let mask = 1 << nb
    return (discreteInputs & mask) === mask
  }

  async getDigitalInBits(wait: boolean = false): Promise<any> {
    wait && this.wait()
    let monitoringData = await this.getMonitoringData()
    return monitoringData?.MasterBoardData?.digitalInputBits || 0
  }

  async getAnalogIn(nb: number, wait: boolean = false): Promise<any> {
    wait && this.wait()
    let monitoringData = await this.getMonitoringData()
    if (nb === 0) {
      return monitoringData?.MasterBoardData?.analogInput0 || 0
    } else {
      return monitoringData?.MasterBoardData?.analogInput1 || 0
    }
  }

  async isProgramRunning(wait = false): Promise<boolean> {
    wait && this.wait()
    let monitoringData = await this.getMonitoringData()
    return monitoringData?.RobotModeData?.isProgramRunning || false
  }

  async isRunning(wait = false): Promise<boolean> {
    wait && this.wait()
    let robotMode = VersionCompare(this._parser.getVersion(), '3.0') >= 0 ? 7 : 0
    let monitoringData = await this.getMonitoringData()
    let robotModeData = monitoringData?.RobotModeData || {}
    if (
      robotModeData?.robotMode === robotMode &&
      robotModeData.isRealRobotEnabled &&
      !robotModeData.isEmergencyStopped &&
      !robotModeData.isSecurityStopped &&
      robotModeData.isRobotConnected &&
      robotModeData.isPowerOnRobot
    ) {
      this._running = true
    } else {
      this._running = false
    }
    return this._running
  }
}
