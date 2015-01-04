const tokenize = require('glsl-tokenizer/string')
const test     = require('tape')
const assigns  = require('../')

test('comma-separated variables', (t) => {
  var src = `
    uniform vec4 a, b = vec4(1.0), c;
    vec3 m = sin(vec3(1., vec2(.5))), n;

    struct Struct1 {
      float x, y, z;
    };

    struct Struct2 {
      float l;
    } i, j, k;
  `

  var tokens = tokenize(src)

  assigns(tokens)

  t.plan(24)
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (token.data === 'a' || token.data === 'b' || token.data === 'c' || token.data === 'm' || token.data === 'n') {
      t.ok(token.definition, token.data + ' is a definition')
      t.ok(!token.structMember, token.data + ' is not a struct member')
    } else
    if (token.data === 'x' || token.data === 'y' || token.data === 'z' || token.data === 'l') {
      t.ok(!token.definition, token.data + ' is not a definition')
      t.ok(token.structMember, token.data + ' is a struct member')
    } else
    if (token.data === 'i' || token.data === 'j' || token.data === 'k') {
      t.ok(token.definition, token.data + ' is a definition')
      t.ok(!token.structMember, token.data + ' is not a struct member')
    }
  }
})
