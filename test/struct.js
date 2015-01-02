const tokenize = require('glsl-tokenizer/string')
const test     = require('tape')
const assigns  = require('../')

test('structs: without inline definition', (t) => {
  var src = `
    struct StructName {
      float x;
      float y;
    };
  `

  var tokens = tokenize(src)

  assigns(tokens)

  t.plan(6)
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (token.data === 'StructName') {
      t.ok(token.definition, 'StructName is a definition')
      t.ok(!token.structMember, token.data + ' is not a struct member')
    } else
    if (token.data === 'x' || token.data === 'y') {
      t.ok(!token.definition, token.data + ' is not a definition')
      t.ok(token.structMember, token.data + ' is a struct member')
    }
  }
})

test('structs: without inline definition', (t) => {
  var src = `
    struct StructName {
      float x;
      float y;
    } structName;
  `

  var tokens = tokenize(src)

  assigns(tokens)

  t.plan(8)
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (token.data === 'StructName') {
      t.ok(token.definition, 'StructName is a definition')
      t.ok(!token.structMember, 'StructName is not a struct member')
    } else
    if (token.data === 'x' || token.data === 'y') {
      t.ok(!token.definition, token.data + ' is not a definition')
      t.ok(token.structMember, token.data + ' is a struct member')
    } else
    if (token.data === 'structName') {
      t.ok(token.definition, 'structName is a definition')
      t.ok(!token.structMember, 'structName is not a struct member')
    }
  }
})
