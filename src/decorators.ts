export const mutex = (target: Object, property: string, descriptor: TypedPropertyDescriptor<any>): any => {
  const method = descriptor.value

  descriptor.value = async function (...args) {
    await this.lock.acquireAsync()
    var retval = await method.apply(this, args)
    this.lock.release()

    return retval
  }

  return descriptor
}
