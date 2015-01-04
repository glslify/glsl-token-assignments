const tokenize = require('glsl-tokenizer/string')
const test     = require('tape')
const assigns  = require('../')

test('simple: assignment', (t) => {
  var src = 'x = 1.0;'
  var tokens = tokenize(src)

  assigns(tokens)

  t.plan(1)
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].data !== 'x') continue
    t.ok(tokens[i].assignment, 'x is an assignment')
  }
})

test('simple: declaration', (t) => {
  var src = 'float x;'
  var tokens = tokenize(src)

  assigns(tokens)

  t.plan(1)
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].data !== 'x') continue
    t.ok(tokens[i].declaration, 'x is an declaration')
  }
})

test('simple: declaration + assignment', (t) => {
  var src = 'float x = 1.0;'
  var tokens = tokenize(src)

  assigns(tokens)

  t.plan(2)
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].data !== 'x') continue
    t.ok(tokens[i].declaration, 'x is an declaration')
    t.ok(tokens[i].assignment, 'x is an assignment')
  }
})
