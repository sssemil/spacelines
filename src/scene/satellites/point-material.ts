import * as THREE from 'three'

const vertexShader = `
  attribute float size;
  attribute vec3 instanceColor;
  varying vec3 vColor;
  varying float vSize;

  void main() {
    vColor = instanceColor;
    vSize = size;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  varying float vSize;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    float core = 1.0 - smoothstep(0.0, 0.2, dist);

    vec3 color = vColor * (glow * 0.6 + core * 0.4);
    float alpha = glow * 0.8 + core * 0.2;

    gl_FragColor = vec4(color, alpha);
  }
`

export const createPointMaterial = (): THREE.ShaderMaterial =>
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
