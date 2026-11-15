"use client";

import { useEffect, useRef } from "react";

/**
 * Slow, flowing crema-and-roast background, drawn with a small WebGL shader.
 * Runs at half resolution and ~30fps, pauses when the tab is hidden, and draws
 * a single still frame when the device asks for reduced motion.
 */

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
uniform vec2 m;

float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x),
             mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / r;
  vec2 p = (gl_FragCoord.xy - 0.5 * r) / min(r.x, r.y);
  float tt = t * 0.05;

  vec2 q = vec2(fbm(p * 1.3 + tt), fbm(p * 1.3 + vec2(5.2, 1.3) - tt));
  vec2 w = vec2(fbm(p * 1.5 + 2.0 * q + vec2(1.7, 9.2) + 0.8 * tt),
                fbm(p * 1.5 + 2.0 * q + vec2(8.3, 2.8) - 0.7 * tt));
  float f = fbm(p * 1.1 + 2.3 * w);

  vec3 c0 = vec3(0.024, 0.016, 0.012);
  vec3 c1 = vec3(0.16, 0.08, 0.04);
  vec3 c2 = vec3(0.78, 0.45, 0.20);
  vec3 c3 = vec3(0.98, 0.88, 0.76);

  vec3 col = mix(c0, c1, smoothstep(0.22, 0.66, f));
  col = mix(col, c2, smoothstep(0.58, 0.92, f) * 0.5);
  col = mix(col, c3, smoothstep(0.8, 1.0, f * f * 1.25) * 0.22);

  float d = length(uv - m);
  col += vec3(0.95, 0.58, 0.28) * 0.07 * exp(-d * 5.0);

  float v = smoothstep(1.2, 0.15, length(uv - vec2(0.5, 0.7)));
  col *= 0.28 + 0.72 * v;

  gl_FragColor = vec4(col, 1.0);
}`;

export default function Ambient() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power" });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    const uM = gl.getUniformLocation(prog, "m");

    const SCALE = 0.5;
    const resize = () => {
      canvas.width = Math.max(2, Math.floor(window.innerWidth * SCALE));
      canvas.height = Math.max(2, Math.floor(window.innerHeight * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const target = [0.5, 0.65];
    const mouse = [0.5, 0.65];
    const onMove = (e: PointerEvent) => {
      target[0] = e.clientX / window.innerWidth;
      target[1] = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const draw = (seconds: number) => {
      mouse[0] += (target[0] - mouse[0]) * 0.06;
      mouse[1] += (target[1] - mouse[1]) * 0.06;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, seconds);
      gl.uniform2f(uM, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    const start = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return;
      last = now;
      draw((now - start) / 1000 + 20);
    };

    const onVisibility = () => {
      if (reduce) return;
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };

    if (reduce) {
      draw(30);
      window.addEventListener("resize", () => draw(30));
    } else {
      raf = requestAnimationFrame(frame);
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="ambient" aria-hidden />;
}
