import { Socket } from 'net'
import { PromiseSocket } from 'promise-socket'
import AwaitLock from 'await-lock'
import { UrSecondaryMonitorParser } from './ur-secmon-parser'
import pEvent = require('p-event')
import { EventEmitter } from 'events'

export class UrSecondaryMonitor {
  public socket

  private _secMonIp
  private _secMonPort
  private _parser: UrSecondaryMonitorParser
  private _eventReceive

  constructor(serverIp) {
    this._secMonIp = serverIp
    this._secMonPort = 30002

    this._parser = new UrSecondaryMonitorParser()
    this._eventReceive = new EventEmitter()
  }

  async connect() {
    var socket = new Socket()
    socket.setKeepAlive(true, 60000)
    socket.on('data', data => {
      this._parser.parse(data)
      this._eventReceive.emit('received2')
      console.log('.')
    })

    this.socket = new PromiseSocket(socket)
    await this.socket.connect(this._secMonPort, this._secMonIp)

    console.log(`Connect: Server IP (${this._secMonIp})`)
  }

  disconnect() {
    this.socket && this.socket.destroy()
    this.socket = null
  }

  shutdown() {
    this.disconnect()
  }

  async sendMessage(buf, size?) {
    await this.socket.write(buf, size || buf.length)
  }

  // TODO: apply mutex..
  async sendProgram(program: string) {
    program += '\r\n'
    await this.sendMessage(program)
  }

  async recvMessage(chunkSize = 0) {
    var message = chunkSize > 0 ? await this.socket.read(chunkSize) : await this.socket.read()
    if (!message) {
      throw new Error('socket closed')
    }
    return message
  }

  async wait(timeout = Infinity) {
    await pEvent(this._eventReceive, 'received', { timeout: timeout })
  }
}
