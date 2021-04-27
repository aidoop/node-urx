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
}
