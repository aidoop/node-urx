"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutex = void 0;
exports.mutex = (target, property, descriptor) => {
    const method = descriptor.value;
    descriptor.value = async function (...args) {
        await this.lock.acquireAsync();
        var retval = await method.apply(this, args);
        this.lock.release();
        return retval;
    };
    return descriptor;
};
//# sourceMappingURL=decorators.js.map