//import { UrSecondaryMonitor } from 'ur-secondary-monitor'

secMon = require('./build/ur-secondary-monitor')

secMon = new UrSecondaryMonitor('192.168.0.34')
secMon.connect()

message = secMon.recvMessage(1024)
console.log(message)

secMon.disconnect()
