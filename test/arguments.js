const testSource = require('./util-test-source')
const test       = require('tape')

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
