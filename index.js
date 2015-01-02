var assignments = require('./assignments')

module.exports = assigns

function assigns(tokens) {
  var enterStruct = false
  var inStruct    = false

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    token.assignment   = false
    token.definition   = false
    token.structMember = false

    // Distinguish struct definitions, e.g.
    // struct A {
    //   float definition1;
    //   float definition2;
    // }
    var type = token.type
    var data = token.data
    if (type === 'keyword' && data === 'struct') enterStruct = true
    if (type === 'operator' && data === '{' && enterStruct) inStruct = true
    if (type === 'operator' && data === '}') {
      inStruct = false
      enterStruct = false
    }

    // Only target identifiers and builtins, e.g.
    // float x;
    // gl_FragColor = vec4(1);
    if (type !== 'ident' && type !== 'builtin') continue

    // Determine if a value has been assigned, e.g.
    // x = 1.0;
    // float x = 1.0;
    do {
      var j = i

      skipWhitespace(+1)
      if (tokens[j].type !== 'operator') break
      if (!assignments[tokens[j].data]) break
      token.assignment = true
    } while(false)

    // Determine if a value is a new variable definition, e.g.
    // float x;
    // float x = 1.0;
    do {
      var j = i

      skipWhitespace(-1)
      if (!tokens[j]) break
      if (tokens[j].type !== 'keyword' && tokens[j].type !== 'ident') break
      token.definition = !inStruct
      token.structMember = inStruct
    } while(false)

    // Special case for inline struct definitions, e.g.
    // struct Thing {
    //   float x;
    //   float y;
    // } definition;
    if (!token.definition) do {
      var j = i

      skipWhitespace(-1)
      if (!tokens[j]) break
      if (tokens[j].type !== 'operator') break
      if (tokens[j].data !== '}') break
      while (tokens[--j] && tokens[j].data !== '{');

      skipWhitespace(-1)
      if (!tokens[j]) break

      skipWhitespace(-1)
      if (!tokens[j]) break
      if (tokens[j].type !== 'keyword') break
      if (tokens[j].data !== 'struct') break
      token.definition = true
    } while(false)
  }

  return tokens

  function skipWhitespace(n) {
    while (tokens[j += n] && tokens[j].type === 'whitespace');
  }
}
