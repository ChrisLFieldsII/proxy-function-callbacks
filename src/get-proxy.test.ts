import test from 'ava'
import sinon from 'sinon'

import { getFnCbProxy } from './get-proxy'

class NameManager {
  names: string[] = []

  addName = (name: string) => {
    this.names.push(name)
  }
}

let nameManager = new NameManager()
let onBefore = sinon.spy()
let onSuccess = sinon.spy()
let onError = sinon.spy()
let onAfter = sinon.spy()
let proxy = getFnCbProxy({
  target: nameManager,
  onBefore,
  onSuccess,
  onAfter,
  onError,
})

test.beforeEach(() => {
  nameManager = new NameManager()
  onBefore = sinon.spy()
  onSuccess = sinon.spy()
  onError = sinon.spy()
  onAfter = sinon.spy()
  proxy = getFnCbProxy({
    target: nameManager,
    onBefore,
    onSuccess,
    onAfter,
    onError,
  })
})

test.afterEach(() => {
  sinon.restore()
})

test('sync - success - callbacks called in order', (t) => {
  proxy.addName('cri')

  t.true(onBefore.calledOnce)
  t.true(onSuccess.calledOnce)
  t.true(onAfter.calledOnce)
  t.true(onError.notCalled)
  sinon.assert.callOrder(onBefore, onSuccess, onAfter)
})

// test('sync - error - callbacks called in order', () => {

// })
