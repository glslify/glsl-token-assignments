const tokenize = require('glsl-tokenizer/string')
const test     = require('tape')
const assigns  = require('../')

test('function arguments', testSource(`
  float aFunction(vec2 a, vec3 b, float c) {
    float z = 1.0;
    return z;
  }

  Thing xFunction(vec2 d, Thing e[2], Thing f, Thing g[2][5]);
  Thing xFunction(vec2 d, Thing e[2], Thing f, Thing g[2][5]) {
    Thing y = Thing(2.0);
    return y;
  }

  Another yFunction(
      float i
    , float j
    , float k
  );
`, {
    a: [true]
  , b: [true]
  , c: [true]
  , z: [true, false]
  , aFunction: [true]
  , xFunction: [true, true]
  , yFunction: [true]
  , d: [true, true]
  , e: [true, true]
  , f: [true, true]
  , g: [true, true]
  , y: [true, false]
  , i: [true]
  , j: [true]
  , k: [true]
  , Thing: new Array(10).map(() => false)
}))

function testSource(src, definitions) {
  var tokens = tokenize(src.trim())
  var total  = Object.keys(definitions)
    .reduce((n, key) => n + definitions[key].length, 0)

  assigns(tokens)

  if (!process.browser) {
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]
      if (token.definition) process.stderr.write('~')
      process.stderr.write(token.data)
      if (token.definition) process.stderr.write('~')
    }
  }

  return (t) => {
    var counter = Object.keys(definitions)
      .reduce((map, key) => { map[key] = 0; return map }, {})

    t.plan(total)

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]
      if (!(token.data in definitions)) continue
      var j = counter[token.data]++
      if (definitions[token.data][j]) {
        t.ok(token.definition, `${token.data} #${j+1} is a definition`)
      } else {
        t.ok(!token.definition, `${token.data} #${j+1} is not a definition`)
      }
    }
  }
}
