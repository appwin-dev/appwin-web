import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { MAX_FRAMES, parseStack } from './stack-parser.ts'

const options = { origin: 'https://shop.example' }

describe('parseStack', () => {
  it('reads Chrome and Edge stacks', () => {
    const stack = [
      'TypeError: Cannot read properties of undefined',
      '    at addToCart (https://shop.example/assets/main.js?v=3:10:5)',
      '    at https://shop.example/assets/main.js:3:1',
      '    at async checkout (https://shop.example/assets/main.js#x:20:7)',
      '    at new Cart (https://cdn.other.example/lib.js:1:2)',
      '    at Array.map (<anonymous>)',
      '    at eval (eval at run (https://shop.example/a.js:1:1), <anonymous>:4:9)',
    ].join('\n')
    const frames = parseStack(stack, options)
    assert.equal(frames.length, 6)
    assert.deepEqual(frames[0], {
      fn: 'addToCart',
      file: '/assets/main.js',
      module: 'https://shop.example',
      line: 10,
      col: 5,
      inApp: true,
    })
    assert.equal(frames[1]?.fn, '')
    assert.equal(frames[1]?.line, 3)
    assert.equal(frames[2]?.fn, 'checkout')
    assert.equal(frames[2]?.file, '/assets/main.js')
    assert.equal(frames[3]?.fn, 'new Cart')
    assert.equal(frames[3]?.inApp, false)
    assert.deepEqual(frames[4], { fn: 'Array.map', file: '<anonymous>', inApp: false })
    assert.deepEqual(frames[5], { fn: 'eval', file: '<anonymous>', line: 4, col: 9, inApp: false })
  })

  it('reads Firefox stacks', () => {
    const stack = [
      'addToCart@https://shop.example/assets/main.js?token=secret:10:5',
      'async*checkout@https://shop.example/assets/main.js:20:7',
      '@https://shop.example/assets/main.js:3:1',
      'run@https://shop.example/a.js line 2 > eval:4:9',
      '',
    ].join('\n')
    const frames = parseStack(stack, options)
    assert.equal(frames.length, 4)
    assert.equal(frames[0]?.file, '/assets/main.js')
    assert.equal(frames[1]?.fn, 'checkout')
    assert.equal(frames[2]?.fn, '')
    assert.equal(frames[3]?.file, '/a.js')
  })

  it('reads Safari stacks', () => {
    const stack = [
      'addToCart@https://shop.example/assets/main.js:10:5',
      'map@[native code]',
      'global code@https://shop.example/:1:1',
    ].join('\n')
    const frames = parseStack(stack, options)
    assert.equal(frames.length, 3)
    assert.deepEqual(frames[1], { fn: 'map', file: '[native code]', inApp: false })
    assert.equal(frames[2]?.fn, 'global code')
    assert.equal(frames[2]?.inApp, true)
  })

  it('keeps third-party and dependency code out of the app frames', () => {
    const stack = [
      '    at a (https://shop.example/node_modules/.vite/deps/react.js:1:1)',
      '    at b (chrome-extension://abcdef/content.js:1:1)',
      '    at c (https://shop.example/app.js:1:1)',
    ].join('\n')
    const frames = parseStack(stack, options)
    assert.deepEqual(
      frames.map((frame) => frame.inApp),
      [false, false, true],
    )
    assert.equal(frames[1]?.module, 'chrome-extension://abcdef')
  })

  it('caps the number of frames', () => {
    const stack = Array.from(
      { length: 300 },
      (_, i) => `    at f${i} (https://shop.example/a.js:${i}:1)`,
    ).join('\n')
    assert.equal(parseStack(stack, options).length, MAX_FRAMES)
  })

  it('returns nothing for an empty or unknown stack', () => {
    assert.deepEqual(parseStack(undefined, options), [])
    assert.deepEqual(parseStack('just a message', options), [])
  })
})
