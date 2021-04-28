"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrSecondaryMonitor = void 0;
const net_1 = require("net");
const promise_socket_1 = require("promise-socket");
const ur_secmon_parser_1 = require("./ur-secmon-parser");
const events_1 = require("events");
const semver_compare_1 = __importDefault(require("semver-compare"));
const pEvent = require("p-event");
class UrSecondaryMonitor {
    constructor(serverIp) {
        this._secMonIp = serverIp;
        this._secMonPort = 30002;
        this._running = false;
        this._parser = new ur_secmon_parser_1.UrSecondaryMonitorParser();
        this._eventReceive = new events_1.EventEmitter();
    }
    async connect() {
        var socket = new net_1.Socket();
        socket.setKeepAlive(true, 60000);
        socket.on('data', data => {
            this._parser.parse(data);
            this._eventReceive.emit('received');
        });
        this.socket = new promise_socket_1.PromiseSocket(socket);
        await this.socket.connect(this._secMonPort, this._secMonIp);
        console.log(`Connect: Server IP (${this._secMonIp})`);
    }
    disconnect() {
        this.socket && this.socket.destroy();
        this.socket = null;
    }
    shutdown() {
        this.disconnect();
    }
    async sendMessage(buf, size) {
        await this.socket.write(buf, size || buf.length);
    }
    // TODO: apply mutex and all functions with sendMessage should have an additional decorater like @urscript
    async sendProgram(program) {
        program += '\r\n';
        await this.sendMessage(program);
    }
    async recvMessage(chunkSize = 0) {
        var message = chunkSize > 0 ? await this.socket.read(chunkSize) : await this.socket.read();
        if (!message) {
            throw new Error('socket closed');
        }
        return message;
    }
    async wait(timeout = Infinity) {
        await pEvent(this._eventReceive, 'received', { timeout: timeout });
    }
    async getMonitoringData(wait = false) {
        wait && this.wait();
        return this._parser.getData();
    }
    async getJointData(wait = false) {
        wait && this.wait();
        let monitoringData = await this.getMonitoringData();
        return monitoringData === null || monitoringData === void 0 ? void 0 : monitoringData.JointData;
    }
    async getCatesianData(wait = false) {
        wait && this.wait();
        let monitoringData = await this.getMonitoringData();
        return (monitoringData === null || monitoringData === void 0 ? void 0 : monitoringData.CartesianInfo) || {};
    }
    async getDigitalOut(nb, wait = false) {
        var _a;
        wait && this.wait();
        let monitoringData = await this.getMonitoringData();
        let discreteOutputs = ((_a = monitoringData === null || monitoringData === void 0 ? void 0 : monitoringData.MasterBoardData) === null || _a === void 0 ? void 0 : _a.digitalOutputBits) || 0;
        let mask = 1 << nb;
        return (discreteOutputs & mask) === mask;
    }
    async getDigitalOutBits(wait = false) {
        var _a;
        wait && this.wait();
        let monitoringData = await this.getMonitoringData();
        return ((_a = monitoringData === null || monitoringData === void 0 ? void 0 : monitoringData.MasterBoardData) === null || _a === void 0 ? void 0 : _a.digitalOutputBits) || 0;
    }
    async getDigitialIn(nb, wait = false) {
        var _a;
        wait && this.wait();
        let monitoringData = await this.getMonitoringData();
        let discreteInputs = ((_a = monitoringData === null || monitoringData === void 0 ? void 0 : monitoringData.MasterBoardData) === null || _a === void 0 ? void 0 : _a.digitalInputBits) || 0;
        let mask = 1 << nb;
        return (discreteInputs & mask) === mask;
    }
    async getDigitalInBits(wait = false) {
        var _a;
        wait && this.wait();
        let monitoringData = await this.getMonitoringData();
        return ((_a = monitoringData === null || monitoringData === void 0 ? void 0 : monitoringData.MasterBoardData) === null || _a === void 0 ? void 0 : _a.digitalInputBits) || 0;
    }
    async getAnalogIn(nb, wait = false) {
        var _a, _b;
        wait && this.wait();
        let monitoringData = await this.getMonitoringData();
        if (nb === 0) {
            return ((_a = monitoringData === null || monitoringData === void 0 ? void 0 : monitoringData.MasterBoardData) === null || _a === void 0 ? void 0 : _a.analogInput0) || 0;
        }
        else {
            return ((_b = monitoringData === null || monitoringData === void 0 ? void 0 : monitoringData.MasterBoardData) === null || _b === void 0 ? void 0 : _b.analogInput1) || 0;
        }
    }
    async isProgramRunning(wait = false) {
        var _a;
        wait && this.wait();
        let monitoringData = await this.getMonitoringData();
        return ((_a = monitoringData === null || monitoringData === void 0 ? void 0 : monitoringData.RobotModeData) === null || _a === void 0 ? void 0 : _a.isProgramRunning) || false;
    }
    async isRunning(wait = false) {
        wait && this.wait();
        let robotMode = semver_compare_1.default(this._parser.getVersion(), '3.0') >= 0 ? 7 : 0;
        let monitoringData = await this.getMonitoringData();
        let robotModeData = (monitoringData === null || monitoringData === void 0 ? void 0 : monitoringData.RobotModeData) || {};
        if ((robotModeData === null || robotModeData === void 0 ? void 0 : robotModeData.robotMode) === robotMode &&
            robotModeData.isRealRobotEnabled &&
            !robotModeData.isEmergencyStopped &&
            !robotModeData.isSecurityStopped &&
            robotModeData.isRobotConnected &&
            robotModeData.isPowerOnRobot) {
            this._running = true;
        }
        else {
            this._running = false;
        }
        return this._running;
    }
}
exports.UrSecondaryMonitor = UrSecondaryMonitor;
//# sourceMappingURL=ur-secmon.js.map