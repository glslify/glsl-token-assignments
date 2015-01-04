const tokenize = require('glsl-tokenizer/string')
const test     = require('tape')
const assigns  = require('../')

test('structs: without inline declaration', (t) => {
  var src = `
    struct StructName {
      float x;
      float y;
    };

    StructType a;
    StructType b = StructType(2.0, 2.0);
    uniform StructType[3] c;
  `

  var tokens = tokenize(src)

  assigns(tokens)

  t.plan(12)
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (token.data === 'StructName' || token.data === 'a' || token.data === 'b' || token.data === 'c') {
      t.ok(token.declaration, token.data + ' is a declaration')
      t.ok(!token.structMember, token.data + ' is not a struct member')
    } else
    if (token.data === 'x' || token.data === 'y') {
      t.ok(!token.declaration, token.data + ' is not a declaration')
      t.ok(token.structMember, token.data + ' is a struct member')
    }
  }
})

test('structs: without inline declaration', (t) => {
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
      t.ok(token.declaration, 'StructName is a declaration')
      t.ok(!token.structMember, 'StructName is not a struct member')
    } else
    if (token.data === 'x' || token.data === 'y') {
      t.ok(!token.declaration, token.data + ' is not a declaration')
      t.ok(token.structMember, token.data + ' is a struct member')
    } else
    if (token.data === 'structName') {
      t.ok(token.declaration, 'structName is a declaration')
      t.ok(!token.structMember, 'structName is not a struct member')
    }
  }
})
