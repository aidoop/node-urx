import PythonStruct from 'python-struct'
import VersionCompare from 'semver-compare'

export class UrSecondaryMonitorParser {
  private _version: string
  private _monitoringData: any

  constructor() {
    this._version = '0.0'
    this._monitoringData = {}
  }

  getVersion(): string {
    return this._version
  }

  getData() {
    return this._monitoringData
  }

  parse(data) {
    var result = {}
    while (data.length > 0) {
      var { packetSize, packetType, packetData, nextData } = this.parseHeaderData(data)
      data = nextData
      // console.log('packet Size: ', packetSize)
      // console.log('packet Type: ', packetType)
      // console.log('packet Data: ', packetData)
      // console.log('data: ', data.length)
      if (packetType === 16) {
        result['SecondaryClientData'] = this.parsePacketData(packetData, '!iB', ['size', 'type'])
        data = packetData.slice(5)
      } else if (packetType === 0) {
        result['RobotModeData'] = this.parsePacketData(packetData, '!iB', ['size', 'type'])
        if (packetSize === 38) {
          this._version = '3.0'
          result['RobotModeData'] = this.parsePacketData(packetData, '!IBQ???????BBdd', [
            'size',
            'type',
            'timestamp',
            'isRobotConnected',
            'isRealRobotEnabled',
            'isPowerOnRobot',
            'isEmergencyStopped',
            'isSecurityStopped',
            'isProgramRunning',
            'isProgramPaused',
            'robotMode',
            'controlMode',
            'speedFraction',
            'speedScaling'
          ])
        } else if (packetSize === 46) {
          this._version = '3.2'
          result['RobotModeData'] = this.parsePacketData(packetData, '!IBQ???????BBdd', [
            'size',
            'type',
            'timestamp',
            'isRobotConnected',
            'isRealRobotEnabled',
            'isPowerOnRobot',
            'isEmergencyStopped',
            'isSecurityStopped',
            'isProgramRunning',
            'isProgramPaused',
            'robotMode',
            'controlMode',
            'speedFraction',
            'speedScaling',
            'speedFractionLimit'
          ])
        } else if (packetSize === 47) {
          this._version = '3.5'
          result['RobotModeData'] = this.parsePacketData(packetData, '!IBQ???????BBddc', [
            'size',
            'type',
            'timestamp',
            'isRobotConnected',
            'isRealRobotEnabled',
            'isPowerOnRobot',
            'isEmergencyStopped',
            'isSecurityStopped',
            'isProgramRunning',
            'isProgramPaused',
            'robotMode',
            'controlMode',
            'speedFraction',
            'speedScaling',
            'speedFractionLimit',
            'reservedByUR'
          ])
        } else {
          result['RobotModeData'] = this.parsePacketData(packetData, '!iBQ???????Bd', [
            'size',
            'type',
            'timestamp',
            'isRobotConnected',
            'isRealRobotEnabled',
            'isPowerOnRobot',
            'isEmergencyStopped',
            'isSecurityStopped',
            'isProgramRunning',
            'isProgramPaused',
            'robotMode',
            'speedFraction'
          ])
        }
      } // (packetType === 0)
      else if (packetType === 1) {
        let tmpNames = ['size', 'type']
        for (var ii = 0; ii < 6; ii++) {
          tmpNames.push(
            `q_actual${ii}`,
            `q_target${ii}`,
            `qd_actual${ii}`,
            `I_actual${ii}`,
            `V_actual${ii}`,
            `T_motor${ii}`,
            `T_micro${ii}`,
            `jointMode${ii}`
          )
        }
        result['JointData'] = this.parsePacketData(
          packetData,
          '!iB dddffffB dddffffB dddffffB dddffffB dddffffB dddffffB',
          tmpNames
        )
      } //packetType === 1
      else if (packetType === 4) {
        if (VersionCompare(this._version, '3.2') === -1) {
          result['CartesianInfo'] = this.parsePacketData(packetData, 'iBdddddd', [
            'size',
            'type',
            'X',
            'Y',
            'Z',
            'Rx',
            'Ry',
            'Rz'
          ])
        } else {
          result['CartesianInfo'] = this.parsePacketData(packetData, 'iBdddddddddddd', [
            'size',
            'type',
            'X',
            'Y',
            'Z',
            'Rx',
            'Ry',
            'Rz',
            'tcpOffsetX',
            'tcpOffsetY',
            'tcpOffsetZ',
            'tcpOffsetRx',
            'tcpOffsetRy',
            'tcpOffsetRz'
          ])
        }
      } // (packetType === 4)
      else if (packetType === 5) {
        result['LaserPointer(OBSOLETE)'] = this.parsePacketData(packetData, 'iBddd', ['size', 'type'])
      } // (packetType === 5)
      else if (packetType === 3) {
        let fmt = ''
        if (VersionCompare(this._version, '3.0') >= 0) {
          fmt = 'iBiibbddbbddffffBBb'
        } else {
          fmt = 'iBhhbbddbbddffffBBb'
        }
        result['MasterBoardData'] = this.parsePacketData(packetData, fmt, [
          'size',
          'type',
          'digitalInputBits',
          'digitalOutputBits',
          'analogInputRange0',
          'analogInputRange1',
          'analogInput0',
          'analogInput1',
          'analogInputDomain0',
          'analogInputDomain1',
          'analogOutput0',
          'analogOutput1',
          'masterBoardTemperature',
          'robotVoltage48V',
          'robotCurrent',
          'masterIOCurrent'
        ])
      } // (packetType === 5)
      else if (packetType === 2) {
        result['ToolData'] = this.parsePacketData(packetData, 'iBbbddfBffB', [
          'size',
          'type',
          'analoginputRange2',
          'analoginputRange3',
          'analogInput2',
          'analogInput3',
          'toolVoltage48V',
          'toolOutputVoltage',
          'toolCurrent',
          'toolTemperature',
          'toolMode'
        ])
      } // (packetType === 2)
      else if (packetType === 9) {
        continue
      } // (packetType === 9)
      else if (packetType === 8 && VersionCompare(this._version, '3.2') >= 0) {
        result['AdditionalInfo'] = this.parsePacketData(packetData, 'iB??', [
          'size',
          'type',
          'teachButtonPressed',
          'teachButtonEnabled'
        ])
      } // (packetType === 8)
      else if (packetType === 7 && VersionCompare(this._version, '3.2') >= 0) {
        result['ForceModeData'] = this.parsePacketData(packetData, 'iBddddddd', [
          'size',
          'type',
          'x',
          'y',
          'z',
          'rx',
          'ry',
          'rz',
          'robotDexterity'
        ])
      } // (packetType === 8)
      else if (packetType === 20) {
        var robotMessage = this.parsePacketData(packetData, '!iB Qbb', [
          'size',
          'type',
          'timestamp',
          'source',
          'robotMessageType'
        ])

        if (robotMessage['robotMessageType'] === 3) {
          result['VersionMessage'] = this.parsePacketData(packetData, '!iBQbb bAbBBiAb', [
            'size',
            'type',
            'timestamp',
            'source',
            'robotMessageType',
            'projectNameSize',
            'projectName',
            'majorVersion',
            'minorVersion',
            'svnRevision',
            'buildDate'
          ])
        } else if (robotMessage['robotMessageType'] === 6) {
          result['robotCommMessage'] = this.parsePacketData(packetData, '!iBQbb iiAc', [
            'size',
            'type',
            'timestamp',
            'source',
            'robotMessageType',
            'code',
            'argument',
            'messageText'
          ])
        } else if (robotMessage['robotMessageType'] === 1) {
          result['labelMessage'] = this.parsePacketData(packetData, '!iBQbb iAc', [
            'size',
            'type',
            'timestamp',
            'source',
            'robotMessageType',
            'id',
            'messageText'
          ])
        } else if (robotMessage['robotMessageType'] === 2) {
          result['popupMessage'] = this.parsePacketData(packetData, '!iBQbb ??BAcAc', [
            'size',
            'type',
            'timestamp',
            'source',
            'robotMessageType',
            'warning',
            'error',
            'titleSize',
            'messageTitle',
            'messageText'
          ])
        } else if (robotMessage['robotMessageType'] === 0) {
          result['messageText'] = this.parsePacketData(packetData, '!iBQbb Ac', [
            'size',
            'type',
            'timestamp',
            'source',
            'robotMessageType',
            'messageText'
          ])
        } else if (robotMessage['robotMessageType'] === 8) {
          result['varMessage'] = this.parsePacketData(packetData, '!iBQbb iiBAcAc', [
            'size',
            'type',
            'timestamp',
            'source',
            'robotMessageType',
            'code',
            'argument',
            'titleSize',
            'messageTitle',
            'messageText'
          ])
        } else if (robotMessage['robotMessageType'] === 7) {
          result['keyMessage'] = this.parsePacketData(packetData, '!iBQbb iiBAcAc', [
            'size',
            'type',
            'timestamp',
            'source',
            'robotMessageType',
            'code',
            'argument',
            'titleSize',
            'messageTitle',
            'messageText'
          ])
        } else if (robotMessage['robotMessageType'] === 5) {
          result['keyMessage'] = this.parsePacketData(packetData, '!iBQbb iiAc', [
            'size',
            'type',
            'timestamp',
            'source',
            'robotMessageType',
            'code',
            'argument',
            'messageText'
          ])
        } else {
          // too much logs
          //console.log(`Message type parser not implemented ${robotMessage}`)
        }
      } // (packetType === 20)
      else {
        // too much logs
        // console.log(`Unknown packet type ${packetType} with size ${packetSize}`)
      }
    }

    this._monitoringData = result
    return result
  }

  parseHeaderData(data): { packetSize; packetType; packetData; nextData } {
    let dataSize = data.length
    if (dataSize < 5) {
      throw `Packet size ${dataSize} smaller than header size (5 bytes)`
    } else {
      var { packetSize, packetType } = this.getHeader(data)
      if (packetSize < 5) {
        throw `Error, declared length of data smaller than its own header(5): ${packetSize}`
      } else if (packetSize > dataSize) {
        throw `Error, length of data smaller ${dataSize} than declared ${packetSize}`
      }
    }

    var packetData = data.slice(0, packetSize)
    var nextData = data.slice(packetSize)

    return {
      packetSize,
      packetType,
      packetData,
      nextData
    }
  }

  getHeader(data): { packetSize; packetType } {
    let header = PythonStruct.unpack('!iB', data)
    return {
      packetSize: header[0],
      packetType: header[1]
    }
  }

  parsePacketData(data, fmt, names): any {
    var formatData = Buffer.from(data)
    fmt.trim()
    var d = {}
    var i = 0
    var j = 0
    while (j < fmt.length && i < names.length) {
      let f = fmt[j]
      if (/ |!|>|</.test(f)) {
        j += 1
      } else if (f === 'A') {
        if (j === fmt.length - 2) {
          var arraySize = formatData.length
        } else {
          var asn = names[i - 1]
          if (!asn.endsWith('Size')) {
            throw `Error, array without size ! ${asn}, ${i}`
          } else {
            arraySize = d[asn]
          }
        }
        d[names[i]] = formatData.slice(0, arraySize)
        formatData = formatData.slice(arraySize)
        j += 2
        i += 1
      } else {
        var fmtSize = PythonStruct.sizeOf(fmt[j])
        if (formatData.length < fmtSize) {
          throw `Error, length of data smaller than advertized: ${formatData.length}, ${fmtSize}, ${names}, ${f}, ${i}, ${j}`
        }
        d[names[i]] = PythonStruct.unpack('!' + f, formatData.slice(0, fmtSize))[0]
        formatData = formatData.slice(fmtSize)
        i += 1
        j += 1
      }
    }
    return d
  }

  findFirstPacket(data) {
    let counter = 0
    let limit = 0
    while (true) {
      if (data.length >= 5) {
        let { packetSize, packetType } = this.getHeader(data)
        if (packetSize < 5 || packetSize > 2000 || packetType !== 16) {
          data = data.slice(1)
          counter += 1
          if (counter > limit) {
            console.log(
              `tried ${counter} times to find a packet in data, advertised packet size: ${packetSize}, type: ${packetType}`
            )
            console.log(`Data length: ${data.length}`)
            limit *= 10
          } else if (data.length >= packetSize) {
            if (counter) {
              console.log(`Remove ${counter} bytes of garbage at begining of packet`)
            }
            return data.slice(0, packetSize)
          } else {
            return null
          }
        }
      } else {
        return null
      }
    }
  }
}
