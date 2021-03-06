import test from 'ava'
import isPromise from 'is-promise'
import sinon from 'sinon'

import { getFnCbProxy } from './get-proxy'

const ERROR_TAG = 'ERROR'

class NameManager {
  names: string[] = []

  addName = (name: string) => {
    this.names.push(name)
  }

  addNameAsync = (name: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.addName(name)
        resolve()
      }, 1500)
    })
  }

  getRandomName = () => {
    return this.names[Math.floor(Math.random() * this.names.length)]
  }

  getRandomNameAsync = () => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(this.getRandomName())
      }, 1500)
    })
  }

  throwError = () => {
    throw new Error(ERROR_TAG)
  }

  throwAsyncError = () => {
    return new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(new Error(ERROR_TAG))
      }, 1500)
    })
  }
}

let nameManager = new NameManager()
const onBefore = sinon.spy()
const onSuccess = sinon.spy()
const onError = sinon.spy()
const onAfter = sinon.spy()
let proxy = getFnCbProxy({
  target: nameManager,
  onBefore,
  onSuccess,
  onAfter,
  onError,
})

const spies = [onBefore, onSuccess, onError, onAfter]
function resetSpies() {
  spies.forEach((spy) => spy.resetHistory())
}
test.beforeEach(() => {
  resetSpies()
  nameManager = new NameManager()
  proxy = getFnCbProxy({
    target: nameManager,
    onBefore,
    onSuccess,
    onAfter,
    onError,
  })
})

test.serial('access non-function property', (t) => {
  const names = proxy.names
  t.deepEqual(names, [])
  t.true(onBefore.notCalled)
  t.true(onError.notCalled)
  t.true(onAfter.notCalled)
  t.true(onSuccess.notCalled)
})

test.serial('access non-existent property', (t) => {
  // @ts-ignore
  const shouldBeUndefined = proxy.shouldBeUndefined
  t.is(shouldBeUndefined, undefined)
  t.true(onBefore.notCalled)
  t.true(onError.notCalled)
  t.true(onAfter.notCalled)
  t.true(onSuccess.notCalled)
})

test.serial('sync - success - callbacks called in order', (t) => {
  proxy.addName('cri')

  t.true(onBefore.calledOnce)
  t.true(onSuccess.calledOnce)
  t.true(onAfter.calledOnce)
  t.true(onError.notCalled)
  sinon.assert.callOrder(onBefore, onSuccess, onAfter)
})

test.serial('sync - error - callbacks called in order', (t) => {
  t.throws(() => proxy.throwError(), {
    message: ERROR_TAG,
  })

  t.true(onBefore.calledOnce, 'onBefore')
  t.true(onSuccess.notCalled, 'onSuccess')
  t.true(onError.calledOnce, 'onError')
  t.true(onAfter.calledOnce, 'onAfter')
  sinon.assert.callOrder(onBefore, onError, onAfter)
})

test.serial('async - success - callbacks called in order', async (t) => {
  const res = proxy.addNameAsync('cri')
  t.true(isPromise(res))
  await res

  t.true(onBefore.calledOnce)
  t.true(onSuccess.calledOnce)
  t.true(onAfter.calledOnce)
  t.true(onError.notCalled)
  sinon.assert.callOrder(onBefore, onSuccess, onAfter)
})

test.serial('async - error - callbacks called in order', async (t) => {
  await t.throwsAsync(() => proxy.throwAsyncError(), {
    message: ERROR_TAG,
  })

  t.true(onBefore.calledOnce, 'onBefore')
  t.true(onSuccess.notCalled, 'onSuccess')
  t.true(onError.calledOnce, 'onError')
  t.true(onAfter.calledOnce, 'onAfter')
  sinon.assert.callOrder(onBefore, onError, onAfter)
})

test.serial('sync - verify onSuccess callback data', (t) => {
  proxy.addName('cri')
  proxy.addName('bayla')
  const name = proxy.getRandomName()

  t.true(onSuccess.calledWith(sinon.match({ data: name })))
})

test.serial('sync - verify onError callback data', (t) => {
  const error = t.throws(() => proxy.throwError(), {
    message: ERROR_TAG,
  })

  t.true(onError.calledWith(sinon.match({ error })))
})

test.serial('async - verify onSuccess callback data', async (t) => {
  const name = await proxy.getRandomNameAsync()

  t.true(onSuccess.calledWith(sinon.match({ data: name })))
})

test.serial('async - verify onError callback data', async (t) => {
  const error = await t.throwsAsync(() => proxy.throwAsyncError(), {
    message: ERROR_TAG,
  })

  t.true(onError.calledWith(sinon.match({ error })))
})
