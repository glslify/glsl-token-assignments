const tokenize = require('glsl-tokenizer/string')
const test     = require('tape')
const assigns  = require('../')

/**
 * glsl-specular-beckmann: @mikolalysenko's GLSL style,
 * multiline function arguments.
 */
test('stackgl/glsl-specular-beckmann/distribution.glsl', testSource(`
float beckmannDistribution(float x, float roughness) {
  float NdotH = max(x, 0.0001);
  float cos2Alpha = NdotH * NdotH;
  float tan2Alpha = (cos2Alpha - 1.0) / cos2Alpha;
  float roughness2 = roughness * roughness;
  float denom = 3.141592653589793 * roughness2 * cos2Alpha * cos2Alpha;
  return exp(tan2Alpha / roughness2) / denom;
}

#pragma glslify: export(beckmannDistribution)
`, {
    NdotH: [true, false, false, false]
  , cos2Alpha: [true, false, false, false, false]
  , tan2Alpha: [true, false]
  , roughness: [true, false, false]
  , beckmannDistribution: [true]
  , roughness2: [true, false]
  , denom: [true, false]
  , x: [true, false]
}))

test('stackgl/glsl-specular-beckmann/index.glsl', testSource(`
#pragma glslify: distribution = require(./distribution.glsl)

float beckmannSpecular(
  vec3 lightDirection,
  vec3 viewDirection,
  vec3 surfaceNormal,
  float roughness) {
  return distribution(dot(surfaceNormal, normalize(lightDirection + viewDirection)), roughness);
}

#pragma glslify: export(beckmannSpecular)
`, {
    beckmannSpecular: [true]
  , lightDirection: [true, false]
  , viewDirection: [true, false]
  , surfaceNormal: [true, false]
  , roughness: [true, false]
  , distribution: [false]
  , normalize: [false]
}))

/**
 * campjs post-processing code.
 * Messy, with a few #define statements to boot
 */
test('hughsk/campjs/shaders/postprocessing.frag', testSource(`
precision mediump float;

uniform sampler2D tScreen;
uniform sampler2D tRays;
uniform sampler2D tLUT1;
uniform sampler2D tLUT2;
uniform float uLUTT;
uniform float uTime;
uniform vec2 uScreenSize;
uniform vec2 uSunPosition;
uniform vec2 uMousePos;
varying vec2 vpos;

#define BLUE #E0ECEF
#define GOD_SAMPLES 30.0
#define GOD_DENSITY 0.005
#define GOD_WEIGHT 0.05
#define GOD_DECAY 0.98
#define NOISE_AMOUNT 0.05

#pragma glslify: square = require(glsl-square-frame)
#pragma glslify: noise  = require(glsl-random)
#pragma glslify: tex3d  = require(./tex3d)

float vignette(vec3 texel, vec2 uv) {
  return max(0.0, dot(uv, uv));
}

void main() {
  // vec2 vPos    = floor(vpos / 0.002) * 0.002;
  vec4 color   = texture2D(tScreen, vpos);
  vec4 rays    = texture2D(tRays, vpos);
  vec4 rayOrig = rays.xyzw;

  vec2 gcoord = gl_FragCoord.xy / uScreenSize;
  vec2 sunPos = uSunPosition;
  vec2 pixPos = square(uScreenSize);
  vec2 gdelta = (
    pixPos - sunPos
  ) * GOD_DENSITY;

  float gdecay = 1.0;

  for (int i = 0; i < int(GOD_SAMPLES); i++) {
    gcoord -= gdelta;

    vec3 gsample = texture2D(tRays, gcoord).xyz;

    gsample *= gdecay * GOD_WEIGHT;
    rays.rgb += gsample;
    gdecay *= GOD_DECAY;
  }

  color.rgb = mix(color.rgb, vec3(1.0), rays.rgb);

  color.rgb = clamp(color.rgb, vec3(0.0), vec3(1.0));
  color.g = 1.0 - color.g;
  color.rgb = mix(
      tex3d(tLUT1, color.brg, 33.0).rgb
    , tex3d(tLUT2, color.brg, 33.0).rgb
    , uLUTT
  );

  color.rgb += (noise(
    gl_FragCoord.xy + fract(uTime * 100.2352)
  ) - 0.5) * NOISE_AMOUNT;

  float vamt = vignette(color.rgb, square(uScreenSize) * 0.34);

  color.rgb = mix(color.rgb, color.rgb - 0.3, vamt);

  gl_FragColor.rgb = color.rgb;
  gl_FragColor.a = 1.0;
}
`, {
    tScreen: [true, false]
  , tRays: [true, false, false]
  , vignette: [true, false]
  , color: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
  , xyzw: [false]
  , gsample: [true, false, false]
  , uv: [true, false, false]
}))

/**
 * glsl-dither: multiple function declarations,
 * excessive use of a single variable.
 */
test('hughsk/glsl-dither/index.glsl', testSource(`
#pragma glslify: luma = require(glsl-luma)

float dither8x8(vec2 position, float brightness) {
  int x = int(mod(position.x, 8.0));
  int y = int(mod(position.y, 8.0));
  int index = x + y * 8;
  float limit = 0.0;

  if (x < 8) {
    if (index == 0) limit = 0.015625;
    if (index == 1) limit = 0.515625;
    if (index == 2) limit = 0.140625;
    if (index == 3) limit = 0.640625;
    if (index == 4) limit = 0.046875;
    if (index == 5) limit = 0.546875;
    if (index == 6) limit = 0.171875;
    if (index == 7) limit = 0.671875;
    if (index == 8) limit = 0.765625;
    if (index == 9) limit = 0.265625;
    if (index == 10) limit = 0.890625;
    if (index == 11) limit = 0.390625;
    if (index == 12) limit = 0.796875;
    if (index == 13) limit = 0.296875;
    if (index == 14) limit = 0.921875;
    if (index == 15) limit = 0.421875;
    if (index == 16) limit = 0.203125;
    if (index == 17) limit = 0.703125;
    if (index == 18) limit = 0.078125;
    if (index == 19) limit = 0.578125;
    if (index == 20) limit = 0.234375;
    if (index == 21) limit = 0.734375;
    if (index == 22) limit = 0.109375;
    if (index == 23) limit = 0.609375;
    if (index == 24) limit = 0.953125;
    if (index == 25) limit = 0.453125;
    if (index == 26) limit = 0.828125;
    if (index == 27) limit = 0.328125;
    if (index == 28) limit = 0.984375;
    if (index == 29) limit = 0.484375;
    if (index == 30) limit = 0.859375;
    if (index == 31) limit = 0.359375;
    if (index == 32) limit = 0.0625;
    if (index == 33) limit = 0.5625;
    if (index == 34) limit = 0.1875;
    if (index == 35) limit = 0.6875;
    if (index == 36) limit = 0.03125;
    if (index == 37) limit = 0.53125;
    if (index == 38) limit = 0.15625;
    if (index == 39) limit = 0.65625;
    if (index == 40) limit = 0.8125;
    if (index == 41) limit = 0.3125;
    if (index == 42) limit = 0.9375;
    if (index == 43) limit = 0.4375;
    if (index == 44) limit = 0.78125;
    if (index == 45) limit = 0.28125;
    if (index == 46) limit = 0.90625;
    if (index == 47) limit = 0.40625;
    if (index == 48) limit = 0.25;
    if (index == 49) limit = 0.75;
    if (index == 50) limit = 0.125;
    if (index == 51) limit = 0.625;
    if (index == 52) limit = 0.21875;
    if (index == 53) limit = 0.71875;
    if (index == 54) limit = 0.09375;
    if (index == 55) limit = 0.59375;
    if (index == 56) limit = 1.0;
    if (index == 57) limit = 0.5;
    if (index == 58) limit = 0.875;
    if (index == 59) limit = 0.375;
    if (index == 60) limit = 0.96875;
    if (index == 61) limit = 0.46875;
    if (index == 62) limit = 0.84375;
    if (index == 63) limit = 0.34375;
  }

  return brightness < limit ? 0.0 : 1.0;
}

vec3 dither8x8(vec2 position, vec3 color) {
  return color * dither8x8(position, luma(color));
}

vec4 dither8x8(vec2 position, vec4 color) {
  return vec4(color.rgb * dither8x8(position, luma(color)), 1.0);
}

#pragma glslify: export(dither8x8)
`, {
  dither8x8: [true, true, false, true, false]
}))

test('https://www.shadertoy.com/view/XsX3RB (Volcanic)', testSource(`
// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

//#define STEREO

float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
	f = f*f*(3.0-2.0*f);

	vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;
	vec2 rg = texture2D( iChannel0, (uv+ 0.5)/256.0, -100.0 ).yx;
	return mix( rg.x, rg.y, f.z );
}

float noise( in vec2 x )
{
    vec2 p = floor(x);
    vec2 f = fract(x);
	vec2 uv = p.xy + f.xy*f.xy*(3.0-2.0*f.xy);
	return texture2D( iChannel0, (uv+118.4)/256.0, -100.0 ).x;
}

#ifdef STEREO
#define lodbias -5.0
#else
#define lodbias 0.0
#endif

vec4 texcube( sampler2D sam, in vec3 p, in vec3 n )
{
	vec4 x = texture2D( sam, p.yz, lodbias );
	vec4 y = texture2D( sam, p.zx, lodbias );
	vec4 z = texture2D( sam, p.xy, lodbias );
	return x*abs(n.x) + y*abs(n.y) + z*abs(n.z);
}

//=====================================================================

float lava( vec2 p )
{
	p += vec2(2.0,4.0);
    float f;
    f  = 0.5000*noise( p ); p = p*2.02;
    f += 0.2500*noise( p ); p = p*2.03;
    f += 0.1250*noise( p ); p = p*2.01;
    f += 0.0625*noise( p );
    return f;
}

const mat3 m = mat3( 0.00,  0.80,  0.60,
                    -0.80,  0.36, -0.48,
                    -0.60, -0.48,  0.64 );

float displacement( vec3 p )
{
	p += vec3(1.0,0.0,0.8);

    float f;
    f  = 0.5000*noise( p ); p = m*p*2.02;
    f += 0.2500*noise( p ); p = m*p*2.03;
    f += 0.1250*noise( p ); p = m*p*2.01;
    f += 0.0625*noise( p );

	float n = noise( p*3.5 );
    f += 0.03*n*n;

    return f;
}

float mapTerrain( in vec3 pos )
{
	return pos.y*0.1 + (displacement(pos*vec3(0.8,1.0,0.8)) - 0.4)*(1.0-smoothstep(1.0,3.0,pos.y));
}

float raymarchTerrain( in vec3 ro, in vec3 rd )
{
	float maxd = 30.0;
    float t = 0.1;
    for( int i=0; i<160; i++ )
    {
	    float h = mapTerrain( ro+rd*t );
        if( h<(0.001*t) || t>maxd ) break;
        t += h;
    }

    if( t>maxd ) t=-1.0;
    return t;
}

vec3 calcNormal( in vec3 pos, in float t )
{
    vec3 eps = vec3( max(0.02,0.001*t),0.0,0.0);
	return normalize( vec3(
           mapTerrain(pos+eps.xyy) - mapTerrain(pos-eps.xyy),
           mapTerrain(pos+eps.yxy) - mapTerrain(pos-eps.yxy),
           mapTerrain(pos+eps.yyx) - mapTerrain(pos-eps.yyx) ) );

}

vec3 lig = normalize( vec3(-0.3,0.4,0.7) );

vec4 mapClouds( in vec3 pos )
{
	vec3 q = pos*0.5 + vec3(0.0,-iGlobalTime,0.0);

	float d;
    d  = 0.5000*noise( q ); q = q*2.02;
    d += 0.2500*noise( q ); q = q*2.03;
    d += 0.1250*noise( q ); q = q*2.01;
    d += 0.0625*noise( q );

	d = d - 0.55;
	d *= smoothstep( 0.5, 0.55, lava(0.1*pos.xz)+0.01 );

	d = clamp( d, 0.0, 1.0 );

	vec4 res = vec4( d );

	res.xyz = mix( vec3(1.0,0.8,0.7), 0.2*vec3(0.4,0.4,0.4), res.x );
	res.xyz *= 0.25;
	res.xyz *= 0.5 + 0.5*smoothstep( -2.0, 1.0, pos.y );

	return res;
}

vec4 raymarchClouds( in vec3 ro, in vec3 rd, in vec3 bcol, float tmax )
{
	vec4 sum = vec4( 0.0 );

	float sun = pow( clamp( dot(rd,lig), 0.0, 1.0 ),6.0 );
	float t = 0.0;
	for( int i=0; i<60; i++ )
	{
		if( t>tmax || sum.w>0.95 ) break;//continue;
		vec3 pos = ro + t*rd;
		vec4 col = mapClouds( pos );

        col.xyz += vec3(1.0,0.7,0.4)*0.4*sun*(1.0-col.w);
		col.xyz = mix( col.xyz, bcol, 1.0-exp(-0.00006*t*t*t) );

		col.rgb *= col.a;

		sum = sum + col*(1.0 - sum.a);

		t += max(0.1,0.05*t);
	}

	sum.xyz /= (0.001+sum.w);

	return clamp( sum, 0.0, 1.0 );
}

float softshadow( in vec3 ro, in vec3 rd, float mint, float k )
{
    float res = 1.0;
    float t = mint;
    for( int i=0; i<48; i++ )
    {
        float h = mapTerrain(ro + rd*t);
		h = max( h, 0.0 );
        res = min( res, k*h/t );
        t += clamp( h, 0.02, 0.5 );
		if( h<0.0001 ) break;
    }
    return clamp(res,0.0,1.0);
}

vec3 path( float time )
{
	return vec3( 16.0*cos(0.2+0.5*.1*time*1.5), 1.5, 16.0*sin(0.1+0.5*0.11*time*1.5) );

}

void main( void )
{
	#ifdef STEREO
	float eyeID = mod(gl_FragCoord.x + mod(gl_FragCoord.y,2.0),2.0);
    #endif

    vec2 q = gl_FragCoord.xy / iResolution.xy;
	vec2 p = -1.0 + 2.0*q;
	p.x *= iResolution.x / iResolution.y;


    // camera
	float off = step( 0.001, iMouse.z )*6.0*iMouse.x/iResolution.x;
	float time = 2.7+iGlobalTime + off;
	vec3 ro = path( time+0.0 );
	vec3 ta = path( time+1.6 );
	//ta.y *= 0.3 + 0.25*cos(0.11*time);
	ta.y *= 0.35 + 0.25*sin(0.09*time);
	float roll = 0.3*sin(1.0+0.07*time);

	// camera tx
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(roll), cos(roll),0.0);
	vec3 cu = normalize(cross(cw,cp));
	vec3 cv = normalize(cross(cu,cw));

	float r2 = p.x*p.x*0.32 + p.y*p.y;
    p *= (7.0-sqrt(37.5-11.5*r2))/(r2+1.0);

	vec3 rd = normalize( p.x*cu + p.y*cv + 2.1*cw );

	#ifdef STEREO
	vec3 fo = ro + rd*7.0; // put focus plane behind Mike
	ro -= 0.2*cu*eyeID;    // eye separation
	rd = normalize(fo-ro);
    #endif

    // sky
	vec3 col = vec3(0.32,0.36,0.4) - rd.y*0.4;
    float sun = clamp( dot(rd,lig), 0.0, 1.0 );
	col += vec3(1.0,0.8,0.4)*0.2*pow( sun, 6.0 );
    col *= 0.9;

	vec3 bcol = col;


    // terrain
	float t = raymarchTerrain(ro, rd);
    if( t>0.0 )
	{
		vec3 pos = ro + t*rd;
		vec3 nor = calcNormal( pos, t );
		vec3 ref = reflect( rd, nor );

		vec3 bn = -1.0 + 2.0*texcube( iChannel0, 3.0*pos/4.0, nor ).xyz;
		nor = normalize( nor + 0.6*bn );

		float hh = 1.0 - smoothstep( -2.0, 1.0, pos.y );

        // lighting
		float sun = clamp( dot( nor, lig ), 0.0, 1.0 );
		float sha = 0.0; if( sun>0.01) sha=softshadow(pos,lig,0.01,32.0);
		float bac = clamp( dot( nor, normalize(lig*vec3(-1.0,0.0,-1.0)) ), 0.0, 1.0 );
		float sky = 0.5 + 0.5*nor.y;
        float lav = smoothstep( 0.5, 0.55, lava(0.1*pos.xz) )*hh*clamp(0.5-0.5*nor.y,0.0,1.0);
		float occ = pow( (1.0-displacement(pos*vec3(0.8,1.0,0.8)))*1.6-0.5, 2.0 );

		float amb = 1.0;

		col = vec3(0.8);

		vec3 lin = vec3(0.0);
		lin += sun*vec3(1.64,1.27,0.99)*pow(vec3(sha),vec3(1.0,1.2,1.5));
		lin += sky*vec3(0.16,0.20,0.28)*occ;
		lin += bac*vec3(0.40,0.28,0.20)*occ;
		lin += amb*vec3(0.18,0.15,0.15)*occ;
		lin += lav*vec3(3.00,0.61,0.00);


        // surface shading/material
		col = texcube( iChannel1, 0.5*pos, nor ).xyz;
		col = col*(0.2+0.8*texcube( iChannel2, 4.0*vec3(2.0,8.0,2.0)*pos, nor ).x);
		vec3 verde = vec3(1.0,0.9,0.2);
		verde *= texture2D( iChannel2, pos.xz, lodbias ).xyz;
		col = mix( col, 0.8*verde, hh );

		float vv = smoothstep( 0.0, 0.8, nor.y )*smoothstep(0.0, 0.1, pos.y-0.8 );
		verde = vec3(0.2,0.45,0.1);
		verde *= texture2D( iChannel2, 30.0*pos.xz, lodbias ).xyz;
		verde += 0.2*texture2D( iChannel2, 1.0*pos.xz, lodbias ).xyz;
		vv *= smoothstep( 0.0, 0.5, texture2D( iChannel2, 0.1*pos.xz + 0.01*nor.x ).x );
		col = mix( col, verde*1.1, vv );

        // light/surface interaction
		col = lin * col;

		// atmospheric
		col = mix( col, (1.0-0.7*hh)*bcol, 1.0-exp(-0.00006*t*t*t) );
	}

	// sun glow
    col += vec3(1.0,0.6,0.2)*0.2*pow( sun, 2.0 )*clamp( (rd.y+0.4)/(0.0+0.4),0.0,1.0);

    // smoke
	{
	if( t<0.0 ) t=600.0;
    vec4 res = raymarchClouds( ro, rd, bcol, t );
	col = mix( col, res.xyz, res.w );
	}

    // gamma
	col = pow( clamp( col, 0.0, 1.0 ), vec3(0.45) );

    // contrast, desat, tint and vignetting
	col = col*0.3 + 0.7*col*col*(3.0-2.0*col);
	col = mix( col, vec3(col.x+col.y+col.z)*0.33, 0.2 );
	col *= 1.3*vec3(1.06,1.1,1.0);
	col *= 0.5 + 0.5*pow( 16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.1 );

    #ifdef STEREO
    col *= vec3( eyeID, 1.0-eyeID, 1.0-eyeID );
	#endif

	gl_FragColor = vec4( col, 1.0 );
}
`, {
  gl_FragColor: [false]
  , time: [true, false, false, true, false, false, false, false]
}))

function testSource(src, declarations) {
  var tokens = tokenize(src.trim())
  var total  = Object.keys(declarations)
    .reduce((n, key) => n + declarations[key].length, 0)

  assigns(tokens)

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
