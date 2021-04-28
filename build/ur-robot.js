"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrRobot = void 0;
const await_lock_1 = __importDefault(require("await-lock"));
const ur_secmon_1 = require("./ur-secmon");
class UrRobot {
    constructor(serverIp) {
        this._dictLock = new await_lock_1.default();
        this._progQueueLock = new await_lock_1.default();
        this._secmon = new ur_secmon_1.UrSecondaryMonitor(serverIp);
    }
    isRunning() {
        return this._secmon.isRunning(true);
    }
    async sendProgram(program) {
        await this._secmon.sendProgram(program);
    }
    async setTcp(x, y, z, u, v, w) {
        var prog = `set_tcp(p[${x}, ${y}, ${z}, ${u}, ${v}, ${w}])`;
        await this.sendProgram(prog);
    }
    async setPayload(weight, cog = undefined) {
        var prog = cog && cog.length >= 3 ? `set_payload(${weight}, (${cog[0]},${cog[1]},${cog[2]}))` : `set_payload(${weight})`;
        await this.sendProgram(prog);
    }
    async setGravity(grv1, grv2, grv3) {
        var prog = `set_gravity([${grv1}, ${grv2}, ${grv3}])`;
        await this.sendProgram(prog);
    }
    async sendMessage(message) {
        var prog = `textmsg(${message})`;
        await this.sendProgram(prog);
    }
    async setDigitalOutput(port, val) {
        let convVal = val ? 'True' : 'False';
        var prog = `digital_out[${port}]=${convVal}`;
        await this.sendProgram(prog);
    }
    async getAnalogInput(nb, wait = false) {
        return this._secmon.getAnalogIn(nb, wait);
    }
    async getDigitalInBits() {
        return this._secmon.getDigitalInBits();
    }
    async getDigitalIn(nb) {
        return this._secmon.getDigitialIn(nb);
    }
    async getDigitalOutput(val, wait = false) {
        return this._secmon.getDigitalOut(val, wait);
    }
    async getDigitalOutputBits(wait = false) {
        return this._secmon.getDigitalOutBits(wait);
    }
    async setAnalogOutput(output, val) {
        var prog = `set_analog_out(${output}, ${val})`;
        await this.sendMessage(prog);
    }
    async setToolVoltage(val) {
        var prog = `set_tool_voltage(${val})`;
        await this.sendMessage(prog);
    }
    async getDist(target, joints = false) {
        return joints ? await this.getJointsDist(target) : await this.getLinesDist(target);
    }
    async getJointsDist(target) {
        let joints = await this.getJoints(true);
        let dist = 0;
        for (let ii = 0; ii < 6; ii++) {
            dist += (target[ii] - joints[ii]) ** 2;
        }
        return dist ** 0.5;
    }
    async getLinesDist(target) {
        let lines = await this.getLines(true);
        let dist = 0;
        let ii = 0;
        for (ii = 0; ii < 3; ii++) {
            dist += (target[ii] - lines[ii]) ** 2;
            dist += ((target[ii + 3] - lines[ii + 3]) / 5) ** 2;
        }
        return dist ** 0.5;
    }
    async getJoints(wait = false) {
        var joints = await this._secmon.getJointData(wait);
        return [
            joints === null || joints === void 0 ? void 0 : joints.q_actual0,
            joints === null || joints === void 0 ? void 0 : joints.q_actual1,
            joints === null || joints === void 0 ? void 0 : joints.q_actual2,
            joints === null || joints === void 0 ? void 0 : joints.q_actual3,
            joints === null || joints === void 0 ? void 0 : joints.q_actual4,
            joints === null || joints === void 0 ? void 0 : joints.q_actual5
        ];
    }
    async getLines(wait = false) {
        var lines = await this._secmon.getCatesianData(wait);
        return [lines === null || lines === void 0 ? void 0 : lines.X, lines === null || lines === void 0 ? void 0 : lines.Y, lines === null || lines === void 0 ? void 0 : lines.Z, lines === null || lines === void 0 ? void 0 : lines.Rx, lines === null || lines === void 0 ? void 0 : lines.Ry, lines === null || lines === void 0 ? void 0 : lines.Rz];
    }
}
exports.UrRobot = UrRobot;
//# sourceMappingURL=ur-robot.js.map