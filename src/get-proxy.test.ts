import test from 'ava'
import sinon from 'sinon'

import { getFnCbProxy } from './get-proxy'

const ERROR_TAG = 'ERROR'

class NameManager {
  names: string[] = []

  addName = (name: string) => {
    this.names.push(name)
  }

  throwError = () => {
    throw new Error(ERROR_TAG)
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

test.beforeEach(() => {
  const spies = [onBefore, onSuccess, onError, onAfter]
  spies.forEach((spy) => spy.resetHistory())
  nameManager = new NameManager()
  proxy = getFnCbProxy({
    target: nameManager,
    onBefore,
    onSuccess,
    onAfter,
    onError,
  })
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
