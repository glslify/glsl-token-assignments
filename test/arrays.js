const tokenize = require('glsl-tokenizer/string')
const test     = require('tape')
const assigns  = require('../')

test('array variables', (t) => {
  var src = `
    float a_1d[5];
    float a_2d[5][2];
    float a_2du[][2];

    float[2] b_1d;
    float[5][2] b_2d;
    float[][2] b_2du;

    float[2] c_1d, d_1d;
    float[] c_1du, d_1du;

    float[2] e_a = float[2](3.0, 4.0, fail_1);
    float[] e_b = float[2](3.0, fail_2, 4.0);
    float[] e_c = float[2](fail_3, 3.0, 4.0), e_d;
    float[] e_e[3], e_f = float[2](fail_4, fail_5, fail_6), e_g[4];
  `

  var tokens = tokenize(src)

  assigns(tokens)

  var declarations = {
      a_1d: true
    , a_2d: true
    , a_2du: true
    , b_1d: true
    , b_2d: true
    , b_2du: true
    , c_1d: true
    , c_1du: true
    , d_1d: true
    , d_1du: true
    , e_a: true
    , e_b: true
    , e_c: true
    , e_d: true
    , e_e: true
    , e_f: true
    , e_g: true
    , fail_1: false
    , fail_2: false
    , fail_3: false
    , fail_4: false
    , fail_5: false
    , fail_6: false
  }

  t.plan(Object.keys(declarations).length)
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (!(token.data in declarations)) continue
    if (declarations[token.data]) {
      t.ok(token.declaration, token.data + ' is a declaration')
    } else {
      t.ok(!token.declaration, token.data + ' is not a declaration')
    }
  }
})
