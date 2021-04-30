import { expect } from 'chai'
import { ROBOT_IP } from './settings'
import { UrSecondaryMonitorParser } from '../src/ur-secmon-parser'

describe('UrSecondaryMonitorParser', function () {
  describe('Parser', function () {
    this.timeout(10000)

    it('should parse a packet without any problem', async () => {
      let testPacket = Buffer.from(
        '000002cc100000002f0000000001f036c3000101010000000007003ff000000000000000000000000000003ff000000000000000000000fb013fbf8adacea51f073fbf8adacea51f070000000000000000a2f5d6d40000000041cc000000000000fdbff8f645e9f3776cbff8f645e9f3776c00000000000000003f2a4fc90000000041c8000000000000fdbff8f0204dd35dc4bff8f0204dd35dc400000000000000003f723f130000000041c4000000000000fdbff825ddf839c64cbff825ddf839c64c00000000000000003e8dbc6e0000000041c0000000000000fd3ff8e5d68ecbe23c3ff8e5d68ecbe23c0000000000000000ba8c62410000000041bc000000000000fd3fd65c230a3479e23fd65c230a3479e20000000000000000000000000000000041b8000000000000fd00000065043fd44f15e8dcdaa4bfb817fc763e4a2e3fd4343b645d23c9bffea3e7d1351154400342014727dcc7bfb648e8a71de81100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000035090000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004b03000000000000000001010000000000000000000000000000000000003f70624de00000003f70624de000000041c00000424000000000000000000000010000db915f38010101000000250201010000000000000000000000000000000000000000000000000000000000fd0000003d070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003f2eddd1dca0ad500000000908000100010000002b0adb915f3801013f7db53604b3c396bfb46810e3eec8813fd94e01a4140a673fb999999999999a0000001a0b000001c20000000000000000013fc0000040600000000000080c000101',
        'hex'
      )
      let secMonParser = new UrSecondaryMonitorParser()
      let parseResult = secMonParser.parse(testPacket)
      console.log('Parser Result: ')
      console.log(parseResult)

      expect(parseResult['SecondaryClientData'].size, 'packet size').to.equal(716)
      expect(parseResult['RobotModeData'].isRobotConnected, 'isRobotConnected').to.equal(true)
      expect(parseResult['RobotModeData'].isRealRobotEnabled, 'isRealRobotEnabled').to.equal(true)
      expect(parseResult['RobotModeData'].isProgramRunning, 'isProgramRunning').to.equal(false)
      expect(parseResult['JointData'].q_actual0, 'q_actual0').to.be.closeTo(0.12321250481647548, 0.001)
      expect(parseResult['JointData'].q_actual1, 'q_actual1').to.be.closeTo(-1.5601252688133753, 0.001)
      expect(parseResult['JointData'].q_actual5, 'q_target5').to.be.closeTo(0.34937358852940126, 0.001)
      expect(parseResult['CartesianInfo'].X, 'X').to.be.closeTo(0.31732700100421085, 0.001)
      expect(parseResult['CartesianInfo'].Rx, 'Rx').to.be.closeTo(-1.9150159999999987, 0.001)
      expect(parseResult['CartesianInfo'].Y, 'Y').to.be.closeTo(-0.09411600004958906, 0.001)
      expect(parseResult['MasterBoardData'].digitalInputBits, 'digitalInputBits').to.equal(0)
      expect(parseResult['MasterBoardData'].digitalOutputBits, 'digitalOutputBits').to.equal(0)
      expect(parseResult['MasterBoardData'].robotVoltage48V, 'robotVoltage48V').to.equal(48)
    })
  })
})
