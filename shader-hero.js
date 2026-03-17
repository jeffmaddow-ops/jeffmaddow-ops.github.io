/**
 * shader-hero.js
 * WebGL2 animated shader background for the hero section.
 * Adapted from the vaib215/shaders-hero-section technique.
 */
(function () {
  'use strict';

  const VS = /* glsl */ `#version 300 es
precision highp float;

in vec2 a_position;
out vec2 v_uv;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_uv = a_position * 0.5 + 0.5;
}`;

  const FS = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;

// --- Helpers ---
float hash21(vec2 p) {
  p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

vec2 rot2d(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Blob orbits — each blob traces a Lissajous path over time
vec2 getPosition(int idx, float t) {
  float a = float(idx) * 0.37;
  float b = 0.6 + mod(float(idx), 3.0) * 0.3;
  float c = 0.8 + mod(float(idx + 1), 4.0) * 0.25;
  return 0.5 + 0.5 * vec2(sin(t * b + a), cos(t * c + a * 1.5));
}

void main() {
  // Portfolio colour palette
  // [0] brass #C09050  [1] deep blue #374B8C
  // [2] purple #644178 [3] teal #3C6E64
  // [4] warm black (base)
  vec3 cols[5];
  cols[0] = vec3(0.753, 0.565, 0.314);
  cols[1] = vec3(0.216, 0.314, 0.549);
  cols[2] = vec3(0.392, 0.255, 0.471);
  cols[3] = vec3(0.235, 0.431, 0.392);
  cols[4] = vec3(0.10,  0.06,  0.02);

  float t = u_time * 0.28;

  // Grain seed
  vec2 grainUV = v_uv * 5.5;
  float grain    = valueNoise(grainUV);
  float grainOff = 0.06 * (grain - 0.5);

  // Organic distortion — warp the sample UV
  vec2 uv = v_uv;
  float radius  = length(uv - 0.5);
  float center  = 1.0 - smoothstep(0.0, 1.0, radius);
  const float D = 0.28;
  for (float i = 1.0; i <= 2.0; i++) {
    uv.x += D * center / i * sin(t + i * 0.4 * smoothstep(0.0, 1.0, uv.y))
                           * cos(0.2 * t + i * 2.4 * smoothstep(0.0, 1.0, uv.y));
    uv.y += D * center / i * cos(t + i * 2.0 * smoothstep(0.0, 1.0, uv.x));
  }

  // Swirl towards the edges
  vec2 uvS = uv - 0.5;
  uvS = rot2d(uvS, -3.0 * 0.22 * smoothstep(0.0, 1.0, radius));
  uvS += 0.5;

  // Inverse-distance weighted colour blend
  vec3  color       = vec3(0.0);
  float totalWeight = 0.0;
  for (int i = 0; i < 5; i++) {
    vec2  pos    = getPosition(i, t) + grainOff;
    float dist   = length(uvS - pos);
    dist         = pow(dist, 5.0);
    float weight = 1.0 / (dist + 1e-3);
    color        += cols[i] * weight;
    totalWeight  += weight;
  }
  color /= totalWeight;

  // Subtle colour-grain overlay
  vec3 gCol = vec3(
    valueNoise(rot2d(grainUV, 1.0)),
    valueNoise(rot2d(grainUV + 10.0, 2.0)),
    valueNoise(grainUV - 2.0)
  );
  color = mix(color, gCol, 0.03);

  // Keep dark — hero content must stay legible
  color *= 0.78;

  fragColor = vec4(color, 1.0);
}`;

  // ─── Bootstrap ────────────────────────────────────────────────────────────

  function init() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: 'default',
      depth: false,
      stencil: false,
    });

    if (!gl) {
      // Graceful fallback — the CSS gradient background remains visible
      console.warn('shader-hero: WebGL2 unavailable, using CSS fallback.');
      return;
    }

    // ── Compile ──────────────────────────────────────────────────────────────
    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('shader-hero compile error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, VS);
    const fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('shader-hero link error:', gl.getProgramInfoLog(prog));
      return;
    }

    // ── Geometry — full-screen triangle strip ─────────────────────────────
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc  = gl.getAttribLocation(prog, 'a_position');
    const timeLoc = gl.getUniformLocation(prog, 'u_time');

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // ── Resize ───────────────────────────────────────────────────────────────
    let raf = null;

    function resize() {
      // Cap pixel ratio at 2.0 for full retina sharpness
      const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
      const w   = canvas.clientWidth;
      const h   = canvas.clientHeight;
      const pw  = Math.floor(w * dpr);
      const ph  = Math.floor(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width  = pw;
        canvas.height = ph;
        gl.viewport(0, 0, pw, ph);
      }
    }

    // ── Render loop ──────────────────────────────────────────────────────────
    let t0 = null;

    function render(ts) {
      if (!t0) t0 = ts;
      const elapsed = (ts - t0) * 0.001;

      gl.useProgram(prog);
      gl.bindVertexArray(vao);
      gl.uniform1f(timeLoc, elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      raf = requestAnimationFrame(render);
    }

    // ── Start / pause on visibility ──────────────────────────────────────────
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(render);
        } else {
          if (raf) { cancelAnimationFrame(raf); raf = null; }
        }
      });
    }, { threshold: 0 });
    obs.observe(canvas);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
