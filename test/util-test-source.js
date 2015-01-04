const tokenize = require('glsl-tokenizer/string')
const pretty   = require('./util-pretty')
const assigns  = require('../')

module.exports = function testSource(src, declarations) {
  var tokens = tokenize(src.trim())
  var total  = Object.keys(declarations)
    .reduce((n, key) => n + declarations[key].length, 0)

  assigns(tokens)
  if (process.env.PRETTY) pretty(tokens)

  return (t) => {
    var counter = Object.keys(declarations)
      .reduce((map, key) => { map[key] = 0; return map }, {})

    t.plan(total)

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]
      if (!(token.data in declarations)) continue
      var j = counter[token.data]++
      if (declarations[token.data][j]) {
        t.ok(token.declaration, `${token.data} #${j+1} is a declaration`)
      } else {
        t.ok(!token.declaration, `${token.data} #${j+1} is not a declaration`)
      }
    }
  }
}
